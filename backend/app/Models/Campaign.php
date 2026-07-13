<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency, Auditable;

    protected $fillable = [
        'code', 'name', 'customer_id',
        'start_date', 'end_date',
        'budget', 'total_cost', 'total_sale',
        'status', 'description', 'objectives', 'notes',
        'coordinator_id', 'tags', 'metadata',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'total_sale' => 'decimal:2',
        'tags' => 'array',
        'metadata' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function (Campaign $c) {
            if (empty($c->code)) {
                $last = self::orderByDesc('id')->first();
                $next = $last ? ((int) str_replace('CMP-', '', $last->code)) + 1 : 100;
                $c->code = 'CMP-' . str_pad($next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    /* ==================== Relations ==================== */

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    public function influencers()
    {
        return $this->belongsToMany(Influencer::class, 'campaign_influencers')
            ->withPivot(['journey_stage', 'agreed_cost', 'agreed_sale', 'notes', 'contacted_at', 'agreed_at'])
            ->withTimestamps();
    }

    public function dailyAds()
    {
        return $this->hasMany(DailyAd::class);
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }

    /* ==================== Scopes ==================== */

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeBetween($query, $start, $end)
    {
        return $query->whereBetween('start_date', [$start, $end]);
    }

    /* ==================== Computed ==================== */

    public function getProfitAttribute(): float
    {
        return (float) $this->total_sale - (float) $this->total_cost;
    }

    public function refreshFinancials(): void
    {
        $this->update([
            'total_cost' => $this->dailyAds()->sum('cost_price'),
            'total_sale' => $this->dailyAds()->sum('sale_price'),
            'ads_count' => $this->dailyAds()->count(),
            'influencers_count' => $this->influencers()->count(),
        ]);
    }
}
