<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use App\Support\Tenancy;
use Illuminate\Support\Facades\Auth;

/** يسجّل كل إنشاء/تعديل/حذف للسجل التدقيقي */
trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(fn ($m) => $m->writeAudit('create'));
        static::updated(fn ($m) => $m->writeAudit('update', $m->getChanges()));
        static::deleted(fn ($m) => $m->writeAudit('delete'));
    }

    public function writeAudit(string $action, array $changes = []): void
    {
        try {
            AuditLog::create([
                'agency_id'      => $this->agency_id ?? Tenancy::agencyId(),
                'user_id'        => Auth::id(),
                'actor_name'     => Auth::user()->name ?? 'system',
                'action'         => $action,
                'auditable_type' => static::class,
                'auditable_id'   => $this->getKey(),
                'changes'        => $changes ?: null,
                'ip'             => request()->ip(),
                'user_agent'     => substr((string) request()->userAgent(), 0, 255),
            ]);
        } catch (\Throwable $e) {
            // لا نُفشل العملية الأساسية بسبب التدقيق
        }
    }
}
