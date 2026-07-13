<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CampaignRequest;
use App\Models\RequestTimeline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RequestController extends Controller
{
    public function index(Request $request)
    {
        $types = ['campaign' => 'حملة مؤثرين', 'ugc' => 'UGC', 'event' => 'تغطية فعالية', 'consultation' => 'استشارة'];
        $sources = ['direct_client' => 'عميل مباشر', 'project_management' => 'إدارة مشاريع', 'sales' => 'المبيعات', 'external_portal' => 'البوابة الخارجية'];
        $statuses = [
            'new' => 'جديد', 'under_review' => 'قيد المراجعة', 'awaiting_completion' => 'بانتظار الاستكمال',
            'ready_for_nomination' => 'جاهزة للترشيح', 'awaiting_internal_approval' => 'بانتظار الاعتماد',
            'awaiting_collection' => 'بانتظار التحصيل', 'stalled' => 'متعثّرة', 'ready_for_campaign' => 'جاهزة للتحويل', 'converted' => 'محوّلة لحملة',
        ];

        $rows = collect([
            ['id' => 101, 'number' => 'REQ-2026-101', 'title' => 'إطلاق عطر نوفا الصيفي', 'type' => 'campaign', 'source' => 'direct_client', 'group' => 'client', 'group_label' => 'عميل', 'group_color' => '#ec4899', 'category' => 'awaiting_approval', 'status' => 'awaiting_internal_approval', 'priority' => 'high', 'customer_id' => 1, 'customer_name' => 'نوفا للعطور', 'requested_by' => 'رنا المطيري', 'responsible' => 'مدير الحملات', 'next_label' => 'اعتماد الترشيحات', 'last_external_reply' => 'تمت مراجعة القائمة · 07-13', 'last_internal_action' => 'عرض سعر · 07-13', 'budget' => 185000, 'created_at' => now()->subHours(2)->toISOString()],
            ['id' => 102, 'number' => 'REQ-2026-102', 'title' => 'حملة تطبيق فودلي رمضان', 'type' => 'campaign', 'source' => 'sales', 'group' => 'internal', 'group_label' => 'داخلي', 'group_color' => '#8b5cf6', 'category' => 'awaiting_internal', 'status' => 'under_review', 'priority' => 'urgent', 'customer_id' => 2, 'customer_name' => 'Foodly KSA', 'requested_by' => 'فريق المبيعات', 'responsible' => 'سارة العتيبي', 'next_label' => 'مراجعة البريف', 'last_external_reply' => '—', 'last_internal_action' => 'إنشاء · 07-13', 'budget' => 240000, 'created_at' => now()->subHours(4)->toISOString()],
            ['id' => 103, 'number' => 'REQ-2026-103', 'title' => 'تغطية معرض التقنية بالرياض', 'type' => 'event', 'source' => 'project_management', 'group' => 'pm', 'group_label' => 'إدارة مشاريع', 'group_color' => '#3b82f6', 'category' => 'awaiting_external', 'status' => 'awaiting_completion', 'priority' => 'medium', 'customer_id' => 3, 'customer_name' => 'Tech Expo Riyadh', 'requested_by' => 'إدارة المشاريع', 'responsible' => 'العميل', 'next_label' => 'استكمال بيانات الفعالية', 'last_external_reply' => 'سيتم إرسال المواقع · 07-12', 'last_internal_action' => 'طلب استكمال · 07-12', 'budget' => 95000, 'created_at' => now()->subDay()->toISOString()],
            ['id' => 104, 'number' => 'REQ-2026-104', 'title' => 'UGC منتجات العناية Luma', 'type' => 'ugc', 'source' => 'external_portal', 'group' => 'external', 'group_label' => 'خارجي', 'group_color' => '#0d8a6f', 'category' => 'ready_for_campaign', 'status' => 'ready_for_campaign', 'priority' => 'high', 'customer_id' => 4, 'customer_name' => 'Luma Care', 'requested_by' => 'بوابة العميل', 'responsible' => 'العمليات', 'next_label' => 'تحويل إلى حملة', 'last_external_reply' => 'الموافقة النهائية · 07-11', 'last_internal_action' => 'ترشيح صنّاع · 07-11', 'budget' => 76000, 'created_at' => now()->subDays(2)->toISOString()],
            ['id' => 105, 'number' => 'REQ-2026-105', 'title' => 'تفعيل مطعم برجر زون', 'type' => 'campaign', 'source' => 'direct_client', 'group' => 'client', 'group_label' => 'عميل', 'group_color' => '#ec4899', 'category' => 'awaiting_internal', 'status' => 'awaiting_collection', 'priority' => 'medium', 'customer_id' => 5, 'customer_name' => 'Burger Zone', 'requested_by' => 'تركي السبيعي', 'responsible' => 'المالية', 'next_label' => 'تحصيل الدفعة الأولى', 'last_external_reply' => 'موافق على العرض · 07-10', 'last_internal_action' => 'إرسال عرض سعر · 07-10', 'budget' => 54000, 'created_at' => now()->subDays(3)->toISOString()],
            ['id' => 106, 'number' => 'REQ-2026-106', 'title' => 'استشارة دخول TikTok', 'type' => 'consultation', 'source' => 'sales', 'group' => 'internal', 'group_label' => 'داخلي', 'group_color' => '#8b5cf6', 'category' => 'awaiting_internal', 'status' => 'new', 'priority' => 'low', 'customer_id' => 6, 'customer_name' => 'Derma Clinics', 'requested_by' => 'نواف المالكي', 'responsible' => 'التسويق', 'next_label' => 'تحديد موعد', 'last_external_reply' => '—', 'last_internal_action' => 'إنشاء · 07-09', 'budget' => 18000, 'created_at' => now()->subDays(4)->toISOString()],
            ['id' => 107, 'number' => 'REQ-2026-107', 'title' => 'إطلاق متجر أزياء جديد', 'type' => 'campaign', 'source' => 'external_portal', 'group' => 'external', 'group_label' => 'خارجي', 'group_color' => '#0d8a6f', 'category' => 'awaiting_external', 'status' => 'stalled', 'priority' => 'urgent', 'customer_id' => 7, 'customer_name' => 'Misk Fashion', 'requested_by' => 'بوابة العميل', 'responsible' => 'العميل', 'next_label' => 'رد العميل على الميزانية', 'last_external_reply' => 'نحتاج مراجعة داخلية · 07-06', 'last_internal_action' => 'متابعة · 07-08', 'budget' => 120000, 'created_at' => now()->subDays(7)->toISOString()],
            ['id' => 108, 'number' => 'REQ-2026-108', 'title' => 'حملة قهوة مختصة', 'type' => 'campaign', 'source' => 'project_management', 'group' => 'pm', 'group_label' => 'إدارة مشاريع', 'group_color' => '#3b82f6', 'category' => 'ready_for_campaign', 'status' => 'converted', 'priority' => 'medium', 'customer_id' => 8, 'customer_name' => 'Roast Lab', 'requested_by' => 'إدارة المشاريع', 'responsible' => 'منجز', 'next_label' => 'تم التحويل', 'last_external_reply' => 'تم الاعتماد · 07-04', 'last_internal_action' => 'تحويل لحملة · 07-05', 'budget' => 68000, 'created_at' => now()->subDays(8)->toISOString()],
        ]);

        foreach (['status', 'type', 'source'] as $filter) {
            if ($value = $request->query($filter)) {
                $rows = $rows->where($filter, $value)->values();
            }
        }
        if ($q = $request->query('q')) {
            $rows = $rows->filter(fn ($row) => str_contains(mb_strtolower(json_encode($row, JSON_UNESCAPED_UNICODE)), mb_strtolower($q)))->values();
        }

        $all = collect($this->allDemoRows());
        $stats = ['total' => $all->count()] + collect(array_keys($statuses))->mapWithKeys(fn ($s) => [$s => $all->where('status', $s)->count()])->all();
        $stats['internal'] = $all->where('group', 'internal')->count();
        $stats['external'] = $all->whereIn('group', ['client', 'external'])->count();

        return response()->json([
            'data' => $rows->values(),
            'stats' => $stats,
            'options' => [
                'types' => $types,
                'sources' => $sources,
                'statuses' => $statuses,
                'groups' => [
                    ['key' => 'internal', 'label' => 'داخلي', 'count' => $all->where('group', 'internal')->count()],
                    ['key' => 'client', 'label' => 'عميل مباشر', 'count' => $all->where('group', 'client')->count()],
                    ['key' => 'pm', 'label' => 'إدارة مشاريع', 'count' => $all->where('group', 'pm')->count()],
                    ['key' => 'external', 'label' => 'بوابة خارجية', 'count' => $all->where('group', 'external')->count()],
                ],
                'categories' => [
                    ['key' => 'awaiting_external', 'label' => 'بانتظار رد خارجي', 'count' => $all->where('category', 'awaiting_external')->count(), 'color' => '#d97706'],
                    ['key' => 'awaiting_internal', 'label' => 'بانتظار إجراء داخلي', 'count' => $all->where('category', 'awaiting_internal')->count(), 'color' => '#8b5cf6'],
                    ['key' => 'awaiting_approval', 'label' => 'بانتظار اعتماد الترشيحات', 'count' => $all->where('category', 'awaiting_approval')->count(), 'color' => '#3b82f6'],
                    ['key' => 'ready_for_campaign', 'label' => 'جاهزة للتحويل', 'count' => $all->where('category', 'ready_for_campaign')->count(), 'color' => '#16a34a'],
                ],
                'customers' => [
                    ['id' => 1, 'name' => 'نوفا للعطور'], ['id' => 2, 'name' => 'Foodly KSA'], ['id' => 3, 'name' => 'Tech Expo Riyadh'], ['id' => 4, 'name' => 'Luma Care'],
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'type' => 'nullable|string|max:30',
            'source' => 'nullable|string|max:30',
            'customer_id' => 'nullable',
            'priority' => 'nullable|string|max:20',
            'brief' => 'nullable|array',
        ]);

        Log::info('Demo request submission captured', ['payload' => $data, 'user_id' => auth()->id()]);

        return response()->json([
            'ok' => true,
            'message' => 'تم استقبال الطلب التجريبي بنجاح',
            'data' => [
                'id' => random_int(500, 999),
                'number' => 'REQ-' . now()->format('Y') . '-' . strtoupper(Str::random(4)),
                'title' => $data['title'],
                'type' => $data['type'] ?? 'campaign',
                'source' => $data['source'] ?? 'direct_client',
                'group' => 'internal',
                'group_label' => 'داخلي',
                'group_color' => '#8b5cf6',
                'category' => 'awaiting_internal',
                'status' => 'new',
                'priority' => $data['priority'] ?? 'medium',
                'customer_id' => $data['customer_id'] ?? null,
                'customer_name' => 'عميل جديد',
                'requested_by' => auth()->user()->name ?? 'Demo User',
                'responsible' => 'مدير الحملات',
                'next_label' => 'مراجعة البريف',
                'last_external_reply' => '—',
                'last_internal_action' => 'إنشاء الآن',
                'brief' => $data['brief'] ?? [],
                'created_at' => now()->toISOString(),
            ],
        ], 201);
    }

    public function show($id)
    {
        $req = CampaignRequest::with(['messages','timeline','nominations','customer','campaign'])->findOrFail($id);
        return response()->json($req);
    }

    public function update(Request $request, $id)
    {
        Log::info('Demo request update captured', ['id' => $id, 'payload' => $request->all()]);
        return response()->json(['ok' => true, 'id' => $id, 'data' => $request->all()]);
    }

    public function destroy($id)
    {
        return response()->json(['deleted' => true, 'id' => $id]);
    }

    private function allDemoRows(): array
    {
        return [
            ['group' => 'client', 'category' => 'awaiting_approval', 'status' => 'awaiting_internal_approval'],
            ['group' => 'internal', 'category' => 'awaiting_internal', 'status' => 'under_review'],
            ['group' => 'pm', 'category' => 'awaiting_external', 'status' => 'awaiting_completion'],
            ['group' => 'external', 'category' => 'ready_for_campaign', 'status' => 'ready_for_campaign'],
            ['group' => 'client', 'category' => 'awaiting_internal', 'status' => 'awaiting_collection'],
            ['group' => 'internal', 'category' => 'awaiting_internal', 'status' => 'new'],
            ['group' => 'external', 'category' => 'awaiting_external', 'status' => 'stalled'],
            ['group' => 'pm', 'category' => 'ready_for_campaign', 'status' => 'converted'],
        ];
    }
}
