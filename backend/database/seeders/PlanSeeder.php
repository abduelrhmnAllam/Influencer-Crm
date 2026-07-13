<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['code'=>'starter','name'=>'Starter','monthly_price'=>199,
             'max_users'=>3,'max_clients'=>25,'max_campaigns'=>50,'max_influencers'=>500,'max_reports'=>50,'max_portal_links'=>10],
            ['code'=>'professional','name'=>'Professional','monthly_price'=>499,
             'max_users'=>10,'max_clients'=>100,'max_campaigns'=>300,'max_influencers'=>3000,'max_reports'=>300,'max_portal_links'=>50],
            ['code'=>'agency','name'=>'Agency','monthly_price'=>999,
             'max_users'=>30,'max_clients'=>500,'max_campaigns'=>2000,'max_influencers'=>20000,'max_reports'=>2000,'max_portal_links'=>300],
            ['code'=>'enterprise','name'=>'Enterprise','monthly_price'=>0,
             'max_users'=>0,'max_clients'=>0,'max_campaigns'=>0,'max_influencers'=>0,'max_reports'=>0,'max_portal_links'=>0], // 0 = غير محدود
        ];
        foreach ($plans as $p) {
            Plan::updateOrCreate(['code' => $p['code']], $p + ['currency' => 'SAR', 'is_active' => true]);
        }
    }
}
