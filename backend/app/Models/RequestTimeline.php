<?php
namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;

class RequestTimeline extends Model
{
    use BelongsToAgency;
    protected $fillable = ['request_id','action','actor','payload','happened_at'];
    protected $casts = ['payload' => 'array', 'happened_at' => 'datetime'];
}
