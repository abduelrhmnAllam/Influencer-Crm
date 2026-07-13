<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // CMP-001
            $table->string('name');
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            $table->decimal('budget', 12, 2)->default(0)->comment('الميزانية');
            $table->decimal('total_cost', 12, 2)->default(0)->comment('إجمالي التكلفة');
            $table->decimal('total_sale', 12, 2)->default(0)->comment('إجمالي البيع');
            
            // Status: draft, active, paused, completed, cancelled
            $table->string('status', 20)->default('active');
            
            $table->text('description')->nullable();
            $table->text('objectives')->nullable();
            $table->text('notes')->nullable();
            
            // Cached counts
            $table->integer('influencers_count')->default(0);
            $table->integer('ads_count')->default(0);
            
            $table->foreignId('coordinator_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->json('tags')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('status');
            $table->index('start_date');
            $table->index('customer_id');
            if (config('database.default') !== 'sqlite') {
                $table->fullText(['name', 'description']);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
