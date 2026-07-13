<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── مستخدمو الطلبات (خارجيون: عملاء/إدارة مشاريع) ──
        Schema::create('request_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->string('name');
            $table->string('org')->nullable();
            $table->string('role')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('user_type', 30)->default('client'); // project_employee|client|external_coordinator|guest
            $table->string('status', 20)->default('active');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->json('permissions')->nullable();
            $table->string('token', 80)->unique();          // رمز البوابة
            $table->timestamp('token_expires_at')->nullable(); // انتهاء صلاحية الرابط
            $table->boolean('token_revoked')->default(false);  // إبطال الرابط
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['agency_id', 'status']);
        });

        // ── الطلبات ──
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->string('number')->index();
            $table->string('title');
            $table->string('type', 30)->default('campaign');
            $table->string('source', 30)->default('internal_employee');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->foreignId('request_user_id')->nullable()->constrained('request_users')->nullOnDelete();
            $table->string('requested_by')->nullable();
            $table->string('owner')->nullable();
            $table->string('status', 40)->default('new');
            $table->string('priority', 10)->default('medium');
            $table->json('brief')->nullable();
            $table->json('shipping')->nullable();
            $table->json('quotation')->nullable();
            $table->json('attachments')->nullable();
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns')->nullOnDelete();
            $table->string('request_number')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->string('stalled_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['agency_id', 'status']);
            $table->index(['agency_id', 'source']);
        });

        // ── مراسلات الطلب ──
        Schema::create('request_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->text('body');
            $table->string('visibility', 12)->default('internal'); // internal|external
            $table->string('author')->nullable();
            $table->string('author_role')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
            $table->index('request_id');
        });

        // ── السجل الزمني للطلب ──
        Schema::create('request_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->string('action', 50);
            $table->string('actor')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('happened_at')->useCurrent();
            $table->timestamps();
            $table->index('request_id');
        });

        // ── الترشيحات (مرتبطة بالحملة، تُستخدم في الطلب قبل/بعد التحويل) ──
        Schema::create('nominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->constrained('agencies')->cascadeOnDelete();
            $table->foreignId('campaign_id')->nullable()->constrained('campaigns')->nullOnDelete();
            $table->foreignId('request_id')->nullable()->constrained('requests')->nullOnDelete();
            $table->foreignId('influencer_id')->nullable()->constrained('influencers')->nullOnDelete();
            $table->string('influencer_name')->nullable();
            $table->json('platforms')->nullable();
            $table->string('account_url')->nullable();
            $table->string('proposed_date')->nullable();
            $table->string('ad_type')->nullable();
            $table->decimal('selling_price', 12, 2)->nullable();
            $table->decimal('cost_price', 12, 2)->nullable();   // داخلي فقط — لا يُكشف للبوابة
            $table->boolean('with_vat')->default(false);
            $table->string('status', 30)->default('pending');
            $table->string('client_decision', 20)->nullable();  // approved|rejected|held
            $table->text('client_notes')->nullable();
            $table->timestamp('internal_approved_at')->nullable();
            $table->timestamp('internal_rejected_at')->nullable();
            $table->foreignId('alternative_for')->nullable()->constrained('nominations')->nullOnDelete();
            $table->timestamps();
            $table->index(['agency_id', 'campaign_id']);
            $table->index('request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nominations');
        Schema::dropIfExists('request_timelines');
        Schema::dropIfExists('request_messages');
        Schema::dropIfExists('requests');
        Schema::dropIfExists('request_users');
    }
};
