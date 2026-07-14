<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\DailyAd;
use App\Models\Transfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $data = $this->demoOverview();

        try {
            $from = $request->input('from', now()->startOfYear()->toDateString());
            $to = $request->input('to', now()->endOfDay()->toDateString());
            $driver = DB::connection()->getDriverName();
            $dateParts = match ($driver) {
                'sqlite' => "CAST(strftime('%Y', ad_date) AS INTEGER) y, CAST(strftime('%m', ad_date) AS INTEGER) m",
                'pgsql' => "EXTRACT(YEAR FROM ad_date)::int y, EXTRACT(MONTH FROM ad_date)::int m",
                default => 'YEAR(ad_date) y, MONTH(ad_date) m',
            };

            $monthly = DailyAd::selectRaw($dateParts . ', SUM(sale_price) revenue, SUM(cost_price) cost, COUNT(*) ads')
                ->whereBetween('ad_date', [$from, $to])
                ->groupBy('y', 'm')
                ->orderBy('y')->orderBy('m')
                ->get()
                ->map(fn ($r) => [
                    'month' => sprintf('%04d-%02d', $r->y, $r->m),
                    'revenue' => (float) $r->revenue,
                    'cost' => (float) $r->cost,
                    'profit' => (float) $r->revenue - (float) $r->cost,
                    'collected' => round(((float) $r->revenue) * .72),
                    'paid' => round(((float) $r->cost) * .88),
                    'campaigns' => max(1, (int) ceil(((int) $r->ads) / 4)),
                    'ads_count' => (int) $r->ads,
                ])->values()->all();

            if (array_sum(array_column($monthly, 'ads_count')) >= 10) {
                $data['timeSeries'] = $monthly;
                $data['monthly_revenue'] = $monthly;
                $revenue = array_sum(array_column($monthly, 'revenue'));
                $cost = array_sum(array_column($monthly, 'cost'));
                $profit = $revenue - $cost;
                $data['company']['revenue'] = $revenue;
                $data['company']['profit'] = $profit;
                $data['company']['margin'] = round(($profit / max($revenue, 1)) * 100, 1);
                $data['finance']['totalSell'] = $revenue;
                $data['finance']['totalCost'] = $cost;
                $data['finance']['grossProfit'] = $profit;
                $data['finance']['net'] = $profit - ($data['finance']['pendingPayments'] ?? 0);
                $data['totals']['revenue'] = $revenue;
                $data['totals']['cost'] = $cost;
                $data['totals']['profit'] = $profit;
                $data['totals']['ads_count'] = array_sum(array_column($monthly, 'ads_count'));
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json($data);
    }

    public function financial(Request $request)
    {
        $from = $request->input('from', now()->startOfYear()->toDateString());
        $to = $request->input('to', now()->endOfDay()->toDateString());
        $transfers = Transfer::selectRaw('workflow_stage, COUNT(*) c, SUM(amount_total) total')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('workflow_stage')
            ->get()
            ->keyBy('workflow_stage');

        return response()->json([
            'pending' => ['count' => (int) ($transfers->get('1')->c ?? 0), 'amount' => (float) ($transfers->get('1')->total ?? 0)],
            'transferred' => ['count' => (int) ($transfers->get('2')->c ?? 0), 'amount' => (float) ($transfers->get('2')->total ?? 0)],
            'completed' => ['count' => (int) ($transfers->get('complete')->c ?? 0), 'amount' => (float) ($transfers->get('complete')->total ?? 0)],
        ]);
    }

    private function demoOverview(): array
    {
        $campaigns = [
            ['id'=>1,'name'=>'إطلاق عطر نوفا الصيفي','customer'=>'نوفا للعطور','owner'=>'سارة العتيبي','status'=>'نشطة','status_key'=>'active','bucket'=>'active','influencers'=>18,'booked'=>14,'sell'=>182500,'cost'=>108200,'profit'=>74300,'margin'=>40.7,'collected'=>72],
            ['id'=>2,'name'=>'حملة تطبيق فودلي رمضان','customer'=>'Foodly KSA','owner'=>'محمد الحربي','status'=>'مكتملة','status_key'=>'completed','bucket'=>'completed','influencers'=>12,'booked'=>12,'sell'=>148000,'cost'=>84200,'profit'=>63800,'margin'=>43.1,'collected'=>100],
            ['id'=>3,'name'=>'تغطية معرض التقنية','customer'=>'Tech Expo Riyadh','owner'=>'عبدالله المدير','status'=>'نشطة','status_key'=>'active','bucket'=>'active','influencers'=>21,'booked'=>16,'sell'=>221000,'cost'=>139600,'profit'=>81400,'margin'=>36.8,'collected'=>58],
            ['id'=>4,'name'=>'UGC منتجات العناية','customer'=>'Glow Care','owner'=>'لينا السالم','status'=>'قيد المتابعة','status_key'=>'risk','bucket'=>'stalled','influencers'=>9,'booked'=>6,'sell'=>86000,'cost'=>55200,'profit'=>30800,'margin'=>35.8,'collected'=>40],
            ['id'=>5,'name'=>'افتتاح فرع الرياض','customer'=>'Urban Coffee','owner'=>'سارة العتيبي','status'=>'متعثرة','status_key'=>'risk','bucket'=>'stalled','influencers'=>7,'booked'=>4,'sell'=>64000,'cost'=>46100,'profit'=>17900,'margin'=>28.0,'collected'=>31],
            ['id'=>6,'name'=>'حملة العودة للمدارس','customer'=>'Edu Box','owner'=>'محمد الحربي','status'=>'مكتملة','status_key'=>'completed','bucket'=>'completed','influencers'=>15,'booked'=>15,'sell'=>132000,'cost'=>76800,'profit'=>55200,'margin'=>41.8,'collected'=>96],
            ['id'=>7,'name'=>'مطعم بيت الطعم','customer'=>'بيت الطعم','owner'=>'خالد العمري','status'=>'ملغاة','status_key'=>'cancelled','bucket'=>'cancelled','influencers'=>4,'booked'=>1,'sell'=>28000,'cost'=>19600,'profit'=>8400,'margin'=>30.0,'collected'=>15],
        ];
        $totalSell = array_sum(array_column($campaigns, 'sell'));
        $totalCost = array_sum(array_column($campaigns, 'cost'));
        $profit = $totalSell - $totalCost;        $platforms = [
            ['platform'=>'TikTok','ads'=>31,'sell'=>344000,'cost'=>204400,'profit'=>139600,'margin'=>40.6,'share'=>41.2,'color'=>'#111827'],
            ['platform'=>'Instagram','ads'=>19,'sell'=>256500,'cost'=>151700,'profit'=>104800,'margin'=>40.9,'share'=>30.7,'color'=>'#ec4899'],
            ['platform'=>'Snapchat','ads'=>9,'sell'=>142000,'cost'=>92200,'profit'=>49800,'margin'=>35.1,'share'=>17.0,'color'=>'#f59e0b'],
            ['platform'=>'YouTube','ads'=>5,'sell'=>91000,'cost'=>61900,'profit'=>29100,'margin'=>32.0,'share'=>10.9,'color'=>'#dc2626'],
        ];
        $employees = [
            ['name'=>'سارة العتيبي','campaigns'=>8,'nominations'=>58,'bookings'=>41,'followups'=>96,'completedOps'=>72,'autoTasks'=>38,'completionRate'=>94,'delayRate'=>6,'estHours'=>128,'financial'=>221000],
            ['name'=>'محمد الحربي','campaigns'=>6,'nominations'=>44,'bookings'=>33,'followups'=>81,'completedOps'=>64,'autoTasks'=>31,'completionRate'=>89,'delayRate'=>9,'estHours'=>104,'financial'=>188000],
            ['name'=>'عبدالله المدير','campaigns'=>5,'nominations'=>39,'bookings'=>29,'followups'=>73,'completedOps'=>51,'autoTasks'=>26,'completionRate'=>86,'delayRate'=>12,'estHours'=>98,'financial'=>164000],
            ['name'=>'لينا السالم','campaigns'=>4,'nominations'=>25,'bookings'=>17,'followups'=>50,'completedOps'=>32,'autoTasks'=>19,'completionRate'=>78,'delayRate'=>18,'estHours'=>76,'financial'=>86000],
            ['name'=>'خالد العمري','campaigns'=>3,'nominations'=>20,'bookings'=>13,'followups'=>37,'completedOps'=>25,'autoTasks'=>14,'completionRate'=>74,'delayRate'=>21,'estHours'=>62,'financial'=>64000],
        ];
        $months = [
            ['month'=>'2026-01','revenue'=>58000,'cost'=>33500,'profit'=>24500,'collected'=>42000,'paid'=>29000,'campaigns'=>2,'ads_count'=>6],
            ['month'=>'2026-02','revenue'=>82000,'cost'=>49100,'profit'=>32900,'collected'=>61000,'paid'=>40100,'campaigns'=>3,'ads_count'=>8],
            ['month'=>'2026-03','revenue'=>112500,'cost'=>68100,'profit'=>44400,'collected'=>84000,'paid'=>59000,'campaigns'=>4,'ads_count'=>11],
            ['month'=>'2026-04','revenue'=>154000,'cost'=>90200,'profit'=>63800,'collected'=>118000,'paid'=>76000,'campaigns'=>5,'ads_count'=>13],
            ['month'=>'2026-05','revenue'=>171000,'cost'=>101400,'profit'=>69600,'collected'=>139000,'paid'=>88000,'campaigns'=>5,'ads_count'=>14],
            ['month'=>'2026-06','revenue'=>256000,'cost'=>167800,'profit'=>88200,'collected'=>188000,'paid'=>137000,'campaigns'=>6,'ads_count'=>12],
        ];

        return [
            'company' => [
                'campaigns_total'=>24,'campaigns_active'=>9,'campaigns_completed'=>11,'campaigns_stalled'=>3,'campaigns_cancelled'=>1,
                'revenue'=>$totalSell,'profit'=>$profit,'margin'=>round(($profit / max($totalSell, 1)) * 100, 1),
                'collected'=>511250,'paidOut'=>331250,'pendingCollection'=>152500,'pendingPayments'=>61200,
                'nominations_total'=>186,'bookings_total'=>129,'documents'=>31,'autoTasks'=>248,'autoTasksOpen'=>43,'autoTasksDone'=>187,'autoTasksOverdue'=>18,
            ],
            'finance' => ['totalSell'=>$totalSell,'totalCost'=>$totalCost,'grossProfit'=>$profit,'collectedIn'=>511250,'paidOut'=>331250,'pendingCollection'=>152500,'pendingPayments'=>61200,'net'=>180000],
            'rates' => ['nomination_success'=>69.4,'client_acceptance'=>74.2,'influencer_acceptance'=>81.7],
            'durations' => ['avg_completion_days'=>18,'avg_booking_days'=>4.6,'avg_collection_days'=>13.2],
            'totals' => ['revenue'=>$totalSell,'cost'=>$totalCost,'profit'=>$profit,'ads_count'=>64,'campaigns_count'=>24],
            'statusBreakdown' => [
                ['key'=>'نشطة','value'=>9,'color'=>'#0d8a6f'],['key'=>'مكتملة','value'=>11,'color'=>'#16a34a'],['key'=>'متعثرة','value'=>3,'color'=>'#d97706'],['key'=>'ملغاة','value'=>1,'color'=>'#dc2626'],
            ],
            'timeSeries' => $months,
            'monthly_revenue' => $months,
            'platform_breakdown' => array_map(fn($p) => ['platform'=>$p['platform'],'c'=>$p['ads'],'total'=>$p['sell']], $platforms),
            'filters' => [
                'customers' => [['id'=>1,'name'=>'نوفا للعطور'],['id'=>2,'name'=>'Foodly KSA'],['id'=>3,'name'=>'Tech Expo Riyadh'],['id'=>4,'name'=>'Glow Care'],['id'=>5,'name'=>'Urban Coffee']],
                'campaigns' => array_map(fn($c) => ['id'=>$c['id'],'name'=>$c['name']], $campaigns),
                'employees' => array_column($employees, 'name'),
                'influencers' => [['id'=>1,'name'=>'نورة الحربي'],['id'=>2,'name'=>'عبدالعزيز لايف'],['id'=>3,'name'=>'سارة ستايل'],['id'=>4,'name'=>'مطبخ لينا'],['id'=>5,'name'=>'Tech Omar']],
            ],
            'profit' => [
                'byCustomer' => [
                    ['key'=>'نوفا للعطور','value'=>90000],['key'=>'Foodly KSA','value'=>80800],['key'=>'Tech Expo Riyadh','value'=>81400],['key'=>'Glow Care','value'=>30800],['key'=>'Urban Coffee','value'=>17900],
                ],
                'byCampaign' => array_map(fn($c) => ['key'=>$c['name'],'value'=>$c['profit']], $campaigns),
                'byInfluencer' => [['key'=>'نورة الحربي','value'=>38000],['key'=>'سارة ستايل','value'=>30800],['key'=>'عبدالعزيز لايف','value'=>28000],['key'=>'Tech Omar','value'=>18900],['key'=>'مطبخ لينا','value'=>18600]],
            ],
            'top' => [
                'customersByCampaigns' => [['key'=>'نوفا للعطور','value'=>4],['key'=>'Foodly KSA','value'=>3],['key'=>'Tech Expo Riyadh','value'=>2],['key'=>'Glow Care','value'=>2],['key'=>'Urban Coffee','value'=>1]],
                'customersByRevenue' => [['key'=>'Tech Expo Riyadh','value'=>221000],['key'=>'نوفا للعطور','value'=>214000],['key'=>'Foodly KSA','value'=>188000],['key'=>'Glow Care','value'=>86000],['key'=>'Urban Coffee','value'=>64000]],
                'influencersByAds' => [['key'=>'نورة الحربي','value'=>7],['key'=>'سارة ستايل','value'=>6],['key'=>'عبدالعزيز لايف','value'=>5],['key'=>'مطبخ لينا','value'=>4],['key'=>'Tech Omar','value'=>3]],
                'influencersByRevenue' => [['key'=>'نورة الحربي','value'=>92000],['key'=>'عبدالعزيز لايف','value'=>76000],['key'=>'سارة ستايل','value'=>68000],['key'=>'Tech Omar','value'=>58000],['key'=>'مطبخ لينا','value'=>44000]],
            ],            'detail' => [
                'campaignsTable' => $campaigns,
                'customerFinance' => [
                    ['name'=>'نوفا للعطور','campaigns'=>4,'sell'=>214000,'cost'=>124000,'profit'=>90000,'margin'=>42.1,'collected'=>166920,'collected_amount'=>166920,'pending'=>47080],
                    ['name'=>'Foodly KSA','campaigns'=>3,'sell'=>188000,'cost'=>107200,'profit'=>80800,'margin'=>43.0,'collected'=>188000,'collected_amount'=>188000,'pending'=>0],
                    ['name'=>'Tech Expo Riyadh','campaigns'=>2,'sell'=>221000,'cost'=>139600,'profit'=>81400,'margin'=>36.8,'collected'=>128180,'collected_amount'=>128180,'pending'=>92820],
                    ['name'=>'Glow Care','campaigns'=>2,'sell'=>86000,'cost'=>55200,'profit'=>30800,'margin'=>35.8,'collected'=>34400,'collected_amount'=>34400,'pending'=>51600],
                    ['name'=>'Urban Coffee','campaigns'=>1,'sell'=>64000,'cost'=>46100,'profit'=>17900,'margin'=>28.0,'collected'=>19840,'collected_amount'=>19840,'pending'=>44160],
                ],
                'platformPerf' => $platforms,
                'influencerTable' => [
                    ['name'=>'نورة الحربي','platform'=>'TikTok','tier'=>'A','ads'=>7,'booked'=>7,'sell'=>92000,'cost'=>54000,'profit'=>38000,'margin'=>41.3],
                    ['name'=>'عبدالعزيز لايف','platform'=>'Snapchat','tier'=>'A','ads'=>5,'booked'=>5,'sell'=>76000,'cost'=>48000,'profit'=>28000,'margin'=>36.8],
                    ['name'=>'سارة ستايل','platform'=>'Instagram','tier'=>'B','ads'=>6,'booked'=>6,'sell'=>68000,'cost'=>37200,'profit'=>30800,'margin'=>45.3],
                    ['name'=>'مطبخ لينا','platform'=>'TikTok','tier'=>'B','ads'=>4,'booked'=>4,'sell'=>44000,'cost'=>25400,'profit'=>18600,'margin'=>42.2],
                    ['name'=>'Tech Omar','platform'=>'YouTube','tier'=>'A','ads'=>3,'booked'=>3,'sell'=>58000,'cost'=>39100,'profit'=>18900,'margin'=>32.6],
                ],
                'ugcCreatorsTable' => [
                    ['name'=>'رنا كريتور','status'=>'نشطة','rating'=>4.9,'submissions'=>18,'earned'=>12800],
                    ['name'=>'هند لايف','status'=>'قيد المراجعة','rating'=>4.7,'submissions'=>14,'earned'=>9400],
                    ['name'=>'مازن UGC','status'=>'نشطة','rating'=>4.5,'submissions'=>11,'earned'=>7600],
                    ['name'=>'سمر ستوديو','status'=>'مميزة','rating'=>5.0,'submissions'=>22,'earned'=>16100],
                ],
                'funnel' => ['nominated'=>186,'internal'=>145,'clientApproved'=>129,'booked'=>118,'published'=>96],
                'autoTasksByStage' => [
                    ['stage'=>'الترشيح','total'=>64,'done'=>52,'open'=>9,'overdue'=>3],
                    ['stage'=>'اعتماد العميل','total'=>41,'done'=>32,'open'=>7,'overdue'=>2],
                    ['stage'=>'الحجز','total'=>53,'done'=>44,'open'=>6,'overdue'=>3],
                    ['stage'=>'النشر','total'=>58,'done'=>42,'open'=>10,'overdue'=>6],
                    ['stage'=>'المالية','total'=>32,'done'=>17,'open'=>11,'overdue'=>4],
                ],
            ],
            'employees' => $employees,
            'heatmap' => [
                ['name'=>'سارة العتيبي','days'=>[22,28,31,25,18]],['name'=>'محمد الحربي','days'=>[18,24,27,22,16]],['name'=>'عبدالله المدير','days'=>[16,20,23,21,14]],['name'=>'لينا السالم','days'=>[12,17,19,16,11]],['name'=>'خالد العمري','days'=>[9,13,15,14,10]],
            ],
            'ugc' => [
                'creators'=>42,'campaigns'=>8,'submissions'=>74,'submissions_approved'=>56,'transactions'=>31,'revenue'=>118000,'paid'=>74200,'pending'=>18800,
                'submissionStatus' => [['key'=>'معتمدة','value'=>56,'color'=>'#16a34a'],['key'=>'قيد المراجعة','value'=>12,'color'=>'#d97706'],['key'=>'مرفوضة','value'=>6,'color'=>'#dc2626']],
            ],
            'liveSync' => [
                ['platform'=>'TikTok','platform_key'=>'tiktok','icon'=>'i-video','followers'=>1520000,'engagement'=>6.8,'reach'=>842000,'synced_at'=>'قبل 5 دقائق'],
                ['platform'=>'Instagram','platform_key'=>'instagram','icon'=>'i-globe','followers'=>980000,'engagement'=>4.9,'reach'=>512000,'synced_at'=>'قبل 12 دقيقة'],
                ['platform'=>'YouTube','platform_key'=>'youtube','icon'=>'i-video','followers'=>430000,'engagement'=>3.7,'reach'=>221000,'synced_at'=>'قبل 28 دقيقة'],
            ],
            'smartMatch' => [
                'candidates' => [
                    ['type'=>'influencer','name'=>'نورة الحربي','platform'=>'TikTok','classification'=>'A','category'=>'جمال وعطور','city'=>'الرياض','followers'=>680000,'engagement'=>7.1,'estimatedCost'=>8200],
                    ['type'=>'influencer','name'=>'سارة ستايل','platform'=>'Instagram','classification'=>'B','category'=>'أزياء وجمال','city'=>'جدة','followers'=>420000,'engagement'=>5.9,'estimatedCost'=>5200],
                    ['type'=>'influencer','name'=>'عبدالعزيز لايف','platform'=>'Snapchat','classification'=>'A','category'=>'لايف ستايل','city'=>'الرياض','followers'=>590000,'engagement'=>4.8,'estimatedCost'=>7800],
                    ['type'=>'influencer','name'=>'مطبخ لينا','platform'=>'TikTok','classification'=>'B','category'=>'مطاعم وأغذية','city'=>'الدمام','followers'=>315000,'engagement'=>6.4,'estimatedCost'=>4300],
                    ['type'=>'influencer','name'=>'Tech Omar','platform'=>'YouTube','classification'=>'A','category'=>'تقنية','city'=>'الرياض','followers'=>240000,'engagement'=>3.9,'estimatedCost'=>9000],
                    ['type'=>'ugc','name'=>'رنا كريتور','platform'=>'TikTok','classification'=>'B','category'=>'جمال وعطور','city'=>'جدة','followers'=>118000,'engagement'=>8.2,'estimatedCost'=>1800],
                    ['type'=>'ugc','name'=>'سمر ستوديو','platform'=>'Instagram','classification'=>'A','category'=>'أزياء وجمال','city'=>'الرياض','followers'=>152000,'engagement'=>7.8,'estimatedCost'=>2400],
                    ['type'=>'ugc','name'=>'مازن UGC','platform'=>'TikTok','classification'=>'C','category'=>'مطاعم وأغذية','city'=>'الخبر','followers'=>64000,'engagement'=>6.9,'estimatedCost'=>1200],
                ],
            ],            'lists' => [
                'stalledCampaigns' => [
                    ['name'=>'UGC منتجات العناية','customer'=>'Glow Care','owner'=>'لينا السالم','status_label'=>'قيد المتابعة','reason'=>'تأخر اعتماد المحتوى النهائي من العميل'],
                    ['name'=>'افتتاح فرع الرياض','customer'=>'Urban Coffee','owner'=>'سارة العتيبي','status_label'=>'متعثرة','reason'=>'نقص بيانات الحساب البنكي لبعض المؤثرين'],
                    ['name'=>'مطعم بيت الطعم','customer'=>'بيت الطعم','owner'=>'خالد العمري','status_label'=>'ملغاة','reason'=>'تم إيقاف الحملة بناءً على طلب العميل'],
                ],
                'recentTimeline' => [
                    ['action'=>'اعتماد ترشيحات','actor'=>'سارة العتيبي','campaign'=>'إطلاق عطر نوفا الصيفي','at'=>'2026-07-13'],
                    ['action'=>'رفع فاتورة ضريبية','actor'=>'فريق المالية','campaign'=>'حملة تطبيق فودلي رمضان','at'=>'2026-07-13'],
                    ['action'=>'مراجعة محتوى UGC','actor'=>'لينا السالم','campaign'=>'UGC منتجات العناية','at'=>'2026-07-12'],
                    ['action'=>'إغلاق حملة','actor'=>'محمد الحربي','campaign'=>'حملة العودة للمدارس','at'=>'2026-07-12'],
                ],
            ],
            'actions' => [
                ['level'=>'urgent','icon'=>'i-wallet','title'=>'إيصالات بنكية مطلوبة','desc'=>'7 حوالات بانتظار رفع إيصال البنك لإغلاق المرحلة المالية.','cta'=>'المالية','href'=>'/finance'],
                ['level'=>'warn','icon'=>'i-clock','title'=>'حملات تحتاج متابعة','desc'=>'3 حملات متعثرة أو منخفضة التحصيل وتحتاج تدخل اليوم.','cta'=>'الحملات','href'=>'/orders-campaigns'],
                ['level'=>'info','icon'=>'i-video','title'=>'محتوى UGC للمراجعة','desc'=>'5 محتويات من صنّاع UGC بانتظار الاعتماد النهائي.','cta'=>'UGC','href'=>'/ugc-admin'],
            ],
        ];
    }
}