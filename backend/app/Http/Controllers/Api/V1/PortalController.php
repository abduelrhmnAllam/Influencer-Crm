<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CampaignRequest;
use App\Models\Nomination;
use App\Models\RequestMessage;
use App\Models\RequestTimeline;
use App\Models\RequestUser;
use App\Support\Tenancy;
use Illuminate\Http\Request;

/** البوابة الخارجية — مصادقة بالتوكن (لا حساب نظام داخلي) */
class PortalController extends Controller
{
    /** يحلّ المستخدم الخارجي من رأس X-Portal-Token ويضبط الوكالة */
    private function user(Request $request): ?RequestUser
    {
        $token = $request->header('X-Portal-Token') ?: $request->query('token');
        if (! $token) return null;
        Tenancy::bypass(true);
        $u = RequestUser::where('token', $token)->first();
        Tenancy::bypass(false);
        if (! $u || ! $u->tokenValid()) return null;
        Tenancy::setAgencyId($u->agency_id); // عزل: يرى وكالته فقط
        return $u;
    }

    public function login(Request $request)
    {
        $u = $this->user($request);
        if (! $u) return response()->json(['message' => 'رمز دخول غير صالح أو منتهٍ'], 401);
        $u->update(['last_login_at' => now()]);
        return response()->json(['user' => $u->only(['id','name','org','user_type','permissions','customer_id'])]);
    }

    public function myRequests(Request $request)
    {
        $u = $this->user($request);
        if (! $u) return response()->json(['message' => 'غير مصرّح'], 401);
        return response()->json(
            CampaignRequest::where('request_user_id', $u->id)->latest()->get()
        );
    }

    public function createRequest(Request $request)
    {
        $u = $this->user($request);
        if (! $u || ! $u->can('create_request')) return response()->json(['message' => 'غير مصرّح'], 403);
        $data = $request->validate(['title' => 'required|string|max:200', 'brief' => 'nullable|array']);
        $req = CampaignRequest::create([
            'agency_id' => $u->agency_id,
            'number' => 'REQ-' . strtoupper(substr(uniqid(), -5)),
            'title' => $data['title'], 'type' => $request->input('type', 'campaign'),
            'source' => $u->user_type === 'client' ? 'external_client' : ($u->user_type === 'project_employee' ? 'project_management' : 'external_user'),
            'customer_id' => $u->customer_id, 'request_user_id' => $u->id, 'requested_by' => $u->name,
            'status' => 'new', 'brief' => $data['brief'] ?? [],
        ]);
        $this->log($req->id, 'request_created', ['by' => $u->name]);
        return response()->json($req, 201);
    }

    public function addMessage(Request $request, $id)
    {
        $u = $this->user($request);
        if (! $u || ! $u->can('add_notes')) return response()->json(['message' => 'غير مصرّح'], 403);
        $req = CampaignRequest::where('request_user_id', $u->id)->findOrFail($id);
        $data = $request->validate(['body' => 'required|string|max:2000']);
        $msg = RequestMessage::create([
            'agency_id' => $u->agency_id, 'request_id' => $req->id,
            'body' => $data['body'], 'visibility' => 'external', 'author' => $u->name,
        ]);
        $this->log($req->id, 'message_external', ['by' => $u->name]);
        return response()->json($msg, 201);
    }

    public function decideNomination(Request $request, $id)
    {
        $u = $this->user($request);
        if (! $u || ! $u->can('approve_nominations')) {
            return response()->json(['message' => 'غير مصرّح'], 403);
        }

        // validation صريح لقيمة القرار
        $data = $request->validate([
            'decision' => 'required|in:approved,rejected,held',
            'notes'    => 'nullable|string|max:1000',
        ]);

        $nom = Nomination::findOrFail($id);

        // إغلاق IDOR: يجب أن يخصّ الترشيح طلباً يملكه هذا المستخدم (أو عميله)
        $req = $nom->request;
        $owns = $req && (
            (int) $req->request_user_id === (int) $u->id
            || ($u->customer_id && (int) $req->customer_id === (int) $u->customer_id)
        );
        if (! $owns) {
            return response()->json(['message' => 'لا تملك صلاحية على هذا الترشيح'], 403);
        }

        $nom->update(['client_decision' => $data['decision'], 'client_notes' => $data['notes'] ?? null]);
        // cost_price مخفي تلقائياً ($hidden) — لا تُكشف التكلفة/الربح للبوابة
        return response()->json($nom);
    }

    private function log($reqId, $action, $payload = [])
    {
        RequestTimeline::create(['request_id' => $reqId, 'action' => $action,
            'actor' => 'portal', 'payload' => $payload, 'happened_at' => now()]);
    }
}
