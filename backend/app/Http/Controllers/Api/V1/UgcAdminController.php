<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class UgcAdminController extends Controller
{
    public function overview(Request $request)
    {
        $data = $this->demoData();
        $overrides = Cache::get($this->cacheKey(), []);

        foreach (['applications', 'submissions', 'campaigns'] as $group) {
            foreach ($data[$group] as &$row) {
                $id = $row['id'];
                if (isset($overrides[$group][$id])) {
                    $row = array_replace_recursive($row, $overrides[$group][$id]);
                }
            }
        }

        return response()->json([
            'data' => $data,
            'message' => 'تم تحميل لوحة UGC بنجاح',
        ]);
    }

    public function applicationDecision(Request $request, string $id)
    {
        $payload = $request->validate([
            'decision' => 'required|in:approved,rejected,pending',
            'note' => 'nullable|string|max:500',
        ]);

        $this->rememberOverride('applications', $id, [
            'status' => $payload['decision'],
            'admin_note' => $payload['note'] ?? null,
            'reviewed_at' => now()->toISOString(),
        ]);

        return response()->json(['message' => $payload['decision'] === 'approved' ? 'تم قبول الطلب بنجاح' : 'تم تحديث حالة الطلب بنجاح']);
    }

    public function submissionStatus(Request $request, string $id)
    {
        $payload = $request->validate([
            'status' => 'required|in:draft,in_review,approved,rejected,published,completed',
            'note' => 'nullable|string|max:500',
        ]);

        $this->rememberOverride('submissions', $id, [
            'status' => $payload['status'],
            'review_note' => $payload['note'] ?? null,
            'reviewed_at' => now()->toISOString(),
        ]);

        return response()->json(['message' => 'تم تحديث حالة المحتوى بنجاح']);
    }

    public function campaignStatus(Request $request, string $id)
    {
        $payload = $request->validate([
            'status' => 'required|in:draft,in_progress,delivering,completed,cancelled',
        ]);

        $this->rememberOverride('campaigns', $id, [
            'status' => $payload['status'],
            'updated_at' => now()->toISOString(),
        ]);

        return response()->json(['message' => 'تم تحديث حملة UGC بنجاح']);
    }

    private function rememberOverride(string $group, string $id, array $payload): void
    {
        $key = $this->cacheKey();
        $data = Cache::get($key, []);
        $data[$group][$id] = array_replace_recursive($data[$group][$id] ?? [], $payload);
        Cache::put($key, $data, now()->addDays(30));
    }

    private function cacheKey(): string
    {
        return 'ugc_admin_demo_overrides:' . (auth()->id() ?: 'guest');
    }

    private function demoData(): array
    {
        $creators = [
            ['id'=>'ugc_cr_001','full_name'=>'سارة العنزي','handle'=>'@sara.creates','city'=>'الرياض','gender'=>'female','level'=>'diamond','verification_status'=>'verified','followers_count'=>820000,'engagement_rate'=>8.7,'completed_jobs'=>48,'avg_rating'=>4.9,'categories'=>['جمال','لايف ستايل','مطاعم'],'prices'=>['home_sell'=>4200,'home_cost'=>2800,'cov_sell'=>6800,'cov_cost'=>4500],'registered_at'=>'2026-07-03T10:00:00Z'],
            ['id'=>'ugc_cr_002','full_name'=>'عبدالله فهد','handle'=>'@abdullah.food','city'=>'جدة','gender'=>'male','level'=>'gold','verification_status'=>'verified','followers_count'=>310000,'engagement_rate'=>7.9,'completed_jobs'=>34,'avg_rating'=>4.7,'categories'=>['مطاعم','سفر'],'prices'=>['home_sell'=>2600,'home_cost'=>1700,'cov_sell'=>4300,'cov_cost'=>2900],'registered_at'=>'2026-07-08T12:30:00Z'],
            ['id'=>'ugc_cr_003','full_name'=>'نورة خالد','handle'=>'@noura.review','city'=>'الدمام','gender'=>'female','level'=>'platinum','verification_status'=>'verified','followers_count'=>455000,'engagement_rate'=>9.1,'completed_jobs'=>39,'avg_rating'=>4.8,'categories'=>['تقنية','تجارب','UGC'],'prices'=>['home_sell'=>3500,'home_cost'=>2300,'cov_sell'=>5200,'cov_cost'=>3600],'registered_at'=>'2026-07-10T08:20:00Z'],
            ['id'=>'ugc_cr_004','full_name'=>'راشد القحطاني','handle'=>'@rashed.tech','city'=>'الرياض','gender'=>'male','level'=>'silver','verification_status'=>'pending','followers_count'=>145000,'engagement_rate'=>5.8,'completed_jobs'=>17,'avg_rating'=>4.4,'categories'=>['تقنية','ألعاب'],'prices'=>['home_sell'=>1900,'home_cost'=>1200,'cov_sell'=>3100,'cov_cost'=>2100],'registered_at'=>'2026-07-11T09:15:00Z'],
            ['id'=>'ugc_cr_005','full_name'=>'هند الشمري','handle'=>'@hind.beauty','city'=>'المدينة','gender'=>'female','level'=>'gold','verification_status'=>'verified','followers_count'=>274000,'engagement_rate'=>8.2,'completed_jobs'=>27,'avg_rating'=>4.6,'categories'=>['جمال','عناية'],'prices'=>['home_sell'=>2400,'home_cost'=>1600,'cov_sell'=>3900,'cov_cost'=>2600],'registered_at'=>'2026-07-12T14:45:00Z'],
            ['id'=>'ugc_cr_006','full_name'=>'يزن السالم','handle'=>'@yazan.games','city'=>'الخبر','gender'=>'male','level'=>'bronze','verification_status'=>'active','followers_count'=>86000,'engagement_rate'=>6.3,'completed_jobs'=>9,'avg_rating'=>4.2,'categories'=>['ألعاب','تقنية'],'prices'=>['home_sell'=>1200,'home_cost'=>800,'cov_sell'=>2100,'cov_cost'=>1400],'registered_at'=>'2026-07-13T07:40:00Z'],
        ];

        $applications = [
            ['id'=>'ugc_app_101','creator_id'=>'ugc_cr_006','creator_name'=>'يزن السالم','status'=>'pending','city'=>'الخبر','category'=>'ألعاب وتقنية','submitted_at'=>'2026-07-13T08:00:00Z','message'=>'أرغب بالانضمام لشبكة UGC وتنفيذ مراجعات ألعاب قصيرة.'],
            ['id'=>'ugc_app_102','creator_id'=>'ugc_cr_004','creator_name'=>'راشد القحطاني','status'=>'pending','city'=>'الرياض','category'=>'تقنية','submitted_at'=>'2026-07-12T16:20:00Z','message'=>'جاهز لتغطيات المعارض التقنية وتصوير unboxing.'],
            ['id'=>'ugc_app_103','creator_id'=>'ugc_cr_005','creator_name'=>'هند الشمري','status'=>'approved','city'=>'المدينة','category'=>'جمال','submitted_at'=>'2026-07-11T11:10:00Z','message'=>'تم قبولها بعد مراجعة البورتفوليو.'],
        ];

        $submissions = [
            ['id'=>'ugc_sub_201','campaign_id'=>'ugc_cmp_301','creator_id'=>'ugc_cr_001','creator_name'=>'سارة العنزي','campaign_name'=>'Glow Care — روتين العناية','status'=>'in_review','platform'=>'tiktok','video_url'=>'https://www.tiktok.com/@sara.creates/video/735201','submitted_at'=>'2026-07-13T06:30:00Z','score'=>92],
            ['id'=>'ugc_sub_202','campaign_id'=>'ugc_cmp_301','creator_id'=>'ugc_cr_005','creator_name'=>'هند الشمري','campaign_name'=>'Glow Care — روتين العناية','status'=>'approved','platform'=>'instagram','video_url'=>'https://www.instagram.com/reel/C9ugc202/','submitted_at'=>'2026-07-12T18:30:00Z','score'=>88],
            ['id'=>'ugc_sub_203','campaign_id'=>'ugc_cmp_302','creator_id'=>'ugc_cr_003','creator_name'=>'نورة خالد','campaign_name'=>'GameLab — تجربة منتج ألعاب','status'=>'in_review','platform'=>'youtube','video_url'=>'https://youtu.be/ugc-gamelab-203','submitted_at'=>'2026-07-12T09:00:00Z','score'=>84],
            ['id'=>'ugc_sub_204','campaign_id'=>'ugc_cmp_303','creator_id'=>'ugc_cr_002','creator_name'=>'عبدالله فهد','campaign_name'=>'Rose Cafe — افتتاح الفرع','status'=>'published','platform'=>'snapchat','video_url'=>'https://www.snapchat.com/add/abdullah.food/story/204','submitted_at'=>'2026-07-10T20:10:00Z','score'=>79],
        ];

        $packages = [
            ['id'=>'ugc_pkg_01','name'=>'باقة تجربة منزلية','pkg_type'=>'home','videos_count'=>5,'duration_days'=>10,'price_sell'=>18000,'price_cost'=>11200,'status'=>'active','description'=>'خمسة فيديوهات UGC قصيرة بتصوير منزلي ومراجعة المنتج.'],
            ['id'=>'ugc_pkg_02','name'=>'باقة تغطية إطلاق','pkg_type'=>'coverage','videos_count'=>8,'duration_days'=>14,'price_sell'=>42000,'price_cost'=>27500,'status'=>'active','description'=>'تغطية إطلاق أو فعالية مع تسليم Reels/Stories متعددة.'],
            ['id'=>'ugc_pkg_03','name'=>'باقة TikTok Boost','pkg_type'=>'tiktok','videos_count'=>12,'duration_days'=>21,'price_sell'=>68000,'price_cost'=>44600,'status'=>'active','description'=>'مجموعة صناع TikTok بمطابقة ذكية وحقوق استخدام شهرية.'],
        ];

        $campaigns = [
            ['id'=>'ugc_cmp_301','name'=>'Glow Care — روتين العناية','customer_name'=>'Glow Care','package_name'=>'باقة تجربة منزلية','status'=>'delivering','start_date'=>'2026-07-08','end_date'=>'2026-07-18','creators'=>[
                ['creator_id'=>'ugc_cr_001','creator_name'=>'سارة العنزي','type_ar'=>'منزلي','price_sell'=>4200,'price_cost'=>2800,'delivery_status'=>'in_review','video_url'=>'https://www.tiktok.com/@sara.creates/video/735201'],
                ['creator_id'=>'ugc_cr_005','creator_name'=>'هند الشمري','type_ar'=>'منزلي','price_sell'=>2400,'price_cost'=>1600,'delivery_status'=>'published','video_url'=>'https://www.instagram.com/reel/C9ugc202/'],
            ]],
            ['id'=>'ugc_cmp_302','name'=>'GameLab — تجربة منتج ألعاب','customer_name'=>'GameLab','package_name'=>'باقة TikTok Boost','status'=>'in_progress','start_date'=>'2026-07-10','end_date'=>'2026-07-28','creators'=>[
                ['creator_id'=>'ugc_cr_003','creator_name'=>'نورة خالد','type_ar'=>'منزلي','price_sell'=>3500,'price_cost'=>2300,'delivery_status'=>'in_review','video_url'=>'https://youtu.be/ugc-gamelab-203'],
                ['creator_id'=>'ugc_cr_006','creator_name'=>'يزن السالم','type_ar'=>'منزلي','price_sell'=>1200,'price_cost'=>800,'delivery_status'=>'pending','video_url'=>''],
            ]],
            ['id'=>'ugc_cmp_303','name'=>'Rose Cafe — افتتاح الفرع','customer_name'=>'Rose Cafe','package_name'=>'باقة تغطية إطلاق','status'=>'completed','start_date'=>'2026-07-01','end_date'=>'2026-07-09','creators'=>[
                ['creator_id'=>'ugc_cr_002','creator_name'=>'عبدالله فهد','type_ar'=>'تغطية','price_sell'=>4300,'price_cost'=>2900,'delivery_status'=>'published','video_url'=>'https://www.snapchat.com/add/abdullah.food/story/204'],
            ]],
        ];

        $transactions = [
            ['id'=>'ugc_tx_401','creator_id'=>'ugc_cr_002','creator_name'=>'عبدالله فهد','type'=>'credit','status'=>'completed','amount'=>2900,'description'=>'دفعة تغطية Rose Cafe','created_at'=>'2026-07-10T10:00:00Z'],
            ['id'=>'ugc_tx_402','creator_id'=>'ugc_cr_005','creator_name'=>'هند الشمري','type'=>'credit','status'=>'pending','amount'=>1600,'description'=>'دفعة محتوى Glow Care','created_at'=>'2026-07-12T12:00:00Z'],
            ['id'=>'ugc_tx_403','creator_id'=>'ugc_cr_001','creator_name'=>'سارة العنزي','type'=>'credit','status'=>'pending','amount'=>2800,'description'=>'دفعة محتوى Glow Care','created_at'=>'2026-07-13T09:00:00Z'],
        ];

        $matches = collect($creators)->map(fn ($creator) => [
            'creator_id' => $creator['id'],
            'creator_name' => $creator['full_name'],
            'handle' => $creator['handle'],
            'city' => $creator['city'],
            'level' => $creator['level'],
            'score' => min(99, (int) round(($creator['engagement_rate'] * 7) + ($creator['avg_rating'] * 6) + min(25, $creator['completed_jobs'] / 2))),
            'breakdown' => ['تفاعل' => round($creator['engagement_rate'] * 10), 'خبرة' => min(100, $creator['completed_jobs'] * 2), 'تقييم' => round($creator['avg_rating'] * 20)],
            'recommended_for' => $creator['categories'][0] ?? 'UGC',
        ])->sortByDesc('score')->values()->all();

        return compact('creators', 'applications', 'submissions', 'packages', 'campaigns', 'transactions', 'matches');
    }
}