<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferHistory extends Model
{
    use HasFactory;
    
    protected $table = 'transfer_history';

    protected $fillable = [
        'transfer_id', 'action', 'note', 'metadata',
        'user_id', 'user_name', 'occurred_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function transfer() { return $this->belongsTo(Transfer::class); }
    public function user() { return $this->belongsTo(User::class); }
}
