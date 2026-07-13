<?php
namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** الطلب — جدول requests (الاسم Request محجوز في Laravel) */
class CampaignRequest extends Model
{
    use BelongsToAgency, Auditable, SoftDeletes;

    protected $table = 'requests';
    protected $fillable = ['number','title','type','source','customer_id','customer_name',
        'request_user_id','requested_by','owner','status','priority','brief','shipping','quotation',
        'attachments','campaign_id','request_number','converted_at','stalled_reason'];
    protected $casts = [
        'brief' => 'array', 'shipping' => 'array', 'quotation' => 'array', 'attachments' => 'array',
        'converted_at' => 'datetime',
    ];

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function campaign(): BelongsTo { return $this->belongsTo(Campaign::class); }
    public function requestUser(): BelongsTo { return $this->belongsTo(RequestUser::class); }
    public function messages(): HasMany { return $this->hasMany(RequestMessage::class, 'request_id'); }
    public function timeline(): HasMany { return $this->hasMany(RequestTimeline::class, 'request_id'); }
    public function nominations(): HasMany { return $this->hasMany(Nomination::class, 'request_id'); }
}
