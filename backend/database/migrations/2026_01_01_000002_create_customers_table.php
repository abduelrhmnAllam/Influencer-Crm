<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // CL-001 format
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('sector', 100)->nullable();
            $table->string('cr_number', 20)->nullable()->comment('السجل التجاري');
            $table->string('vat_number', 20)->nullable()->comment('الرقم الضريبي');
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            
            // Status: active, inactive, archived
            $table->string('status', 20)->default('active');
            
            // Financial summary (cached)
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->integer('campaigns_count')->default(0);
            $table->integer('active_campaigns_count')->default(0);
            
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('tags')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('status');
            $table->index('name');
            if (config('database.default') !== 'sqlite') {
                $table->fullText(['name', 'contact_person', 'phone', 'email']);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
