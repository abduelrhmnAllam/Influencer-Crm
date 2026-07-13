<?php

namespace App\Services;

use App\Models\Content;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class AIContentAnalyzerService
{
    /**
     * Analyze content (caption, description, hashtags) with AI
     * Returns: summary, tags, sentiment_score, audience_insights
     */
    public function analyzeContent(Content $content): array
    {
        $textToAnalyze = trim(($content->title ?? '') . "\n" . ($content->description ?? ''));
        
        if (empty($textToAnalyze)) {
            return [
                'summary' => 'لا يوجد نص للتحليل',
                'tags' => [],
                'sentiment_score' => 0,
                'analyzed_at' => now(),
            ];
        }

        $apiKey = config('openai.api_key', env('OPENAI_API_KEY'));
        
        // If no API key, return placeholder analysis
        if (!$apiKey) {
            return $this->placeholderAnalysis($content);
        }

        try {
            $prompt = $this->buildPrompt($content, $textToAnalyze);
            
            $response = OpenAI::chat()->create([
                'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'أنت محلل محتوى متخصص في التسويق عبر المؤثرين السعوديين. قم بتحليل المحتوى وإرجاع JSON منظم.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.3,
            ]);
            
            $result = json_decode($response->choices[0]->message->content ?? '{}', true);
            
            $analysis = [
                'summary' => $result['summary'] ?? '',
                'tags' => $result['tags'] ?? [],
                'sentiment_score' => $result['sentiment_score'] ?? 0,
                'audience_target' => $result['audience_target'] ?? '',
                'content_quality' => $result['content_quality'] ?? '',
                'cta_strength' => $result['cta_strength'] ?? 0,
                'recommendations' => $result['recommendations'] ?? [],
                'analyzed_at' => now(),
                'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
            ];

            // Save to content
            $content->update([
                'ai_analysis' => $analysis,
                'ai_summary' => $analysis['summary'],
                'ai_tags' => $analysis['tags'],
                'ai_sentiment_score' => $analysis['sentiment_score'],
                'ai_analyzed_at' => now(),
            ]);

            return $analysis;
        } catch (\Exception $e) {
            Log::error('AI analysis failed', ['error' => $e->getMessage(), 'content_id' => $content->id]);
            return $this->placeholderAnalysis($content);
        }
    }

    /**
     * Build the analysis prompt
     */
    protected function buildPrompt(Content $content, string $text): string
    {
        return "حلّل المحتوى التالي من منصة {$content->platform}:\n\n" .
               "{$text}\n\n" .
               "أرجع JSON بالحقول التالية:\n" .
               "- summary: ملخص قصير للمحتوى (سطرين)\n" .
               "- tags: مصفوفة من 5-8 وسوم تصف المحتوى\n" .
               "- sentiment_score: رقم بين -1 (سلبي) و 1 (إيجابي)\n" .
               "- audience_target: الجمهور المستهدف\n" .
               "- content_quality: تقييم الجودة (ضعيف/متوسط/جيد/ممتاز)\n" .
               "- cta_strength: قوة الدعوة لاتخاذ إجراء (0-10)\n" .
               "- recommendations: مصفوفة من 2-3 توصيات للتحسين";
    }

    /**
     * Placeholder analysis when AI is not configured
     */
    protected function placeholderAnalysis(Content $content): array
    {
        return [
            'summary' => 'محتوى من منصة ' . $content->platform . ' بانتظار التحليل الذكي.',
            'tags' => [$content->platform, 'محتوى'],
            'sentiment_score' => 0,
            'audience_target' => 'غير محدد',
            'content_quality' => 'لم يتم التحليل',
            'cta_strength' => 0,
            'recommendations' => ['أضف مفتاح OpenAI API في إعدادات النظام للتحليل التلقائي'],
            'analyzed_at' => now(),
            'placeholder' => true,
        ];
    }

    /**
     * Batch analyze multiple pieces of content
     */
    public function analyzeBatch(array $contentIds): array
    {
        $results = [];
        foreach ($contentIds as $id) {
            $content = Content::find($id);
            if ($content) {
                $results[$id] = $this->analyzeContent($content);
            }
        }
        return $results;
    }

    /**
     * Generate campaign insights report
     */
    public function generateCampaignReport(int $campaignId): array
    {
        $campaign = \App\Models\Campaign::with(['dailyAds', 'influencers'])->find($campaignId);
        if (!$campaign) return ['error' => 'Campaign not found'];
        
        $stats = [
            'campaign_name' => $campaign->name,
            'total_ads' => $campaign->dailyAds->count(),
            'total_cost' => (float) $campaign->dailyAds->sum('cost_price'),
            'total_sale' => (float) $campaign->dailyAds->sum('sale_price'),
            'profit' => 0,
            'roi_percent' => 0,
            'influencers_count' => $campaign->influencers->count(),
        ];
        
        $stats['profit'] = $stats['total_sale'] - $stats['total_cost'];
        $stats['roi_percent'] = $stats['total_cost'] > 0 
            ? round(($stats['profit'] / $stats['total_cost']) * 100, 2) 
            : 0;
        
        return [
            'stats' => $stats,
            'recommendations' => $this->buildCampaignRecommendations($stats),
        ];
    }

    protected function buildCampaignRecommendations(array $stats): array
    {
        $recs = [];
        
        if ($stats['roi_percent'] < 20) {
            $recs[] = 'العائد على الاستثمار منخفض. راجع أسعار المؤثرين والاستهداف.';
        } elseif ($stats['roi_percent'] > 100) {
            $recs[] = 'أداء ممتاز! يمكن توسيع الحملة بميزانية أكبر.';
        }
        
        if ($stats['influencers_count'] < 3) {
            $recs[] = 'عدد المؤثرين قليل. إضافة مؤثرين بأحجام متنوعة سيحسّن الانتشار.';
        }
        
        return $recs;
    }
}
