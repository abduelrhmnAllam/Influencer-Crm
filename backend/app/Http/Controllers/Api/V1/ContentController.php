<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Services\AIContentAnalyzerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContentController extends Controller
{
    public function index(Request $request)
    {
        $query = Content::with(['campaign:id,name', 'influencer:id,name', 'customer:id,name']);
        
        foreach (['source', 'platform', 'rating', 'campaign_id', 'influencer_id'] as $f) {
            if ($v = $request->input($f)) $query->where($f, $v);
        }
        
        if ($s = $request->input('search')) {
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
            });
        }
        
        $query->orderByDesc('scheduled_date');
        return response()->json($query->paginate(min((int)$request->input('per_page', 30), 100)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'campaign_id' => 'nullable|exists:campaigns,id',
            'influencer_id' => 'nullable|exists:influencers,id',
            'customer_id' => 'nullable|exists:customers,id',
            'source' => 'required|string',
            'platform' => 'nullable|string',
            'type' => 'nullable|string',
            'content_url' => 'required|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'rating' => 'nullable|integer|min:0|max:5',
            'scheduled_date' => 'nullable|date',
        ]);
        $data['uploaded_by'] = Auth::id();
        $content = Content::create($data);
        return response()->json(['data' => $content, 'message' => 'تم إضافة المحتوى'], 201);
    }

    public function show(Content $content)
    {
        $content->load(['campaign', 'influencer', 'customer']);
        return response()->json(['data' => $content]);
    }

    public function update(Request $request, Content $content)
    {
        $data = $request->validate([
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'rating' => 'nullable|integer|min:0|max:5',
            'scheduled_date' => 'nullable|date',
            'published_date' => 'nullable|date',
        ]);
        $content->update($data);
        return response()->json(['data' => $content->fresh()]);
    }

    public function destroy(Content $content)
    {
        $content->delete();
        return response()->json(['message' => 'تم الحذف']);
    }

    public function analyze(Content $content, AIContentAnalyzerService $ai)
    {
        $analysis = $ai->analyzeContent($content);
        return response()->json([
            'data' => $content->fresh(),
            'analysis' => $analysis,
        ]);
    }
}
