<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) الخطط + الوكالة الافتراضية + مشرفها (كلمة مرور عشوائية آمنة) + الأدوار والصلاحيات
        $this->call([
            PlanSeeder::class,
            AgencyAdminSeeder::class,
            RolesAndPermissionsSeeder::class,
            DemoDataSeeder::class,
            InfluencerSeeder::class,
        ]);

        // 2) مستخدمو أدوار قانونية تحت الوكالة الافتراضية (بلا كلمات مرور ضعيفة)
        Tenancy::bypass(true);
        $agency = Agency::where('slug', 'default')->first();

        $roleUsers = [
            ['username' => 'manager',   'name' => 'مدير حملات',  'role' => 'campaign_manager'],
            ['username' => 'finance',   'name' => 'المالية',     'role' => 'finance'],
            ['username' => 'viewer',    'name' => 'مشاهد',       'role' => 'viewer'],
        ];
        foreach ($roleUsers as $u) {
            $pwd = env('SEED_USER_PASSWORD') ?: Str::password(14);
            User::updateOrCreate(
                ['username' => $u['username']],
                array_merge($u, [
                    'agency_id' => $agency?->id,
                    'is_active' => true,
                    'email'     => $u['username'] . '@smartcode.sa',
                    'password'  => Hash::make($pwd),
                ])
            );
            if (! env('SEED_USER_PASSWORD')) {
                $this->command?->warn("  مستخدم {$u['username']} ({$u['role']}) — كلمة المرور: {$pwd}");
            }
        }
        Tenancy::reset();

        $this->command?->info('✅ تمت التهيئة: خطط + وكالة افتراضية + مستخدمو أدوار قانونية (بلا كلمات مرور افتراضية ضعيفة).');
    }
}
