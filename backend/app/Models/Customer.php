<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency, Auditable;

    protected $fillable = [
        'code', 'name', 'contact_person', 'phone', 'email',
        'sector', 'cr_number', 'vat_number', 'address', 'notes',
        'status', 'assignee_id', 'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'total_spent' => 'decimal:2',
    ];

    /* ==================== Boot ==================== */

    protected static function booted()
    {
        static::creating(function (Customer $customer) {
            if (empty($customer->code)) {
                $last = self::orderByDesc('id')->first();
                $next = $last ? ((int) str_replace('CL-', '', $last->code)) + 1 : 100;
                $customer->code = 'CL-' . str_pad($next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    /* ==================== Relations ==================== */

    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function activeCampaigns()
    {
        return $this->campaigns()->where('status', 'active');
    }

    public function dailyAds()
    {
        return $this->hasMany(DailyAd::class);
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
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

    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;
        
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('code', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('contact_person', 'like', "%{$term}%");
        });
    }

    /* ==================== Cached counts ==================== */

    public function refreshCachedCounts(): void
    {
        $this->update([
            'campaigns_count' => $this->campaigns()->count(),
            'active_campaigns_count' => $this->activeCampaigns()->count(),
            'total_spent' => $this->dailyAds()->sum('sale_price'),
        ]);
    }
}
