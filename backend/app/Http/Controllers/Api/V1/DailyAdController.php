<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DailyAd;
use Illuminate\Http\Request;

class DailyAdController extends Controller
{
    public function index(Request $request)
    {
        $query = DailyAd::with(['campaign:id,name', 'influencer:id,name,platform', 'customer:id,name']);
        
        foreach (['campaign_id', 'influencer_id', 'customer_id', 'platform', 'status'] as $f) {
            if ($v = $request->input($f)) $query->where($f, $v);
        }
        
        if ($from = $request->input('from')) $query->whereDate('ad_date', '>=', $from);
        if ($to = $request->input('to')) $query->whereDate('ad_date', '<=', $to);
        
        $query->orderByDesc('ad_date');
        return response()->json($query->paginate(min((int)$request->input('per_page', 50), 200)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'campaign_id' => 'required|exists:campaigns,id',
            'influencer_id' => 'required|exists:influencers,id',
            'customer_id' => 'required|exists:customers,id',
            'ad_date' => 'required|date',
            'platform' => 'required|string|max:30',
            'status' => 'in:scheduled,published,verified,cancelled',
            'cost_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'content_url' => 'nullable|url',
            'notes' => 'nullable|string',
        ]);
        $ad = DailyAd::create($data);
        return response()->json(['data' => $ad, 'message' => 'تم إضافة الإعلان'], 201);
    }

    public function show(DailyAd $dailyAd)
    {
        $dailyAd->load(['campaign', 'influencer', 'customer']);
        return response()->json(['data' => $dailyAd]);
    }

    public function update(Request $request, DailyAd $dailyAd)
    {
        $data = $request->validate([
            'ad_date' => 'sometimes|date',
            'platform' => 'sometimes|string|max:30',
            'status' => 'sometimes|in:scheduled,published,verified,cancelled',
            'cost_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'content_url' => 'nullable|url',
            'notes' => 'nullable|string',
        ]);
        $dailyAd->update($data);
        return response()->json(['data' => $dailyAd->fresh()]);
    }

    public function destroy(DailyAd $dailyAd)
    {
        $dailyAd->delete();
        return response()->json(['message' => 'تم الحذف']);
    }
}
