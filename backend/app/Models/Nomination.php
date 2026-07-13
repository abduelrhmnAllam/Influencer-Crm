<?php
namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nomination extends Model
{
    use BelongsToAgency, Auditable;

    protected $fillable = ['campaign_id','request_id','influencer_id','influencer_name',
        'platforms','account_url','proposed_date','ad_type','selling_price','cost_price','with_vat',
        'status','client_decision','client_notes','internal_approved_at','internal_rejected_at','alternative_for'];
    protected $casts = [
        'platforms' => 'array', 'with_vat' => 'boolean',
        'selling_price' => 'decimal:2', 'cost_price' => 'decimal:2',
        'internal_approved_at' => 'datetime', 'internal_rejected_at' => 'datetime',
    ];
    // التكلفة والربح داخلي فقط — يُخفى في استجابات البوابة الخارجية
    protected $hidden = ['cost_price'];

    public function campaign(): BelongsTo { return $this->belongsTo(Campaign::class); }
    public function influencer(): BelongsTo { return $this->belongsTo(Influencer::class); }
    public function request(): BelongsTo { return $this->belongsTo(CampaignRequest::class, 'request_id'); }
}
