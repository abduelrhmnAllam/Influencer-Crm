<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskActivity extends Model
{
    use HasFactory;
    
    protected $table = 'task_activity';
    
    protected $fillable = ['task_id', 'user_id', 'action', 'changes', 'occurred_at'];
    
    protected $casts = [
        'changes' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function task() { return $this->belongsTo(Task::class); }
    public function user() { return $this->belongsTo(User::class); }
}
