<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── الوكالات (جذر العزل متعدد المستأجرين) ──
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('status', 20)->default('active'); // active|suspended|trial
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ── الخطط ──
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // starter|professional|agency|enterprise
            $table->string('name');
            $table->decimal('monthly_price', 10, 2)->default(0);
            $table->string('currency', 3)->default('SAR');
            $table->unsignedInteger('max_users')->default(3);
            $table->unsignedInteger('max_clients')->default(25);
            $table->unsignedInteger('max_campaigns')->default(50);
            $table->unsignedInteger('max_influencers')->default(500);
            $table->unsignedInteger('max_reports')->default(50);
            $table->unsignedInteger('max_portal_links')->default(10);
            $table->boolean('is_active')->default(true);
            $table->json('features')->nullable();
            $table->timestamps();
        });

        // ── الاشتراكات ──
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans');
            $table->string('billing_status', 20)->default('trialing'); // trialing|active|past_due|canceled
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamps();
            $table->index(['agency_id', 'billing_status']);
        });

        // ── حدود/استهلاك الاستخدام (لقطة محسوبة) ──
        Schema::create('usage_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->string('resource', 40);   // users|clients|campaigns|influencers|reports|portal_links
            $table->unsignedInteger('used')->default(0);
            $table->unsignedInteger('limit')->default(0);
            $table->timestamp('period_reset_at')->nullable();
            $table->timestamps();
            $table->unique(['agency_id', 'resource']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_limits');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('agencies');
    }
};
