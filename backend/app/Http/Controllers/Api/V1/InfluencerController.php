<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Influencer;
use Illuminate\Http\Request;
use App\Http\Requests\StoreInfluencerRequest;
use App\Http\Resources\InfluencerResource;

class InfluencerController extends Controller
{
    public function index(Request $request)
    {
        $query = Influencer::with(['assignee:id,name'])
            ->search($request->input('search'));

        // Filters
        foreach (['platform', 'category', 'rating', 'gender', 'region', 'status'] as $f) {
            if ($v = $request->input($f)) {
                $query->where($f, $v);
            }
        }

        // Followers range
        if ($min = $request->input('followers_min')) $query->where('followers', '>=', $min);
        if ($max = $request->input('followers_max')) $query->where('followers', '<=', $max);

        // Sort
        $sortField = $request->input('sort', '-updated_at');
        $direction = str_starts_with($sortField, '-') ? 'desc' : 'asc';
        $field = ltrim($sortField, '-');
        $allowed = ['name', 'followers', 'cost_price', 'sale_price', 'updated_at', 'created_at', 'campaigns_count'];
        if (in_array($field, $allowed)) {
            $query->orderBy($field, $direction);
        }

        $perPage = min((int) $request->input('per_page', 25), 3000);
        return InfluencerResource::collection($query->paginate($perPage));
    }

    public function store(StoreInfluencerRequest $request)
    {
        $influencer = Influencer::create($request->validated());

        return response()->json([
            'message' => 'تم إنشاء المؤثر بنجاح',
            'data' => new InfluencerResource($influencer),
        ], 201);
    }

    public function show(Influencer $influencer)
    {
        $influencer->load([
            'assignee:id,name',
            'campaigns' => fn($q) => $q->limit(20)->orderByDesc('start_date'),
        ]);

        return response()->json([
            'data' => new InfluencerResource($influencer),
            'stats' => [
                'total_ads' => $influencer->dailyAds()->count(),
                'total_campaigns' => $influencer->campaigns()->count(),
                'total_earned' => (float) $influencer->dailyAds()->sum('cost_price'),
                'avg_cost' => (float) $influencer->dailyAds()->avg('cost_price'),
            ],
        ]);
    }

    public function update(StoreInfluencerRequest $request, Influencer $influencer)
    {
        $influencer->update($request->validated());
        return response()->json([
            'message' => 'تم التحديث بنجاح',
            'data' => new InfluencerResource($influencer->fresh()),
        ]);
    }

    public function destroy(Influencer $influencer)
    {
        $influencer->delete();
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $count = Influencer::whereIn('id', $request->ids)->delete();
        return response()->json([
            'message' => "تم حذف {$count} مؤثر",
            'deleted_count' => $count,
        ]);
    }
}
