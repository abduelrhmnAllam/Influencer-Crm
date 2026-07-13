<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyAd extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    protected $fillable = [
        'code', 'campaign_id', 'influencer_id', 'customer_id',
        'ad_date', 'platform', 'status',
        'cost_price', 'sale_price',
        'content_url', 'content_type', 'notes',
        'coordinator_id', 'published_at', 'verified_at', 'verified_by',
    ];

    protected $casts = [
        'ad_date' => 'date',
        'published_at' => 'datetime',
        'verified_at' => 'datetime',
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function (DailyAd $a) {
            if (empty($a->code)) {
                $year = now()->year;
                $count = self::whereYear('created_at', $year)->count() + 1;
                $a->code = 'AD-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function campaign() { return $this->belongsTo(Campaign::class); }
    public function influencer() { return $this->belongsTo(Influencer::class); }
    public function customer() { return $this->belongsTo(Customer::class); }
    public function coordinator() { return $this->belongsTo(User::class, 'coordinator_id'); }
    public function verifier() { return $this->belongsTo(User::class, 'verified_by'); }
    
    public function getProfitAttribute(): float
    {
        return (float) $this->sale_price - (float) $this->cost_price;
    }
}
