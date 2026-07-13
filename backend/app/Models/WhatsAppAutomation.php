<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppAutomation extends Model
{
    protected $fillable = [
        'name', 'keywords', 'response', 'match_type',
        'enabled', 'priority', 'trigger_count', 'last_triggered_at',
    ];
    
    protected $casts = [
        'keywords' => 'array',
        'enabled' => 'boolean',
        'last_triggered_at' => 'datetime',
    ];
}
