<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;

class Notification extends Model
{
    use HasFactory, BelongsToAgency;

    protected $fillable = [
        'user_id', 'type', 'title', 'body', 'url',
        'related_type', 'related_id',
        'read_at', 'emailed_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'emailed_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }

    public function markAsRead(): self
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
        return $this;
    }

    public function scopeUnread($query) { return $query->whereNull('read_at'); }
}
