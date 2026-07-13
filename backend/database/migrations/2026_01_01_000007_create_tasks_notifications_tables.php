<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // TSK-001
            $table->string('title');
            $table->text('description')->nullable();
            
            $table->foreignId('assigned_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to')->constrained('users')->cascadeOnDelete();
            
            // Related polymorphic: customer, influencer, campaign, transfer
            $table->string('related_type', 30)->nullable();
            $table->unsignedBigInteger('related_id')->nullable();
            
            // Priority: low, normal, high, urgent
            $table->string('priority', 10)->default('normal');
            
            // Status: pending, in_progress, completed, cancelled
            $table->string('status', 20)->default('pending');
            
            $table->date('due_date')->nullable();
            $table->time('due_time')->nullable();
            
            $table->integer('progress')->default(0); // 0-100
            
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('status');
            $table->index('priority');
            $table->index('due_date');
            $table->index('assigned_to');
            $table->index(['related_type', 'related_id']);
        });
        
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });
        
        Schema::create('task_activity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 50); // created, updated, status_changed, assigned, completed
            $table->json('changes')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
        });
        
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Type: task_assigned, task_due, transfer_pending, mention, etc.
            $table->string('type', 50);
            
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('url')->nullable();
            
            // Related entity
            $table->string('related_type', 30)->nullable();
            $table->unsignedBigInteger('related_id')->nullable();
            
            $table->timestamp('read_at')->nullable();
            $table->timestamp('emailed_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['user_id', 'read_at']);
        });
        
        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('action', 50);
            $table->string('entity_type', 30)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
            
            $table->index('action');
            $table->index('user_id');
            $table->index('occurred_at');
        });
        
        // Settings (key-value store for system settings)
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('type', 20)->default('string'); // string, int, bool, json
            $table->string('group', 50)->default('general');
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index('group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('activity_log');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('task_activity');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('tasks');
    }
};
