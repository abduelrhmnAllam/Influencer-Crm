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
        $query = Campaign::with(['customer:id,name', 'coordinator:id,name']);
        
        if ($s = $request->input('search')) {
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%");
            });
        }
        if ($status = $request->input('status')) $query->where('status', $status);
        if ($cid = $request->input('customer_id')) $query->where('customer_id', $cid);
        
        $query->orderByDesc('start_date');
        return CampaignResource::collection($query->paginate(min((int)$request->input('per_page', 25), 100)));
    }

    public function store(StoreCampaignRequest $request)
    {
        $campaign = Campaign::create($request->validated());
        return response()->json([
            'message' => 'تم الإنشاء بنجاح',
            'data' => new CampaignResource($campaign->fresh())
        ], 201);
    }

    public function show(Campaign $campaign)
    {
        $campaign->load(['customer:id,name', 'coordinator:id,name', 'influencers:id,name,code,platform', 'dailyAds' => fn($q) => $q->limit(50)]);
        return response()->json(['data' => new CampaignResource($campaign)]);
    }

    public function update(StoreCampaignRequest $request, Campaign $campaign)
    {
        $campaign->update($request->validated());
        return response()->json(['data' => new CampaignResource($campaign->fresh())]);
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }
}
