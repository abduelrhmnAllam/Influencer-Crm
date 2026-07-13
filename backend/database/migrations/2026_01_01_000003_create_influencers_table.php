<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('influencers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // IN-001
            $table->string('name');
            $table->string('username', 100)->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            
            // Primary platform: instagram, tiktok, snapchat, twitter, youtube, linkedin
            $table->string('platform', 30);
            
            $table->bigInteger('followers')->default(0);
            $table->string('category', 50)->nullable();
            $table->string('rating', 5)->nullable(); // A+, A, B, C
            $table->string('gender', 10)->nullable();
            $table->string('region', 50)->nullable();
            $table->string('country', 50)->default('SA');
            
            // Pricing
            $table->decimal('cost_price', 10, 2)->default(0)->comment('سعر التكلفة');
            $table->decimal('sale_price', 10, 2)->default(0)->comment('سعر البيع');
            
            // Banking
            $table->string('bank_name', 50)->nullable();
            $table->string('iban', 30)->nullable();
            $table->string('account_holder')->nullable();
            
            // Stats (cached)
            $table->integer('campaigns_count')->default(0);
            $table->integer('ads_count')->default(0);
            $table->decimal('total_earned', 12, 2)->default(0);
            $table->decimal('avg_rating', 3, 2)->nullable();
            
            // Status: active, inactive, blacklisted
            $table->string('status', 20)->default('active');
            
            $table->text('notes')->nullable();
            $table->json('social_links')->nullable();
            $table->json('tags')->nullable();
            
            // Other platforms (multi-platform support)
            $table->json('additional_platforms')->nullable();
            
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('platform');
            $table->index('category');
            $table->index('rating');
            $table->index('status');
            $table->index('region');
            if (config('database.default') !== 'sqlite') {
                $table->fullText(['name', 'username', 'phone']);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('influencers');
    }
};
