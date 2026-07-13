<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Content library (with AI analysis)
        Schema::create('contents', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns')->nullOnDelete();
            $table->foreignId('influencer_id')->nullable()->constrained('influencers')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            
            // Source: google_drive, tiktok, snapchat, twitter, instagram, youtube, other
            $table->string('source', 30);
            $table->string('platform', 30)->nullable();
            
            // Type: post, story, reel, video, image
            $table->string('type', 30)->nullable();
            
            $table->string('content_url');
            $table->string('thumbnail_url')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            
            $table->integer('rating')->default(0); // 0-5 stars
            
            // AI-generated insights
            $table->json('ai_analysis')->nullable();
            $table->text('ai_summary')->nullable();
            $table->json('ai_tags')->nullable();
            $table->decimal('ai_sentiment_score', 3, 2)->nullable(); // -1 to 1
            $table->timestamp('ai_analyzed_at')->nullable();
            
            $table->date('scheduled_date')->nullable();
            $table->date('published_date')->nullable();
            
            $table->bigInteger('views_count')->default(0);
            $table->bigInteger('likes_count')->default(0);
            $table->bigInteger('comments_count')->default(0);
            
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('source');
            $table->index('platform');
            $table->index('rating');
            $table->index('scheduled_date');
        });
        
        // WhatsApp message log
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            
            // Direction: outbound, inbound
            $table->string('direction', 10);
            
            // Type: text, document, image, video, template
            $table->string('type', 20);
            
            $table->string('to_phone');
            $table->string('from_phone')->nullable();
            
            $table->string('to_name')->nullable();
            $table->string('whatsapp_message_id')->nullable();
            
            $table->text('message')->nullable();
            $table->string('media_url')->nullable();
            $table->string('media_caption')->nullable();
            
            // Status: queued, sent, delivered, read, failed
            $table->string('status', 20)->default('queued');
            $table->text('error_message')->nullable();
            
            // Related entity (optional)
            $table->string('related_type', 30)->nullable();
            $table->unsignedBigInteger('related_id')->nullable();
            
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            
            $table->timestamps();
            
            $table->index('direction');
            $table->index('status');
            $table->index('whatsapp_message_id');
            $table->index(['related_type', 'related_id']);
        });
        
        // Email log (similar to WhatsApp)
        Schema::create('email_log', function (Blueprint $table) {
            $table->id();
            $table->string('to_email');
            $table->string('to_name')->nullable();
            $table->string('subject');
            $table->longText('body_html')->nullable();
            $table->text('body_text')->nullable();
            
            $table->string('status', 20)->default('queued');
            $table->text('error_message')->nullable();
            
            $table->string('related_type', 30)->nullable();
            $table->unsignedBigInteger('related_id')->nullable();
            
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            
            $table->timestamps();
            
            $table->index('status');
        });
        
        // System backups log
        Schema::create('system_backups', function (Blueprint $table) {
            $table->id();
            $table->string('reason', 100);
            $table->string('file_path');
            $table->integer('file_size')->nullable();
            $table->json('stats')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_backups');
        Schema::dropIfExists('email_log');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('contents');
    }
};
