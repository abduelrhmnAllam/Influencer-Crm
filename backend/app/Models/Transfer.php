<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transfer extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency, Auditable;

    protected $fillable = [
        'code', 'direction',
        'campaign_id', 'customer_id',
        'amount_base', 'vat', 'amount_total', 'with_vat',
        'workflow_stage', 'status',
        'recipients_count',
        'notes', 'reason',
        'requested_by', 'assignee_id',
        'transferred_at', 'invoiced_at', 'completed_at',
        'receipt_sent_to_influencer_at', 'invoice_sent_to_customer_at',
    ];

    protected $casts = [
        'amount_base' => 'decimal:2',
        'vat' => 'decimal:2',
        'amount_total' => 'decimal:2',
        'with_vat' => 'boolean',
        'transferred_at' => 'datetime',
        'invoiced_at' => 'datetime',
        'completed_at' => 'datetime',
        'receipt_sent_to_influencer_at' => 'datetime',
        'invoice_sent_to_customer_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function (Transfer $t) {
            if (empty($t->code)) {
                $year = now()->year;
                $count = self::whereYear('created_at', $year)->count() + 1;
                $t->code = 'TR-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /* ==================== Relations ==================== */

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function recipients()
    {
        return $this->hasMany(TransferRecipient::class);
    }

    public function attachments()
    {
        return $this->hasMany(TransferAttachment::class);
    }

    public function history()
    {
        return $this->hasMany(TransferHistory::class)->orderByDesc('occurred_at');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function receipts()
    {
        return $this->attachments()->where('type', 'receipt');
    }

    public function taxInvoices()
    {
        return $this->attachments()->where('type', 'tax_invoice');
    }

    /* ==================== Workflow Methods ==================== */

    public function markTransferred(?User $user = null): self
    {
        $this->workflow_stage = '2';
        $this->status = 'transferred';
        $this->transferred_at = now();
        $this->save();
        
        $this->logHistory('transferred', 'تم تنفيذ التحويل', $user);
        return $this;
    }

    public function markInvoiceUploaded(?User $user = null): self
    {
        $this->workflow_stage = '3';
        $this->invoiced_at = now();
        $this->save();
        
        $this->logHistory('tax_invoice_uploaded', 'تم رفع الفاتورة الضريبية', $user);
        return $this;
    }

    public function markCompleted(?User $user = null): self
    {
        $this->workflow_stage = 'complete';
        $this->status = 'completed';
        $this->completed_at = now();
        $this->save();
        
        $this->logHistory('completed', 'تم إغلاق الحوالة', $user);
        return $this;
    }

    public function markReceiptSentToInfluencer(?User $user = null): self
    {
        $this->receipt_sent_to_influencer_at = now();
        $this->save();
        
        $this->logHistory('receipt_sent_whatsapp', 'تم إرسال إيصال للمشهور عبر واتساب', $user);
        return $this;
    }

    public function markInvoiceSentToCustomer(?User $user = null): self
    {
        $this->invoice_sent_to_customer_at = now();
        $this->save();
        
        $this->logHistory('invoice_sent_whatsapp', 'تم إرسال فاتورة ضريبية للعميل عبر واتساب', $user);
        return $this;
    }

    public function logHistory(string $action, string $note = '', ?User $user = null, array $metadata = []): TransferHistory
    {
        return $this->history()->create([
            'action' => $action,
            'note' => $note,
            'metadata' => $metadata,
            'user_id' => $user?->id ?? auth()->id(),
            'user_name' => $user?->name ?? auth()->user()?->name ?? 'النظام',
            'occurred_at' => now(),
        ]);
    }
}
