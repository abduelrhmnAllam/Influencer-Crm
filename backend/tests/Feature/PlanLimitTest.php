<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlanLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_beyond_plan_limit_is_blocked(): void
    {
        $plan = Plan::create([
            'code' => 'starter', 'name' => 'Starter', 'monthly_price' => 0,
            'max_users' => 3, 'max_clients' => 25, 'max_campaigns' => 1,
            'max_influencers' => 100, 'max_reports' => 10,
            'max_portal_links' => 1, 'is_active' => true,
        ]);
        $agency = Agency::create(['name' => 'A', 'slug' => 'p', 'status' => 'active']);
        Tenancy::setAgencyId($agency->id);
        Subscription::create([
            'agency_id' => $agency->id, 'plan_id' => $plan->id,
            'billing_status' => 'active',
        ]);
        $admin = User::create([
            'agency_id' => $agency->id, 'username' => 'a', 'name' => 'A',
            'role' => 'agency_admin', 'is_active' => true,
            'password' => Hash::make('Secret123!'),
        ]);
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/requests', ['title' => 'First'])->assertCreated();
        $this->postJson('/api/v1/requests', ['title' => 'Second'])
            ->assertStatus(402)
            ->assertJsonPath('error', 'plan_limit_reached');
    }
}
