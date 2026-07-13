<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 25)->unique(); // TR-2026-0001
            
            // Direction: outgoing (to influencer), incoming (from customer)
            $table->string('direction', 20)->default('outgoing');
            
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            
            // Financial
            $table->decimal('amount_base', 12, 2)->default(0);
            $table->decimal('vat', 12, 2)->default(0);
            $table->decimal('amount_total', 12, 2)->default(0);
            $table->boolean('with_vat')->default(true);
            
            // Workflow stage: 1 (pending transfer), 2 (transferred/pending invoice), 
            //                 3 (invoice ready/pending send), complete
            $table->string('workflow_stage', 20)->default('1');
            
            // Status: pending, transferred, completed, cancelled
            $table->string('status', 20)->default('pending');
            
            $table->integer('recipients_count')->default(1);
            
            $table->text('notes')->nullable();
            $table->text('reason')->nullable();
            
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete()
                ->comment('منسق مشاهير الذي رفع الطلب');
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete()
                ->comment('الموظف المسؤول من المالية');
            
            $table->timestamp('transferred_at')->nullable();
            $table->timestamp('invoiced_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            // WhatsApp tracking
            $table->timestamp('receipt_sent_to_influencer_at')->nullable();
            $table->timestamp('invoice_sent_to_customer_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('workflow_stage');
            $table->index('status');
            $table->index('direction');
        });
        
        // Recipients (per-recipient details for multi-recipient transfers)
        Schema::create('transfer_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfer_id')->constrained('transfers')->cascadeOnDelete();
            
            $table->foreignId('influencer_id')->nullable()->constrained('influencers')->nullOnDelete();
            
            // Type: primary, secondary
            $table->string('type', 20)->default('primary');
            
            $table->string('name');
            $table->string('role', 30)->nullable(); // مشهور, عميل
            
            // Banking
            $table->string('bank_name', 50)->nullable();
            $table->string('iban', 30)->nullable();
            $table->string('account_holder')->nullable();
            
            // Financial
            $table->decimal('amount_base', 10, 2)->default(0);
            $table->decimal('vat', 10, 2)->default(0);
            $table->decimal('amount_total', 10, 2)->default(0);
            $table->boolean('with_vat')->default(true);
            
            $table->text('note')->nullable();
            
            $table->timestamps();
            
            $table->index('influencer_id');
        });
        
        // Transfer attachments (receipts, tax invoices, quotations, etc.)
        Schema::create('transfer_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfer_id')->constrained('transfers')->cascadeOnDelete();
            $table->foreignId('recipient_id')->nullable()->constrained('transfer_recipients')->nullOnDelete();
            
            // Type: receipt, tax_invoice, quotation, other
            $table->string('type', 30);
            
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type', 50)->nullable();
            $table->integer('file_size')->nullable();
            
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('uploaded_at');
            
            $table->timestamps();
            
            $table->index(['transfer_id', 'type']);
        });
        
        // Transfer history/activity log
        Schema::create('transfer_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfer_id')->constrained('transfers')->cascadeOnDelete();
            
            // Action: submitted, transferred, receipt_uploaded, tax_invoice_uploaded,
            //         receipt_sent_whatsapp, invoice_sent_whatsapp, completed, etc.
            $table->string('action', 50);
            
            $table->text('note')->nullable();
            $table->json('metadata')->nullable();
            
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable(); // Cached for history
            
            $table->timestamp('occurred_at');
            $table->timestamps();
            
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfer_history');
        Schema::dropIfExists('transfer_attachments');
        Schema::dropIfExists('transfer_recipients');
        Schema::dropIfExists('transfers');
    }
};
