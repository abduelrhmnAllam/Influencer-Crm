<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsAppTemplate extends Model
{
    protected $fillable = [
        'meta_id', 'name', 'language', 'category', 'status',
        'header', 'body', 'footer', 'components', 'buttons',
        'quality_score', 'rejection_reason', 'variables_count',
    ];
    
    protected $casts = [
        'components' => 'array',
        'buttons' => 'array',
        'quality_score' => 'array',
    ];
    
    public function broadcasts(): HasMany
    {
        return $this->hasMany(WhatsAppBroadcast::class, 'template_id');
    }
}
