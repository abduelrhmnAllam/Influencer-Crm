<?php

namespace App\Models\Scopes;

use App\Support\Tenancy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/** يفرض عزل البيانات: كل استعلام مقيّد بوكالة المستخدم الحالي */
class AgencyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (Tenancy::bypassing()) {
            return; // Super Admin أو مهمة خلفية تتعامل مع كل الوكالات صراحةً
        }
        if (Tenancy::check()) {
            $builder->where($model->getTable() . '.agency_id', Tenancy::agencyId());
        } else {
            // بلا سياق مستأجر = لا بيانات (fail-closed) — أمان افتراضي
            $builder->whereRaw('1 = 0');
        }
    }
}
