<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ═══ Configuration (single row) ═══
        Schema::create('whatsapp_configs', function (Blueprint $table) {
            $table->id();
            
            // Meta Business credentials
            $table->string('business_account_id', 100)->nullable();
            $table->string('phone_number_id', 100)->nullable();
            $table->string('display_phone_number', 30)->nullable();
            $table->string('verified_name', 255)->nullable();
            $table->text('access_token')->nullable();
            $table->string('app_id', 100)->nullable();
            $table->text('app_secret')->nullable();
            $table->string('webhook_verify_token', 100)->nullable();
            $table->string('api_version', 20)->default('v18.0');
            
            // Connection status
            $table->enum('connection_status', ['disconnected', 'connecting', 'connected', 'error'])
                  ->default('disconnected');
            $table->timestamp('last_connected_at')->nullable();
            $table->text('last_error')->nullable();
            
            // Quality + limits
            $table->enum('quality_rating', ['GREEN', 'YELLOW', 'RED'])->default('GREEN');
            $table->string('messaging_limit_tier', 30)->default('TIER_1K');
            
            // Business profile
            $table->string('business_name', 255)->nullable();
            $table->string('business_email', 255)->nullable();
            $table->string('business_website', 255)->nullable();
            $table->string('business_about', 139)->nullable(); // Meta limit
            $table->text('business_description')->nullable();
            $table->string('business_vertical', 50)->nullable();
            $table->string('business_address', 255)->nullable();
            $table->string('profile_picture_url', 500)->nullable();
            
            // Features
            $table->boolean('auto_reply_enabled')->default(false);
            $table->boolean('working_hours_enabled')->default(false);
            $table->json('working_hours')->nullable();
            
            $table->timestamps();
        });
        
        // ═══ Templates (Meta-approved messages) ═══
        Schema::create('whatsapp_templates', function (Blueprint $table) {
            $table->id();
            $table->string('meta_id', 100)->nullable()->unique();
            $table->string('name', 512);
            $table->string('language', 10)->default('ar');
            $table->enum('category', ['UTILITY', 'MARKETING', 'AUTHENTICATION']);
            $table->enum('status', ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED'])->default('DRAFT');
            
            // Components (simplified columns + full json)
            $table->string('header', 60)->nullable();
            $table->text('body');
            $table->string('footer', 60)->nullable();
            $table->json('components')->nullable(); // Full Meta-format components
            $table->json('buttons')->nullable();
            
            // Meta metadata
            $table->json('quality_score')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedInteger('variables_count')->default(0);
            
            $table->timestamps();
            $table->unique(['name', 'language']);
            $table->index('status');
        });
        
        // ═══ Conversations ═══
        Schema::create('whatsapp_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('contact_number', 30)->index();
            $table->string('contact_name', 255)->nullable();
            
            // Link to existing entities (optional)
            $table->morphs('related');                 // customer/influencer
            
            $table->enum('status', ['open', 'pending', 'closed', 'archived'])->default('open');
            $table->timestamp('last_message_at')->nullable();
            $table->unsignedInteger('unread_count')->default(0);
            $table->unsignedInteger('messages_count')->default(0);
            
            // 24-hour window tracking (Meta rule)
            $table->timestamp('customer_window_expires_at')->nullable();
            
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->index(['status', 'last_message_at']);
        });
        
        // ═══ Messages ═══
        Schema::dropIfExists('whatsapp_messages');
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->nullable()->constrained('whatsapp_conversations')->cascadeOnDelete();
            $table->string('whatsapp_message_id', 100)->nullable()->index();
            
            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('type', ['text', 'template', 'image', 'video', 'audio', 'document', 
                                  'location', 'contacts', 'sticker', 'interactive', 'button', 'reaction']);
            
            $table->string('from_phone', 30)->nullable();
            $table->string('to_phone', 30)->nullable();
            
            $table->text('body')->nullable();
            $table->string('template_name', 512)->nullable();
            $table->json('template_data')->nullable();
            $table->json('interactive_data')->nullable();
            
            // Media
            $table->string('media_url', 1000)->nullable();
            $table->string('media_caption', 1024)->nullable();
            $table->string('media_mime_type', 100)->nullable();
            $table->string('media_filename', 255)->nullable();
            
            // Full message metadata (for debugging)
            $table->json('metadata')->nullable();
            
            // Status tracking (sent → delivered → read OR failed)
            $table->enum('status', ['queued', 'sent', 'delivered', 'read', 'failed', 'received'])->default('queued');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->text('error_message')->nullable();
            
            // Pricing (Meta charges per conversation)
            $table->decimal('cost', 8, 4)->nullable();
            $table->string('pricing_category', 50)->nullable(); // marketing|utility|authentication|service
            
            // Relations
            $table->morphs('related');                 // campaign/transfer/etc
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->index(['direction', 'status']);
            $table->index('created_at');
        });
        
        // ═══ Broadcasts ═══
        Schema::create('whatsapp_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->foreignId('template_id')->constrained('whatsapp_templates')->restrictOnDelete();
            $table->enum('target_type', ['customers', 'influencers', 'segment', 'custom']);
            $table->json('target_filters')->nullable();
            $table->longText('recipients_data')->nullable(); // JSON of recipients with variables
            $table->unsignedInteger('recipients_count')->default(0);
            
            $table->enum('status', ['draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            // Stats
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('delivered_count')->default(0);
            $table->unsignedInteger('read_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('replied_count')->default(0);
            
            $table->decimal('total_cost', 10, 4)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->index(['status', 'scheduled_at']);
        });
        
        // ═══ Automation (auto-replies) ═══
        Schema::create('whatsapp_automations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->json('keywords'); // Array of trigger keywords
            $table->text('response');
            $table->enum('match_type', ['contains', 'exact', 'starts_with', 'regex'])->default('contains');
            $table->boolean('enabled')->default(true);
            $table->unsignedInteger('priority')->default(0);
            $table->unsignedBigInteger('trigger_count')->default(0);
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamps();
            $table->index('enabled');
        });
        
        // ═══ Numbers (multiple phone numbers per WABA) ═══
        Schema::create('whatsapp_numbers', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number_id', 100)->unique();
            $table->string('display_number', 30);
            $table->string('verified_name', 255)->nullable();
            $table->string('label', 100)->nullable(); // e.g. "Sales", "Support"
            $table->enum('quality_rating', ['GREEN', 'YELLOW', 'RED'])->default('GREEN');
            $table->string('messaging_limit', 30)->default('TIER_1K');
            $table->boolean('is_primary')->default(false);
            $table->boolean('enabled')->default(true);
            $table->unsignedBigInteger('sent_count')->default(0);
            $table->unsignedBigInteger('received_count')->default(0);
            $table->timestamps();
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_numbers');
        Schema::dropIfExists('whatsapp_automations');
        Schema::dropIfExists('whatsapp_broadcasts');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_conversations');
        Schema::dropIfExists('whatsapp_templates');
        Schema::dropIfExists('whatsapp_configs');
    }
};
