<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\CampaignRequest;
use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $role): User
    {
        $agency = Agency::create(['name' => 'A', 'slug' => 'r'.uniqid(), 'status' => 'active']);
        Tenancy::setAgencyId($agency->id);

        return User::create([
            'agency_id' => $agency->id, 'username' => 'u'.uniqid(), 'name' => 'U',
            'role' => $role, 'is_active' => true,
            'password' => Hash::make('Secret123!'),
        ]);
    }

    public function test_viewer_cannot_delete_request(): void
    {
        $viewer = $this->userWithRole('viewer');
        $request = CampaignRequest::create(['number' => 'REQ-1', 'title' => 'T', 'status' => 'new']);
        Sanctum::actingAs($viewer);

        $this->deleteJson('/api/v1/requests/'.$request->id)
            ->assertStatus(403)
            ->assertJsonPath('error', 'forbidden_role');
        $this->assertDatabaseHas('requests', ['id' => $request->id]);
    }

    public function test_admin_can_delete_request(): void
    {
        $admin = $this->userWithRole('agency_admin');
        $request = CampaignRequest::create(['number' => 'REQ-2', 'title' => 'T', 'status' => 'new']);
        Sanctum::actingAs($admin);

        $this->deleteJson('/api/v1/requests/'.$request->id)->assertOk();
    }
}
