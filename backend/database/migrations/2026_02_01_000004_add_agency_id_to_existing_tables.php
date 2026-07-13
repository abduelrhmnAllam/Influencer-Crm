<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** عزل البيانات: ربط الجداول القائمة بالوكالة */
    private array $tables = [
        'users', 'customers', 'influencers', 'campaigns',
        'transfers', 'tasks', 'notifications', 'contents', 'daily_ads',
    ];

    public function up(): void
    {
        foreach ($this->tables as $t) {
            if (Schema::hasTable($t) && ! Schema::hasColumn($t, 'agency_id')) {
                Schema::table($t, function (Blueprint $table) {
                    // عمود + فهرس فقط (بلا FK على مستوى DB): SQLite لا تدعم إضافة FK عبر ALTER،
                    // والعلاقة مفروضة على مستوى التطبيق عبر سمة BelongsToAgency + global scope.
                    $table->unsignedBigInteger('agency_id')->nullable()->after('id');
                    $table->index('agency_id');
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $t) {
            if (Schema::hasTable($t) && Schema::hasColumn($t, 'agency_id')) {
                Schema::table($t, function (Blueprint $table) {
                    $table->dropIndex(['agency_id']);
                    $table->dropColumn('agency_id');
                });
            }
        }
    }
};
