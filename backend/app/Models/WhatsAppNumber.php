<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppNumber extends Model
{
    protected $fillable = [
        'phone_number_id', 'display_number', 'verified_name', 'label',
        'quality_rating', 'messaging_limit', 'is_primary', 'enabled',
        'sent_count', 'received_count',
    ];
    
    protected $casts = [
        'is_primary' => 'boolean',
        'enabled' => 'boolean',
    ];
}
