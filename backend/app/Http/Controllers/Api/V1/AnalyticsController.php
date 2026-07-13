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
        $demo = $this->demoOverview();

        try {
            $from = $request->input('from', now()->startOfYear()->toDateString());
            $to = $request->input('to', now()->endOfDay()->toDateString());
            $driver = DB::connection()->getDriverName();
            $dateParts = match ($driver) {
                'sqlite' => "CAST(strftime('%Y', ad_date) AS INTEGER) y, CAST(strftime('%m', ad_date) AS INTEGER) m",
                'pgsql' => "EXTRACT(YEAR FROM ad_date)::int y, EXTRACT(MONTH FROM ad_date)::int m",
                default => 'YEAR(ad_date) y, MONTH(ad_date) m',
            };

            $monthlyRevenue = DailyAd::selectRaw($dateParts . ', SUM(sale_price) revenue, SUM(cost_price) cost, COUNT(*) ads')
                ->whereBetween('ad_date', [$from, $to])
                ->groupBy('y', 'm')
                ->orderBy('y')->orderBy('m')
                ->get()
                ->map(fn ($r) => [
                    'month' => sprintf('%04d-%02d', $r->y, $r->m),
                    'revenue' => (float) $r->revenue,
                    'cost' => (float) $r->cost,
                    'profit' => (float) $r->revenue - (float) $r->cost,
                    'ads_count' => (int) $r->ads,
                ])
                ->values()
                ->all();

            if (count($monthlyRevenue) > 0) {
                $demo['monthly_revenue'] = $monthlyRevenue;
            }

            $realRevenue = (float) DailyAd::whereBetween('ad_date', [$from, $to])->sum('sale_price');
            $realCost = (float) DailyAd::whereBetween('ad_date', [$from, $to])->sum('cost_price');
            $realAds = DailyAd::whereBetween('ad_date', [$from, $to])->count();
            $realCampaigns = Campaign::whereBetween('created_at', [$from, $to])->count();

            if ($realAds > 0 || $realCampaigns > 0) {
                $demo['totals'] = [
                    'revenue' => $realRevenue,
                    'cost' => $realCost,
                    'profit' => $realRevenue - $realCost,
                    'ads_count' => $realAds,
                    'campaigns_count' => $realCampaigns,
                ];
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json($demo);
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
            'pending' => [
                'count' => (int) ($transfers->get('1')->c ?? 0),
                'amount' => (float) ($transfers->get('1')->total ?? 0),
            ],
            'transferred' => [
                'count' => (int) ($transfers->get('2')->c ?? 0),
                'amount' => (float) ($transfers->get('2')->total ?? 0),
            ],
            'completed' => [
                'count' => (int) ($transfers->get('complete')->c ?? 0),
                'amount' => (float) ($transfers->get('complete')->total ?? 0),
            ],
        ]);
    }

    private function demoOverview(): array
    {
        $campaigns = [
            ['id' => 1, 'name' => 'إطلاق عطر نوفا الصيفي', 'customer' => 'نوفا للعطور', 'owner' => 'سارة العتيبي', 'status' => 'نشطة', 'status_key' => 'active', 'influencers' => 18, 'booked' => 14, 'sell' => 182500, 'cost' => 108200, 'profit' => 74300, 'margin' => 40.7, 'collected' => 72],
            ['id' => 2, 'name' => 'حملة تطبيق فودلي رمضان', 'customer' => 'Foodly KSA', 'owner' => 'محمد الحربي', 'status' => 'مكتملة', 'status_key' => 'completed', 'influencers' => 12, 'booked' => 12, 'sell' => 148000, 'cost' => 84200, 'profit' => 63800, 'margin' => 43.1, 'collected' => 100],
            ['id' => 3, 'name' => 'تغطية معرض التقنية', 'customer' => 'Tech Expo Riyadh', 'owner' => 'عبدالله المدير', 'status' => 'نشطة', 'status_key' => 'active', 'influencers' => 21, 'booked' => 16, 'sell' => 221000, 'cost' => 139600, 'profit' => 81400, 'margin' => 36.8, 'collected' => 58],
            ['id' => 4, 'name' => 'UGC منتجات العناية', 'customer' => 'Glow Care', 'owner' => 'لينا السالم', 'status' => 'قيد المتابعة', 'status_key' => 'risk', 'influencers' => 9, 'booked' => 6, 'sell' => 86000, 'cost' => 55200, 'profit' => 30800, 'margin' => 35.8, 'collected' => 40],
            ['id' => 5, 'name' => 'افتتاح فرع الرياض', 'customer' => 'Urban Coffee', 'owner' => 'سارة العتيبي', 'status' => 'متعثرة', 'status_key' => 'risk', 'influencers' => 7, 'booked' => 4, 'sell' => 64000, 'cost' => 46100, 'profit' => 17900, 'margin' => 28.0, 'collected' => 31],
            ['id' => 6, 'name' => 'حملة العودة للمدارس', 'customer' => 'Edu Box', 'owner' => 'محمد الحربي', 'status' => 'مكتملة', 'status_key' => 'completed', 'influencers' => 15, 'booked' => 15, 'sell' => 132000, 'cost' => 76800, 'profit' => 55200, 'margin' => 41.8, 'collected' => 96],
        ];

        $totalSell = array_sum(array_column($campaigns, 'sell'));
        $totalCost = array_sum(array_column($campaigns, 'cost'));
        $profit = $totalSell - $totalCost;

        return [
            'company' => [
                'campaigns_total' => 24,
                'campaigns_active' => 9,
                'campaigns_completed' => 11,
                'campaigns_stalled' => 3,
                'campaigns_cancelled' => 1,
                'revenue' => $totalSell,
                'profit' => $profit,
                'margin' => round(($profit / max($totalSell, 1)) * 100, 1),
                'collected' => 511250,
                'paidOut' => 331250,
                'pendingCollection' => 152500,
                'pendingPayments' => 61200,
                'nominations_total' => 186,
                'bookings_total' => 129,
            ],
            'finance' => [
                'totalSell' => $totalSell,
                'totalCost' => $totalCost,
                'net' => $profit,
                'pendingCollection' => 152500,
                'pendingPayments' => 61200,
            ],
            'rates' => [
                'nomination_success' => 69.4,
                'client_acceptance' => 74.2,
                'influencer_acceptance' => 81.7,
            ],
            'durations' => [
                'avg_completion_days' => 18,
                'avg_booking_days' => 4.6,
                'avg_collection_days' => 13.2,
            ],
            'totals' => [
                'revenue' => $totalSell,
                'cost' => $totalCost,
                'profit' => $profit,
                'ads_count' => 64,
                'campaigns_count' => 24,
            ],
            'monthly_revenue' => [
                ['month' => '2026-01', 'revenue' => 58000, 'cost' => 33500, 'profit' => 24500, 'ads_count' => 6],
                ['month' => '2026-02', 'revenue' => 82000, 'cost' => 49100, 'profit' => 32900, 'ads_count' => 8],
                ['month' => '2026-03', 'revenue' => 112500, 'cost' => 68100, 'profit' => 44400, 'ads_count' => 11],
                ['month' => '2026-04', 'revenue' => 154000, 'cost' => 90200, 'profit' => 63800, 'ads_count' => 13],
                ['month' => '2026-05', 'revenue' => 171000, 'cost' => 101400, 'profit' => 69600, 'ads_count' => 14],
                ['month' => '2026-06', 'revenue' => 256000, 'cost' => 167800, 'profit' => 88200, 'ads_count' => 12],
            ],
            'platform_breakdown' => [
                ['platform' => 'TikTok', 'c' => 31, 'total' => 344000],
                ['platform' => 'Instagram', 'c' => 19, 'total' => 256500],
                ['platform' => 'Snapchat', 'c' => 9, 'total' => 142000],
                ['platform' => 'YouTube', 'c' => 5, 'total' => 91000],
            ],
            'detail' => [
                'campaignsTable' => $campaigns,
                'customerFinance' => [
                    ['name' => 'نوفا للعطور', 'campaigns' => 4, 'sell' => 214000, 'cost' => 124000, 'profit' => 90000, 'margin' => 42.1, 'collected' => 78, 'pending' => 47080],
                    ['name' => 'Foodly KSA', 'campaigns' => 3, 'sell' => 188000, 'cost' => 107200, 'profit' => 80800, 'margin' => 43.0, 'collected' => 100, 'pending' => 0],
                    ['name' => 'Tech Expo Riyadh', 'campaigns' => 2, 'sell' => 221000, 'cost' => 139600, 'profit' => 81400, 'margin' => 36.8, 'collected' => 58, 'pending' => 92820],
                    ['name' => 'Glow Care', 'campaigns' => 2, 'sell' => 86000, 'cost' => 55200, 'profit' => 30800, 'margin' => 35.8, 'collected' => 40, 'pending' => 51600],
                    ['name' => 'Urban Coffee', 'campaigns' => 1, 'sell' => 64000, 'cost' => 46100, 'profit' => 17900, 'margin' => 28.0, 'collected' => 31, 'pending' => 44160],
                ],
                'platformPerf' => [
                    ['platform' => 'TikTok', 'ads' => 31, 'sell' => 344000, 'cost' => 204400, 'profit' => 139600, 'margin' => 40.6, 'share' => 41.2, 'color' => '#111827'],
                    ['platform' => 'Instagram', 'ads' => 19, 'sell' => 256500, 'cost' => 151700, 'profit' => 104800, 'margin' => 40.9, 'share' => 30.7, 'color' => '#ec4899'],
                    ['platform' => 'Snapchat', 'ads' => 9, 'sell' => 142000, 'cost' => 92200, 'profit' => 49800, 'margin' => 35.1, 'share' => 17.0, 'color' => '#f59e0b'],
                    ['platform' => 'YouTube', 'ads' => 5, 'sell' => 91000, 'cost' => 61900, 'profit' => 29100, 'margin' => 32.0, 'share' => 10.9, 'color' => '#dc2626'],
                ],
                'influencerTable' => [
                    ['name' => 'نورة الحربي', 'platform' => 'TikTok', 'tier' => 'A', 'ads' => 7, 'booked' => 7, 'sell' => 92000, 'cost' => 54000, 'profit' => 38000, 'margin' => 41.3],
                    ['name' => 'عبدالعزيز لايف', 'platform' => 'Snapchat', 'tier' => 'A', 'ads' => 5, 'booked' => 5, 'sell' => 76000, 'cost' => 48000, 'profit' => 28000, 'margin' => 36.8],
                    ['name' => 'سارة ستايل', 'platform' => 'Instagram', 'tier' => 'B', 'ads' => 6, 'booked' => 6, 'sell' => 68000, 'cost' => 37200, 'profit' => 30800, 'margin' => 45.3],
                    ['name' => 'مطبخ لينا', 'platform' => 'TikTok', 'tier' => 'B', 'ads' => 4, 'booked' => 4, 'sell' => 44000, 'cost' => 25400, 'profit' => 18600, 'margin' => 42.2],
                    ['name' => 'Tech Omar', 'platform' => 'YouTube', 'tier' => 'A', 'ads' => 3, 'booked' => 3, 'sell' => 58000, 'cost' => 39100, 'profit' => 18900, 'margin' => 32.6],
                ],
            ],
            'employees' => [
                ['name' => 'سارة العتيبي', 'campaigns' => 8, 'nominations' => 58, 'bookings' => 41, 'followups' => 96, 'completedOps' => 72, 'autoTasks' => 38, 'completionRate' => 94, 'delayRate' => 6, 'estHours' => 128, 'financial' => 221000],
                ['name' => 'محمد الحربي', 'campaigns' => 6, 'nominations' => 44, 'bookings' => 33, 'followups' => 81, 'completedOps' => 64, 'autoTasks' => 31, 'completionRate' => 89, 'delayRate' => 9, 'estHours' => 104, 'financial' => 188000],
                ['name' => 'عبدالله المدير', 'campaigns' => 5, 'nominations' => 39, 'bookings' => 29, 'followups' => 73, 'completedOps' => 51, 'autoTasks' => 26, 'completionRate' => 86, 'delayRate' => 12, 'estHours' => 98, 'financial' => 164000],
                ['name' => 'لينا السالم', 'campaigns' => 4, 'nominations' => 25, 'bookings' => 17, 'followups' => 50, 'completedOps' => 32, 'autoTasks' => 19, 'completionRate' => 78, 'delayRate' => 18, 'estHours' => 76, 'financial' => 86000],
                ['name' => 'خالد العمري', 'campaigns' => 3, 'nominations' => 20, 'bookings' => 13, 'followups' => 37, 'completedOps' => 25, 'autoTasks' => 14, 'completionRate' => 74, 'delayRate' => 21, 'estHours' => 62, 'financial' => 64000],
            ],
            'heatmap' => [
                ['name' => 'سارة العتيبي', 'days' => [22, 28, 31, 25, 18]],
                ['name' => 'محمد الحربي', 'days' => [18, 24, 27, 22, 16]],
                ['name' => 'عبدالله المدير', 'days' => [16, 20, 23, 21, 14]],
                ['name' => 'لينا السالم', 'days' => [12, 17, 19, 16, 11]],
                ['name' => 'خالد العمري', 'days' => [9, 13, 15, 14, 10]],
            ],
            'actions' => [
                ['level' => 'urgent', 'icon' => 'i-wallet', 'title' => 'إيصالات بنكية مطلوبة', 'desc' => '7 حوالات بانتظار رفع إيصال البنك لإغلاق المرحلة المالية.', 'cta' => 'المالية', 'href' => '/finance'],
                ['level' => 'warn', 'icon' => 'i-clock', 'title' => 'حملات تحتاج متابعة', 'desc' => '3 حملات متعثرة أو منخفضة التحصيل وتحتاج تدخل اليوم.', 'cta' => 'الحملات', 'href' => '/campaigns'],
                ['level' => 'info', 'icon' => 'i-video', 'title' => 'محتوى UGC للمراجعة', 'desc' => '5 محتويات من صناع UGC بانتظار الاعتماد النهائي.', 'cta' => 'المحتوى', 'href' => '/content'],
            ],
        ];
    }
}
