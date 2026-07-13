<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Permissions
        $permissions = [
            // Customers
            'view-customers', 'create-customers', 'edit-customers', 'delete-customers',
            // Influencers
            'view-influencers', 'create-influencers', 'edit-influencers', 'delete-influencers', 'blacklist-influencers',
            // Campaigns
            'view-campaigns', 'create-campaigns', 'edit-campaigns', 'delete-campaigns',
            // Transfers (Finance)
            'view-transfers', 'create-transfers', 'approve-transfers', 'upload-receipts',
            // Tasks
            'view-tasks', 'create-tasks', 'assign-tasks',
            // Content
            'view-content', 'create-content', 'analyze-content',
            // Requests
            'view-requests', 'create-requests', 'manage-portal-users',
            // WhatsApp
            'view-whatsapp', 'send-whatsapp', 'manage-whatsapp-config',
            // Analytics
            'view-analytics', 'export-reports',
            // Settings
            'view-settings', 'manage-users', 'manage-roles',
            // Notifications
            'view-notifications',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // 2. Create Roles and Assign Permissions
        
        // Viewer
        $roleViewer = Role::findOrCreate('viewer', 'web');
        $roleViewer->syncPermissions([
            'view-customers', 'view-influencers', 'view-campaigns', 
            'view-transfers', 'view-tasks', 'view-content', 
            'view-requests', 'view-analytics', 'view-notifications'
        ]);

        // Influencer Manager
        $roleInfluencerManager = Role::findOrCreate('influencer_manager', 'web');
        $roleInfluencerManager->syncPermissions([
            'view-customers', 
            'view-influencers', 'create-influencers', 'edit-influencers', 'blacklist-influencers',
            'view-campaigns', 'view-tasks', 'view-content', 'view-notifications'
        ]);

        // Campaign Manager
        $roleCampaignManager = Role::findOrCreate('campaign_manager', 'web');
        $roleCampaignManager->syncPermissions([
            'view-customers', 'create-customers', 'edit-customers',
            'view-influencers', 'create-influencers', 'edit-influencers',
            'view-campaigns', 'create-campaigns', 'edit-campaigns',
            'view-transfers', 'create-transfers', 'upload-receipts',
            'view-tasks', 'create-tasks', 'assign-tasks',
            'view-content', 'create-content', 'analyze-content',
            'view-requests', 'create-requests', 'manage-portal-users',
            'view-whatsapp', 'send-whatsapp',
            'view-analytics', 'export-reports',
            'view-notifications'
        ]);

        // Accountant
        $roleAccountant = Role::findOrCreate('accountant', 'web');
        $roleAccountant->syncPermissions([
            'view-customers', 'view-influencers', 'view-campaigns',
            'view-transfers', 'create-transfers', 'upload-receipts',
            'view-tasks', 'view-notifications'
        ]);

        // Finance Manager
        $roleFinanceManager = Role::findOrCreate('finance_manager', 'web');
        $roleFinanceManager->syncPermissions([
            'view-customers', 'view-influencers', 'view-campaigns',
            'view-transfers', 'create-transfers', 'approve-transfers', 'upload-receipts',
            'view-tasks', 'view-notifications', 'view-analytics', 'export-reports'
        ]);

        // Agency Admin
        $roleAgencyAdmin = Role::findOrCreate('agency_admin', 'web');
        $roleAgencyAdmin->syncPermissions(Permission::all());

        // Super Admin
        $roleSuperAdmin = Role::findOrCreate('super_admin', 'web');
        $roleSuperAdmin->syncPermissions(Permission::all());

        // 3. Assign Roles to Existing Seeded Users
        Tenancy::bypass(true);

        // Find standard users by username and assign Spatie roles
        $users = [
            'admin'   => 'agency_admin',
            'manager' => 'campaign_manager',
            'finance' => 'finance_manager', // Map finance username to finance_manager Spatie role
            'viewer'  => 'viewer',
        ];

        foreach ($users as $username => $roleName) {
            $user = User::where('username', $username)->first();
            if ($user) {
                $user->syncRoles([$roleName]);
            }
        }

        Tenancy::reset();
    }
}
