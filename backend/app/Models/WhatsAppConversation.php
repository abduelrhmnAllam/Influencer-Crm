<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppConversation extends Model
{
    protected $fillable = [
        'contact_number', 'contact_name', 'related_type', 'related_id',
        'status', 'last_message_at', 'unread_count', 'messages_count',
        'customer_window_expires_at', 'tags', 'notes', 'assigned_to',
    ];
    
    protected $casts = [
        'last_message_at' => 'datetime',
        'customer_window_expires_at' => 'datetime',
        'tags' => 'array',
    ];
    
    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'conversation_id');
    }
    
    public function related(): MorphTo
    {
        return $this->morphTo();
    }
    
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
    
    /** Check if within 24-hour customer service window */
    public function isWithinWindow(): bool
    {
        return $this->customer_window_expires_at && $this->customer_window_expires_at->isFuture();
    }
}
