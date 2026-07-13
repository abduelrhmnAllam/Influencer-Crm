<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;
    protected $fillable = ['agency_id','user_id','actor_name','action','auditable_type',
        'auditable_id','changes','ip','user_agent','created_at'];
    protected $casts = ['changes' => 'array', 'created_at' => 'datetime'];
}
