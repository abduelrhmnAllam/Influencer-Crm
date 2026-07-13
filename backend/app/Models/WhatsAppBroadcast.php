<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppBroadcast extends Model
{
    protected $fillable = [
        'name', 'template_id', 'target_type', 'target_filters', 'recipients_data',
        'recipients_count', 'status', 'scheduled_at', 'started_at', 'completed_at',
        'sent_count', 'delivered_count', 'read_count', 'failed_count', 'replied_count',
        'total_cost', 'created_by',
    ];
    
    protected $casts = [
        'target_filters' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_cost' => 'decimal:4',
    ];
    
    public function template(): BelongsTo
    {
        return $this->belongsTo(WhatsAppTemplate::class, 'template_id');
    }
    
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function getDeliveryRateAttribute(): float
    {
        if ($this->sent_count === 0) return 0;
        return round(($this->delivered_count / $this->sent_count) * 100, 1);
    }
    
    public function getReadRateAttribute(): float
    {
        if ($this->delivered_count === 0) return 0;
        return round(($this->read_count / $this->delivered_count) * 100, 1);
    }
}
