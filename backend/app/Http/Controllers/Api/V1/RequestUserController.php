<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RequestUser;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RequestUserController extends Controller
{
    public function index()
    {
        return response()->json(RequestUser::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'org'  => 'nullable|string',
            'email'=> 'nullable|email',
            'phone'=> 'nullable|string',
            'user_type' => 'nullable|string',
            'customer_id' => 'nullable|integer',
            'permissions' => 'nullable|array',
            'expires_in_days' => 'nullable|integer',
        ]);
        $data['token'] = 'rqu_' . Str::random(40);
        $data['token_expires_at'] = ! empty($data['expires_in_days'])
            ? now()->addDays((int) $data['expires_in_days']) : now()->addDays(90);
        $data['permissions'] = $data['permissions'] ?? ['create_request','upload_attachments','add_notes','track_status','approve_nominations','reject_nominations','request_alternative'];
        unset($data['expires_in_days']);
        $u = RequestUser::create($data);
        // يُعاد التوكن مرة واحدة عند الإنشاء فقط
        return response()->json($u->makeVisible('token'), 201);
    }

    public function revokeToken($id)
    {
        $u = RequestUser::findOrFail($id);
        $u->update(['token_revoked' => true]);
        return response()->json(['revoked' => true]);
    }

    public function rotateToken($id)
    {
        $u = RequestUser::findOrFail($id);
        $u->update(['token' => 'rqu_' . Str::random(40), 'token_revoked' => false, 'token_expires_at' => now()->addDays(90)]);
        return response()->json($u->makeVisible('token'));
    }

    public function disable($id) { RequestUser::findOrFail($id)->update(['status' => 'disabled']); return response()->json(['ok' => true]); }
    public function enable($id)  { RequestUser::findOrFail($id)->update(['status' => 'active']);   return response()->json(['ok' => true]); }
}
