<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transfer_id', 'recipient_id', 'type',
        'file_name', 'file_path', 'mime_type', 'file_size',
        'uploaded_by', 'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function transfer() { return $this->belongsTo(Transfer::class); }
    public function recipient() { return $this->belongsTo(TransferRecipient::class, 'recipient_id'); }
    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
}
