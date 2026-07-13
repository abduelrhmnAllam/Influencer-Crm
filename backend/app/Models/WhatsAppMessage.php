<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WhatsAppMessage extends Model
{
    protected $fillable = [
        'conversation_id', 'whatsapp_message_id',
        'direction', 'type',
        'from_phone', 'to_phone',
        'body', 'template_name', 'template_data', 'interactive_data',
        'media_url', 'media_caption', 'media_mime_type', 'media_filename',
        'metadata',
        'status', 'sent_at', 'delivered_at', 'read_at', 'failed_at', 'received_at',
        'error_message',
        'cost', 'pricing_category',
        'related_type', 'related_id', 'sent_by',
    ];
    
    protected $casts = [
        'template_data' => 'array',
        'interactive_data' => 'array',
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'failed_at' => 'datetime',
        'received_at' => 'datetime',
        'cost' => 'decimal:4',
    ];
    
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConversation::class, 'conversation_id');
    }
    
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
    
    public function related(): MorphTo
    {
        return $this->morphTo();
    }
}
