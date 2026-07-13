<?php
namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;

class UsageLimit extends Model
{
    use BelongsToAgency;
    protected $fillable = ['resource','used','limit','period_reset_at'];
    protected $casts = ['period_reset_at' => 'datetime'];
}
