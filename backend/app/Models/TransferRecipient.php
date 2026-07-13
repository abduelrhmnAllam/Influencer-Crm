<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'transfer_id', 'influencer_id', 'type', 'name', 'role',
        'bank_name', 'iban', 'account_holder',
        'amount_base', 'vat', 'amount_total', 'with_vat',
        'note',
    ];

    protected $casts = [
        'amount_base' => 'decimal:2',
        'vat' => 'decimal:2',
        'amount_total' => 'decimal:2',
        'with_vat' => 'boolean',
    ];

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }

    public function influencer()
    {
        return $this->belongsTo(Influencer::class);
    }

    public function receipts()
    {
        return $this->hasMany(TransferAttachment::class, 'recipient_id')->where('type', 'receipt');
    }

    public function taxInvoices()
    {
        return $this->hasMany(TransferAttachment::class, 'recipient_id')->where('type', 'tax_invoice');
    }
}
