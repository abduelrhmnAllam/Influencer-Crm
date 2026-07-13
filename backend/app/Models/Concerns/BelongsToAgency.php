<?php

namespace App\Models\Concerns;

use App\Models\Agency;
use App\Models\Scopes\AgencyScope;
use App\Support\Tenancy;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * عزل تلقائي بالوكالة:
 *  - global scope يفرض القراءة المعزولة (fail-closed).
 *  - عند الإنشاء: agency_id يُفرض من الخادم دائماً ولا يُقبل من المدخلات.
 */
trait BelongsToAgency
{
    public static function bootBelongsToAgency(): void
    {
        static::addGlobalScope(new AgencyScope);

        static::creating(function ($model) {
            // وضع التجاوز (super_admin / seeders): يُسمح بضبط agency_id صراحةً
            if (Tenancy::bypassing()) {
                return;
            }
            // سياق مستأجر موجود → افرض الوكالة وتجاهل أي قيمة واردة من المدخلات
            if (Tenancy::check()) {
                $model->agency_id = Tenancy::agencyId();
                return;
            }
            // لا سياق ولا تجاوز → امنع إنشاء سجل يتيم
            throw new \RuntimeException('تعذّر إنشاء السجل: لا يوجد سياق وكالة (tenant).');
        });
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }
}
