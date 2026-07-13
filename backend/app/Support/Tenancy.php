<?php

namespace App\Support;

/** حامل سياق المستأجر الحالي (يُضبط من middleware بعد المصادقة) */
class Tenancy
{
    protected static ?int $agencyId = null;
    protected static bool $bypass = false; // للـSuper Admin / المهام الخلفية

    public static function setAgencyId(?int $id): void { static::$agencyId = $id; }
    public static function agencyId(): ?int { return static::$agencyId; }
    public static function check(): bool { return static::$agencyId !== null; }

    public static function bypass(bool $on = true): void { static::$bypass = $on; }
    public static function bypassing(): bool { return static::$bypass; }

    public static function reset(): void { static::$agencyId = null; static::$bypass = false; }
}
