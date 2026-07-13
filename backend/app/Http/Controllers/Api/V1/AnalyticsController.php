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
        $from = $request->input('from', now()->startOfYear()->toDateString());
        $to = $request->input('to', now()->endOfDay()->toDateString());
        
        $dateParts = DB::connection()->getDriverName() === 'sqlite'
            ? "CAST(strftime('%Y', ad_date) AS INTEGER) y, CAST(strftime('%m', ad_date) AS INTEGER) m"
            : 'YEAR(ad_date) y, MONTH(ad_date) m';

        $monthlyRevenue = DailyAd::selectRaw($dateParts . ', SUM(sale_price) revenue, SUM(cost_price) cost, COUNT(*) ads')
            ->whereBetween('ad_date', [$from, $to])
            ->groupBy('y', 'm')
            ->orderBy('y')->orderBy('m')
            ->get()
            ->map(fn($r) => [
                'month' => sprintf('%04d-%02d', $r->y, $r->m),
                'revenue' => (float) $r->revenue,
                'cost' => (float) $r->cost,
                'profit' => (float) $r->revenue - (float) $r->cost,
                'ads_count' => $r->ads,
            ]);
        
        $platformBreakdown = DailyAd::selectRaw('platform, COUNT(*) c, SUM(sale_price) total')
            ->whereBetween('ad_date', [$from, $to])
            ->groupBy('platform')
            ->get();
        
        return response()->json([
            'monthly_revenue' => $monthlyRevenue,
            'platform_breakdown' => $platformBreakdown,
            'totals' => [
                'revenue' => (float) DailyAd::whereBetween('ad_date', [$from, $to])->sum('sale_price'),
                'cost' => (float) DailyAd::whereBetween('ad_date', [$from, $to])->sum('cost_price'),
                'ads_count' => DailyAd::whereBetween('ad_date', [$from, $to])->count(),
                'campaigns_count' => Campaign::whereBetween('created_at', [$from, $to])->count(),
            ],
        ]);
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
}
