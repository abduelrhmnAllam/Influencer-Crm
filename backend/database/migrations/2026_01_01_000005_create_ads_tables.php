<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pivot: campaign ↔ influencer with journey tracking
        Schema::create('campaign_influencers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('campaigns')->cascadeOnDelete();
            $table->foreignId('influencer_id')->constrained('influencers')->cascadeOnDelete();
            
            // Journey stages: prospect, contacted, agreed, content_received, published, paid, completed
            $table->string('journey_stage', 30)->default('prospect');
            
            $table->decimal('agreed_cost', 10, 2)->nullable();
            $table->decimal('agreed_sale', 10, 2)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('agreed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            $table->timestamps();
            
            $table->unique(['campaign_id', 'influencer_id']);
            $table->index('journey_stage');
        });
        
        // Daily Ads — each ad delivered/posted
        Schema::create('daily_ads', function (Blueprint $table) {
            $table->id();
            $table->string('code', 25)->unique(); // AD-2026-001
            
            $table->foreignId('campaign_id')->constrained('campaigns')->cascadeOnDelete();
            $table->foreignId('influencer_id')->constrained('influencers')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers');
            
            $table->date('ad_date');
            $table->string('platform', 30);
            
            // Status: scheduled, published, verified, cancelled
            $table->string('status', 20)->default('scheduled');
            
            $table->decimal('cost_price', 10, 2)->default(0);
            $table->decimal('sale_price', 10, 2)->default(0);
            
            $table->string('content_url')->nullable();
            $table->string('content_type', 30)->nullable(); // post, story, reel, video
            $table->text('notes')->nullable();
            
            $table->foreignId('coordinator_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamp('published_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('ad_date');
            $table->index('platform');
            $table->index('status');
            $table->index(['campaign_id', 'influencer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_ads');
        Schema::dropIfExists('campaign_influencers');
    }
};
