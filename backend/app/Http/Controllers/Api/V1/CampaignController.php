<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Resources\CampaignResource;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        if (Campaign::query()->count() === 0) {
            return response()->json(['data' => ['data' => $this->demoCampaigns()]]);
        }

        $query = Campaign::with(['customer:id,name', 'coordinator:id,name']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($r) => $r->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($customerId = $request->input('customer_id')) {
            $query->where('customer_id', $customerId);
        }

        $query->orderByDesc('start_date')->orderByDesc('created_at');

        return CampaignResource::collection($query->paginate(min((int) $request->input('per_page', 25), 100)));
    }

    public function store(StoreCampaignRequest $request)
    {
        $campaign = Campaign::create($request->validated());

        return response()->json([
            'message' => 'تم إنشاء الحملة بنجاح',
            'data' => new CampaignResource($campaign->fresh()->load(['customer:id,name', 'coordinator:id,name'])),
        ], 201);
    }

    public function show(Campaign $campaign)
    {
        $campaign->load(['customer:id,name', 'coordinator:id,name', 'influencers:id,name,code,platform', 'dailyAds' => fn ($q) => $q->limit(50)]);
        return response()->json(['data' => new CampaignResource($campaign)]);
    }

    public function update(StoreCampaignRequest $request, Campaign $campaign)
    {
        $campaign->update($request->validated());

        return response()->json([
            'message' => 'تم تحديث الحملة بنجاح',
            'data' => new CampaignResource($campaign->fresh()->load(['customer:id,name', 'coordinator:id,name'])),
        ]);
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();
        return response()->json(['message' => 'تم حذف الحملة بنجاح']);
    }

    private function demoCampaigns(): array
    {
        return [
            ['id'=>1,'code'=>'CMP-100','name'=>'إطلاق عطر نوفا الصيفي','customer_id'=>1,'customer'=>['id'=>1,'name'=>'نوفا للعطور'],'start_date'=>'2026-07-08','end_date'=>'2026-07-20','budget'=>125000,'total_cost'=>77500,'total_sale'=>125000,'profit_margin'=>38,'status'=>'active','description'=>'حملة إطلاق متعددة المنصات','objectives'=>'زيادة الوعي والطلبات المباشرة','notes'=>'الأولوية لمحتوى TikTok','influencers_count'=>7,'ads_count'=>18,'coordinator_id'=>1,'coordinator'=>['id'=>1,'name'=>'محمد الحربي'],'tags'=>['TikTok','Snapchat'],'metadata'=>['type'=>'حملة كاملة','social_networks'=>'تيك توك، سناب شات','audience'=>'الرياض وجدة']],
            ['id'=>2,'code'=>'CMP-101','name'=>'حملة تطبيق فودلي رمضان','customer_id'=>2,'customer'=>['id'=>2,'name'=>'Foodly KSA'],'start_date'=>'2026-07-01','end_date'=>'2026-07-18','budget'=>84200,'total_cost'=>52900,'total_sale'=>84200,'profit_margin'=>37.2,'status'=>'paused','description'=>'ترويج عروض رمضان','objectives'=>'رفع التسجيلات الجديدة','notes'=>'بانتظار اعتماد دفعة المؤثرين الثانية','influencers_count'=>5,'ads_count'=>11,'coordinator_id'=>2,'coordinator'=>['id'=>2,'name'=>'أحمد سالم'],'tags'=>['Instagram','Food'],'metadata'=>['type'=>'تغطية','social_networks'=>'إنستقرام، سناب شات','audience'=>'المملكة']],
            ['id'=>3,'code'=>'CMP-102','name'=>'تغطية معرض التقنية','customer_id'=>3,'customer'=>['id'=>3,'name'=>'Tech Expo Riyadh'],'start_date'=>'2026-06-25','end_date'=>'2026-07-03','budget'=>186000,'total_cost'=>121000,'total_sale'=>186000,'profit_margin'=>34.9,'status'=>'completed','description'=>'تغطية حدث مباشر','objectives'=>'تغطية يومية من أرض المعرض','notes'=>'تم التسليم النهائي','influencers_count'=>9,'ads_count'=>26,'coordinator_id'=>3,'coordinator'=>['id'=>3,'name'=>'ليان منصور'],'tags'=>['YouTube','X'],'metadata'=>['type'=>'تغطية','social_networks'=>'يوتيوب، X','audience'=>'المهتمين بالتقنية']],
            ['id'=>4,'code'=>'CMP-103','name'=>'UGC منتجات العناية','customer_id'=>4,'customer'=>['id'=>4,'name'=>'Glow Care'],'start_date'=>'2026-07-10','end_date'=>'2026-07-30','budget'=>68000,'total_cost'=>42100,'total_sale'=>68000,'profit_margin'=>38.1,'status'=>'draft','description'=>'محتوى UGC للمراجعة','objectives'=>'تجارب واقعية للمنتج','notes'=>'قيد اختيار الصنّاع','influencers_count'=>4,'ads_count'=>0,'coordinator_id'=>4,'coordinator'=>['id'=>4,'name'=>'منى السبيعي'],'tags'=>['UGC','Beauty'],'metadata'=>['type'=>'UGC','social_networks'=>'تيك توك، إنستقرام','audience'=>'نساء 18-35']],
            ['id'=>5,'code'=>'CMP-104','name'=>'افتتاح فرع كافيه روز','customer_id'=>5,'customer'=>['id'=>5,'name'=>'Rose Cafe'],'start_date'=>'2026-07-02','end_date'=>'2026-07-09','budget'=>51500,'total_cost'=>33800,'total_sale'=>51500,'profit_margin'=>34.3,'status'=>'cancelled','description'=>'افتتاح فرع جديد','objectives'=>'حضور الافتتاح','notes'=>'تم الإلغاء بطلب العميل','influencers_count'=>3,'ads_count'=>0,'coordinator_id'=>5,'coordinator'=>['id'=>5,'name'=>'خالد ناصر'],'tags'=>['Cafe','Snapchat'],'metadata'=>['type'=>'تغطية','social_networks'=>'سناب شات','audience'=>'جدة']],
        ];
    }
}