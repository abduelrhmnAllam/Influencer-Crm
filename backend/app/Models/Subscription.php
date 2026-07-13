<?php
namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use BelongsToAgency;
    protected $fillable = ['plan_id','billing_status','current_period_start',
        'current_period_end','trial_ends_at'];
    protected $casts = [
        'current_period_start' => 'datetime', 'current_period_end' => 'datetime', 'trial_ends_at' => 'datetime',
    ];

    public function plan(): BelongsTo { return $this->belongsTo(Plan::class); }
    public function isActive(): bool { return in_array($this->billing_status, ['active','trialing']); }
}
