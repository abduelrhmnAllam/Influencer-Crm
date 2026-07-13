<?php
namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestUser extends Model
{
    use BelongsToAgency, SoftDeletes;

    protected $fillable = ['name','org','role','email','phone','user_type','status',
        'customer_id','permissions','token','token_expires_at','token_revoked','last_login_at'];
    protected $casts = [
        'permissions' => 'array', 'token_revoked' => 'boolean',
        'token_expires_at' => 'datetime', 'last_login_at' => 'datetime',
    ];
    protected $hidden = ['token']; // لا يُكشف في استجابات عامة

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function requests(): HasMany { return $this->hasMany(CampaignRequest::class, 'request_user_id'); }

    public function can(string $perm): bool
    {
        return is_array($this->permissions) && in_array($perm, $this->permissions);
    }

    public function tokenValid(): bool
    {
        if ($this->status !== 'active' || $this->token_revoked) return false;
        if ($this->token_expires_at && $this->token_expires_at->isPast()) return false;
        return true;
    }
}
