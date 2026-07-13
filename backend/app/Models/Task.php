<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes, BelongsToAgency;

    protected $fillable = [
        'code', 'title', 'description',
        'assigned_by', 'assigned_to',
        'related_type', 'related_id',
        'priority', 'status',
        'due_date', 'due_time',
        'progress',
        'started_at', 'completed_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function (Task $t) {
            if (empty($t->code)) {
                $last = self::orderByDesc('id')->first();
                $next = $last ? ((int) str_replace('TSK-', '', $last->code)) + 1 : 1;
                $t->code = 'TSK-' . str_pad($next, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function assignedBy() { return $this->belongsTo(User::class, 'assigned_by'); }
    public function assignedTo() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function comments() { return $this->hasMany(TaskComment::class); }
    public function activity() { return $this->hasMany(TaskActivity::class); }
    
    public function related()
    {
        if (!$this->related_type || !$this->related_id) return null;
        $modelClass = "App\\Models\\" . ucfirst($this->related_type);
        return class_exists($modelClass) ? $modelClass::find($this->related_id) : null;
    }
}
