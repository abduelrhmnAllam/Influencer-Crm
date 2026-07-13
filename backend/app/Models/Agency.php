<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Agency extends Model
{
    use SoftDeletes;
    protected $fillable = ['name','slug','contact_email','contact_phone','status','settings'];
    protected $casts = ['settings' => 'array'];

    public function users(): HasMany { return $this->hasMany(User::class); }
    public function subscription(): HasOne { return $this->hasOne(Subscription::class)->latestOfMany(); }
    public function usageLimits(): HasMany { return $this->hasMany(UsageLimit::class); }
}
