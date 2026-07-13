<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('social_id')->nullable()->after('password');
            $table->string('social_type', 20)->nullable()->after('social_id');
            $table->timestamp('email_verified_at')->nullable()->after('social_type');
            $table->string('password')->nullable()->change(); // Allow password to be nullable for social logins
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();
            $table->dropColumn(['social_id', 'social_type', 'email_verified_at']);
        });
    }
};
