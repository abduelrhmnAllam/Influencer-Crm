<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Support\Tenancy;

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles, HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected static function booted(): void
    {
        // يمنع إنشاء مستخدم بلا وكالة (لا global scope حتى يبقى الدخول عبر المستأجرين)
        static::creating(function ($user) {
            if (Tenancy::bypassing()) {
                return; // seeders / super_admin يضبطون agency_id صراحةً
            }
            if (Tenancy::check()) {
                if (empty($user->agency_id)) {
                    $user->agency_id = Tenancy::agencyId();
                }
                return;
            }
            if (empty($user->agency_id)) {
                throw new \RuntimeException('تعذّر إنشاء مستخدم بلا سياق وكالة (tenant).');
            }
        });
    }

    protected $fillable = [
        'username', 'name', 'email', 'phone', 'password',
        'role', 'is_active', 'avatar_color',
        'preferences', 'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
        'preferences' => 'array',
        'permissions' => 'array',
    ];


    /* ==================== Role Helpers ==================== */

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function can($abilities, $arguments = []): bool
    {
        // Admin can do everything
        if ($this->isAdmin()) {
            return true;
        }
        
        $abilities = is_string($abilities) ? [$abilities] : $abilities;
        foreach ((array) $abilities as $ability) {
            if (in_array($ability, $this->permissions ?? [], true)) {
                return true;
            }
        }
        
        return false;
    }

    /* ==================== Relations ==================== */

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_by');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->notifications()->whereNull('read_at');
    }

    public function agency()
    {
        return $this->belongsTo(\App\Models\Agency::class);
    }
}
