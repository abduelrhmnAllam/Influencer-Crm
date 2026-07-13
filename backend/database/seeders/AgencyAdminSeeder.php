<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** وكالة افتراضية + مشرف بكلمة مرور عشوائية آمنة (لا كلمات افتراضية ضعيفة) */
class AgencyAdminSeeder extends Seeder
{
    public function run(): void
    {
        Tenancy::bypass(true); // إنشاء عبر الوكالات

        $agency = Agency::firstOrCreate(
            ['slug' => 'default'],
            ['name' => 'الوكالة الافتراضية', 'status' => 'active', 'contact_email' => env('AGENCY_EMAIL')]
        );

        // اشتراك تجريبي على خطة Professional
        $plan = Plan::where('code', 'professional')->first();
        if ($plan) {
            Subscription::firstOrCreate(
                ['agency_id' => $agency->id],
                ['plan_id' => $plan->id, 'billing_status' => 'trialing',
                 'trial_ends_at' => now()->addDays(14), 'current_period_start' => now(), 'current_period_end' => now()->addDays(14)]
            );
        }

        // مشرف الوكالة — كلمة مرور من env أو عشوائية تُطبع مرة واحدة
        $email = env('ADMIN_EMAIL', 'admin@smartcode.sa');
        $password = env('ADMIN_PASSWORD') ?: Str::password(16);

        $user = User::updateOrCreate(
            ['username' => 'admin'],
            ['agency_id' => $agency->id, 'name' => 'مدير النظام', 'email' => $email,
             'role' => 'agency_admin', 'is_active' => true, 'password' => Hash::make($password)]
        );

        if (! env('ADMIN_PASSWORD')) {
            $this->command?->warn("══════════════════════════════════════════");
            $this->command?->warn(" تم إنشاء المشرف. سجّل كلمة المرور التالية الآن (لن تظهر ثانيةً):");
            $this->command?->warn(" admin / {$password}");
            $this->command?->warn("══════════════════════════════════════════");
        }

        Tenancy::reset();
    }
}
