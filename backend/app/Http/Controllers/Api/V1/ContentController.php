<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Services\AIContentAnalyzerService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class ContentController extends Controller
{
    public function index(Request $request)
    {
        if (Content::query()->count() === 0) {
            return response()->json($this->demoPaginator($request));
        }

        $query = Content::with([
            'campaign:id,name',
            'influencer:id,name,platform',
            'customer:id,name',
            'uploader:id,name,username',
        ]);

        foreach (['source', 'platform', 'campaign_id', 'influencer_id'] as $field) {
            if ($value = $request->input($field)) {
                $query->where($field, $value);
            }
        }

        if ($rating = $request->input('rating')) {
            $query->where('rating', '>=', (int) $rating);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('content_url', 'like', "%{$search}%")
                    ->orWhereHas('campaign', fn ($r) => $r->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('influencer', fn ($r) => $r->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('customer', fn ($r) => $r->where('name', 'like', "%{$search}%"));
            });
        }

        $perPage = min((int) $request->input('per_page', 30), 100);

        return response()->json(
            $query->orderByDesc('scheduled_date')
                ->orderByDesc('created_at')
                ->paginate($perPage)
                ->through(fn (Content $content) => $this->transform($content))
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'campaign_id' => 'nullable|exists:campaigns,id',
            'influencer_id' => 'nullable|exists:influencers,id',
            'customer_id' => 'nullable|exists:customers,id',
            'source' => 'required|string|max:30',
            'platform' => 'nullable|string|max:30',
            'type' => 'nullable|string|max:30',
            'content_url' => 'required|url',
            'thumbnail_url' => 'nullable|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'rating' => 'nullable|integer|min:0|max:5',
            'scheduled_date' => 'nullable|date',
            'published_date' => 'nullable|date',
        ]);

        $data['uploaded_by'] = Auth::id();
        $content = Content::create($data);

        return response()->json([
            'data' => $this->transform($content->load(['campaign', 'influencer', 'customer', 'uploader'])),
            'message' => 'تم إضافة المحتوى بنجاح',
        ], 201);
    }

    public function show(Content $content)
    {
        return response()->json(['data' => $this->transform($content->load(['campaign', 'influencer', 'customer', 'uploader']))]);
    }

    public function update(Request $request, Content $content)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'rating' => 'nullable|integer|min:0|max:5',
            'scheduled_date' => 'nullable|date',
            'published_date' => 'nullable|date',
            'content_url' => 'nullable|url',
            'thumbnail_url' => 'nullable|url',
        ]);

        $content->update($data);

        return response()->json([
            'data' => $this->transform($content->fresh()->load(['campaign', 'influencer', 'customer', 'uploader'])),
            'message' => 'تم تحديث المحتوى بنجاح',
        ]);
    }

    public function destroy(Content $content)
    {
        $content->delete();
        return response()->json(['message' => 'تم حذف المحتوى بنجاح']);
    }

    public function analyze(Content $content, AIContentAnalyzerService $ai)
    {
        $analysis = $ai->analyzeContent($content);
        return response()->json([
            'data' => $this->transform($content->fresh()->load(['campaign', 'influencer', 'customer', 'uploader'])),
            'analysis' => $analysis,
        ]);
    }

    private function transform(Content $content): array
    {
        return [
            'id' => $content->id,
            'code' => $content->code,
            'campaign_id' => $content->campaign_id,
            'campaign_name' => $content->campaign?->name,
            'customer_id' => $content->customer_id,
            'customer_name' => $content->customer?->name,
            'influencer_id' => $content->influencer_id,
            'influencer_name' => $content->influencer?->name,
            'employee_name' => $content->uploader?->name ?? $content->uploader?->username ?? 'مدير النظام',
            'source' => $content->source,
            'platform' => $content->platform ?: $content->influencer?->platform,
            'type' => $content->type,
            'content_url' => $content->content_url,
            'thumbnail_url' => $content->thumbnail_url,
            'title' => $content->title,
            'description' => $content->description,
            'rating' => $content->rating,
            'scheduled_date' => optional($content->scheduled_date)->toDateString(),
            'published_date' => optional($content->published_date)->toDateString(),
            'views_count' => $content->views_count,
            'likes_count' => $content->likes_count,
            'comments_count' => $content->comments_count,
            'created_at' => optional($content->created_at)->toISOString(),
        ];
    }

    private function demoPaginator(Request $request): array
    {
        $items = collect($this->demoContents());

        foreach (['source', 'platform'] as $field) {
            if ($value = $request->input($field)) {
                $items = $items->where($field, $value);
            }
        }

        if ($rating = $request->input('rating')) {
            $items = $items->filter(fn ($row) => (int) $row['rating'] >= (int) $rating);
        }

        if ($search = $request->input('search')) {
            $needle = mb_strtolower($search);
            $items = $items->filter(function ($row) use ($needle) {
                return str_contains(mb_strtolower(implode(' ', [
                    $row['campaign_name'], $row['customer_name'], $row['influencer_name'], $row['employee_name'], $row['content_url'], $row['code'],
                ])), $needle);
            });
        }

        $items = $items->sortByDesc('scheduled_date')->values();
        $perPage = min((int) $request->input('per_page', 30), 100);
        $page = LengthAwarePaginator::resolveCurrentPage();
        $slice = $items->slice(($page - 1) * $perPage, $perPage)->values();

        return (new LengthAwarePaginator($slice, $items->count(), $perPage, $page, [
            'path' => $request->url(),
            'query' => $request->query(),
        ]))->toArray();
    }

    private function demoContents(): array
    {
        return [
            ['id'=>1,'code'=>'CT-00001','campaign_id'=>1,'campaign_name'=>'إطلاق عطر نوفا الصيفي','customer_id'=>1,'customer_name'=>'نوفا للعطور','influencer_id'=>1,'influencer_name'=>'سارة العنزي','employee_name'=>'محمد الحربي','source'=>'tiktok','platform'=>'tiktok','type'=>'video','content_url'=>'https://www.tiktok.com/@sara/video/735100001','rating'=>5,'scheduled_date'=>'2026-07-13','views_count'=>184000,'likes_count'=>12800,'comments_count'=>860],
            ['id'=>2,'code'=>'CT-00002','campaign_id'=>1,'campaign_name'=>'إطلاق عطر نوفا الصيفي','customer_id'=>1,'customer_name'=>'نوفا للعطور','influencer_id'=>2,'influencer_name'=>'عبدالله فهد','employee_name'=>'محمد الحربي','source'=>'snapchat','platform'=>'snapchat','type'=>'story','content_url'=>'https://www.snapchat.com/add/abdullahfahad/story/735100002','rating'=>4,'scheduled_date'=>'2026-07-12','views_count'=>92500,'likes_count'=>4100,'comments_count'=>210],
            ['id'=>3,'code'=>'CT-00003','campaign_id'=>2,'campaign_name'=>'حملة تطبيق فودلي رمضان','customer_id'=>2,'customer_name'=>'Foodly KSA','influencer_id'=>3,'influencer_name'=>'نورة خالد','employee_name'=>'أحمد سالم','source'=>'instagram','platform'=>'instagram','type'=>'reel','content_url'=>'https://www.instagram.com/reel/C9smartcode003/','rating'=>5,'scheduled_date'=>'2026-07-11','views_count'=>231000,'likes_count'=>19800,'comments_count'=>1240],
            ['id'=>4,'code'=>'CT-00004','campaign_id'=>2,'campaign_name'=>'حملة تطبيق فودلي رمضان','customer_id'=>2,'customer_name'=>'Foodly KSA','influencer_id'=>4,'influencer_name'=>'مشاعل علي','employee_name'=>'أحمد سالم','source'=>'google_drive','platform'=>'instagram','type'=>'image','content_url'=>'https://drive.google.com/file/d/smartcode-foodly-creative-04/view','rating'=>4,'scheduled_date'=>'2026-07-10','views_count'=>68000,'likes_count'=>5300,'comments_count'=>330],
            ['id'=>5,'code'=>'CT-00005','campaign_id'=>3,'campaign_name'=>'تغطية معرض التقنية','customer_id'=>3,'customer_name'=>'Tech Expo Riyadh','influencer_id'=>5,'influencer_name'=>'راشد القحطاني','employee_name'=>'ليان منصور','source'=>'youtube','platform'=>'youtube','type'=>'video','content_url'=>'https://youtu.be/smartcode-tech-expo-05','rating'=>5,'scheduled_date'=>'2026-07-09','views_count'=>305000,'likes_count'=>24000,'comments_count'=>1800],
            ['id'=>6,'code'=>'CT-00006','campaign_id'=>3,'campaign_name'=>'تغطية معرض التقنية','customer_id'=>3,'customer_name'=>'Tech Expo Riyadh','influencer_id'=>6,'influencer_name'=>'ريم العتيبي','employee_name'=>'ليان منصور','source'=>'twitter','platform'=>'twitter','type'=>'post','content_url'=>'https://x.com/reem/status/735100006','rating'=>3,'scheduled_date'=>'2026-07-08','views_count'=>54000,'likes_count'=>2100,'comments_count'=>96],
            ['id'=>7,'code'=>'CT-00007','campaign_id'=>4,'campaign_name'=>'UGC منتجات العناية','customer_id'=>4,'customer_name'=>'Glow Care','influencer_id'=>7,'influencer_name'=>'هند الشمري','employee_name'=>'منى السبيعي','source'=>'dropbox','platform'=>'instagram','type'=>'ugc','content_url'=>'https://www.dropbox.com/s/smartcode-glow-care-ugc-07.mp4','rating'=>4,'scheduled_date'=>'2026-07-07','views_count'=>74000,'likes_count'=>6200,'comments_count'=>410],
            ['id'=>8,'code'=>'CT-00008','campaign_id'=>5,'campaign_name'=>'افتتاح فرع كافيه روز','customer_id'=>5,'customer_name'=>'Rose Cafe','influencer_id'=>8,'influencer_name'=>'تركي المطيري','employee_name'=>'خالد ناصر','source'=>'tiktok','platform'=>'tiktok','type'=>'video','content_url'=>'https://www.tiktok.com/@turki/video/735100008','rating'=>5,'scheduled_date'=>'2026-07-06','views_count'=>412000,'likes_count'=>36000,'comments_count'=>2500],
            ['id'=>9,'code'=>'CT-00009','campaign_id'=>5,'campaign_name'=>'افتتاح فرع كافيه روز','customer_id'=>5,'customer_name'=>'Rose Cafe','influencer_id'=>9,'influencer_name'=>'جود المالكي','employee_name'=>'خالد ناصر','source'=>'snapchat','platform'=>'snapchat','type'=>'story','content_url'=>'https://www.snapchat.com/add/joud/story/735100009','rating'=>4,'scheduled_date'=>'2026-07-05','views_count'=>86000,'likes_count'=>3900,'comments_count'=>185],
            ['id'=>10,'code'=>'CT-00010','campaign_id'=>6,'campaign_name'=>'تجربة منتج ألعاب ذكية','customer_id'=>6,'customer_name'=>'GameLab','influencer_id'=>10,'influencer_name'=>'يزن السالم','employee_name'=>'سارة منصور','source'=>'google_drive','platform'=>'youtube','type'=>'review','content_url'=>'https://drive.google.com/file/d/smartcode-gamelab-review-10/view','rating'=>3,'scheduled_date'=>'2026-07-04','views_count'=>43000,'likes_count'=>1800,'comments_count'=>120],
        ];
    }
}
