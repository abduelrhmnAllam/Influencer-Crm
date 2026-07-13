<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\SoftDeletes;

class Content extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    protected $fillable = [
        'code', 'campaign_id', 'influencer_id', 'customer_id',
        'source', 'platform', 'type',
        'content_url', 'thumbnail_url', 'title', 'description',
        'rating',
        'ai_analysis', 'ai_summary', 'ai_tags', 'ai_sentiment_score', 'ai_analyzed_at',
        'scheduled_date', 'published_date',
        'views_count', 'likes_count', 'comments_count',
        'uploaded_by',
    ];

    protected $casts = [
        'ai_analysis' => 'array',
        'ai_tags' => 'array',
        'ai_analyzed_at' => 'datetime',
        'scheduled_date' => 'date',
        'published_date' => 'date',
        'ai_sentiment_score' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function (Content $c) {
            if (empty($c->code)) {
                $last = self::orderByDesc('id')->first();
                $next = $last ? ((int) str_replace('CT-', '', $last->code)) + 1 : 1;
                $c->code = 'CT-' . str_pad($next, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    public function campaign() { return $this->belongsTo(Campaign::class); }
    public function influencer() { return $this->belongsTo(Influencer::class); }
    public function customer() { return $this->belongsTo(Customer::class); }
    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
}
