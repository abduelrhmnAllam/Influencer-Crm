<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Influencer extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency, Auditable;

    protected $fillable = [
        'code', 'name', 'username', 'phone', 'email',
        'platform', 'followers', 'category', 'rating',
        'gender', 'region', 'country',
        'cost_price', 'sale_price',
        'bank_name', 'iban', 'account_holder',
        'status', 'notes',
        'social_links', 'tags', 'additional_platforms',
        'assignee_id',
    ];

    protected $casts = [
        'social_links' => 'array',
        'tags' => 'array',
        'additional_platforms' => 'array',
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'total_earned' => 'decimal:2',
        'avg_rating' => 'decimal:2',
    ];

    /* ==================== Boot ==================== */

    protected static function booted()
    {
        static::creating(function (Influencer $inf) {
            if (empty($inf->code)) {
                $last = self::orderByDesc('id')->first();
                $next = $last ? ((int) str_replace('IN-', '', $last->code)) + 1 : 100;
                $inf->code = 'IN-' . str_pad($next, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /* ==================== Relations ==================== */

    public function campaigns()
    {
        return $this->belongsToMany(Campaign::class, 'campaign_influencers')
            ->withPivot(['journey_stage', 'agreed_cost', 'agreed_sale', 'notes'])
            ->withTimestamps();
    }

    public function dailyAds()
    {
        return $this->hasMany(DailyAd::class);
    }

    public function transferRecipients()
    {
        return $this->hasMany(TransferRecipient::class);
    }

    public function contents()
    {
        return $this->hasMany(Content::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    /* ==================== Scopes ==================== */

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    public function scopeRating($query, string $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;
        
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('code', 'like', "%{$term}%")
              ->orWhere('username', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%");
        });
    }

    /* ==================== Helpers ==================== */

    public function formattedFollowers(): string
    {
        if ($this->followers >= 1000000) {
            return round($this->followers / 1000000, 1) . 'M';
        }
        if ($this->followers >= 1000) {
            return round($this->followers / 1000, 1) . 'K';
        }
        return (string) $this->followers;
    }

    public function refreshCachedCounts(): void
    {
        $this->update([
            'ads_count' => $this->dailyAds()->count(),
            'campaigns_count' => $this->campaigns()->count(),
            'total_earned' => $this->dailyAds()->sum('cost_price'),
        ]);
    }
}
