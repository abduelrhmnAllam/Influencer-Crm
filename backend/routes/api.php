<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\GoogleAuthController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\InfluencerController;
use App\Http\Controllers\Api\V1\TransferController;
use App\Http\Controllers\Api\V1\WhatsAppWebhookController;
use App\Http\Controllers\Api\V1\RequestController;
use App\Http\Controllers\Api\V1\RequestUserController;
use App\Http\Controllers\Api\V1\PortalController;
use Illuminate\Support\Facades\Route;

/*
|----------------------------------------------------------------------
| API Routes (V1)
|----------------------------------------------------------------------
| Base: /api/v1
*/

Route::prefix('v1')->group(function () {
    
    // ========== Public Routes ==========
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // 5 محاولات/دقيقة
    Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect']);
    Route::match(['get', 'post'], 'auth/google/callback', [GoogleAuthController::class, 'callback']);
    
    // WhatsApp webhooks (public — Meta hits these)
    Route::get('webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify']);
    Route::post('webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle']);
    
    // ========== Authenticated Routes (Sanctum) ==========
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
        
        // Auth
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
            Route::post('register', [AuthController::class, 'register']);
        });
        
        // Customers
        Route::apiResource('customers', CustomerController::class);
        Route::post('customers/bulk-delete', [CustomerController::class, 'bulkDelete']);
        
        // Influencers
        Route::apiResource('influencers', InfluencerController::class);
        Route::post('influencers/bulk-delete', [InfluencerController::class, 'bulkDelete']);
        
        // Campaigns
        Route::apiResource('campaigns', \App\Http\Controllers\Api\V1\CampaignController::class);
        
        // Daily Ads
        Route::apiResource('daily-ads', \App\Http\Controllers\Api\V1\DailyAdController::class);
        
        // Transfers (Finance)
        Route::get('transfers/finance-overview', [TransferController::class, 'financeOverview']);
        Route::apiResource('transfers', TransferController::class);
        Route::post('transfers/{transfer}/upload', [TransferController::class, 'upload']);
        Route::post('transfers/{transfer}/send-receipt', [TransferController::class, 'sendReceiptToInfluencer']);
        Route::post('transfers/{transfer}/send-invoice', [TransferController::class, 'sendInvoiceToCustomer']);
        
        // Tasks
        Route::apiResource('tasks', \App\Http\Controllers\Api\V1\TaskController::class);
        Route::post('tasks/{task}/comments', [\App\Http\Controllers\Api\V1\TaskController::class, 'addComment']);
        Route::post('tasks/{task}/progress', [\App\Http\Controllers\Api\V1\TaskController::class, 'updateProgress']);
        
        // Content
        Route::apiResource('contents', \App\Http\Controllers\Api\V1\ContentController::class);
        Route::post('contents/{content}/analyze', [\App\Http\Controllers\Api\V1\ContentController::class, 'analyze']);
        // UGC Admin
        Route::get('ugc-admin/overview', [\App\Http\Controllers\Api\V1\UgcAdminController::class, 'overview']);
        Route::post('ugc-admin/applications/{id}/decision', [\App\Http\Controllers\Api\V1\UgcAdminController::class, 'applicationDecision']);
        Route::post('ugc-admin/submissions/{id}/status', [\App\Http\Controllers\Api\V1\UgcAdminController::class, 'submissionStatus']);
        Route::post('ugc-admin/campaigns/{id}/status', [\App\Http\Controllers\Api\V1\UgcAdminController::class, 'campaignStatus']);
        
        // Notifications
        Route::get('notifications', [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::patch('notifications/{notification}/read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markRead']);
        Route::post('notifications/mark-all-read', [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllRead']);
        Route::post('notifications/test', [\App\Http\Controllers\Api\V1\NotificationController::class, 'test']);
        Route::delete('notifications/clear', [\App\Http\Controllers\Api\V1\NotificationController::class, 'clear']);
        
        // Settings
        Route::get('settings', [\App\Http\Controllers\Api\V1\SettingsController::class, 'index']);
        Route::put('settings', [\App\Http\Controllers\Api\V1\SettingsController::class, 'update']);
        Route::post('settings/team-preview', [\App\Http\Controllers\Api\V1\SettingsController::class, 'teamPreview']);
        Route::post('settings/action', [\App\Http\Controllers\Api\V1\SettingsController::class, 'action']);
        
        // Global Search
        Route::get('search', [\App\Http\Controllers\Api\V1\SearchController::class, 'index']);
        
        // Dashboard stats
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\V1\DashboardController::class, 'stats']);
        
        // Analytics
        Route::get('analytics/overview', [\App\Http\Controllers\Api\V1\AnalyticsController::class, 'overview']);
        Route::get('analytics/financial', [\App\Http\Controllers\Api\V1\AnalyticsController::class, 'financial']);
        
        // === WhatsApp Business API ===
        Route::prefix('whatsapp')->group(function () {
            // Configuration
            Route::get('config', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'getConfig']);
            Route::put('config', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'updateConfig']);
            Route::post('config/test', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'testConnection']);
            Route::post('config/generate-token', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'generateVerifyToken']);
            
            // Conversations & Messages
            Route::get('conversations', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'listConversations']);
            Route::get('conversations/{id}/messages', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'getMessages']);
            Route::patch('conversations/{id}', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'updateConversation']);
            Route::post('messages/send', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'sendMessage']);
            
            // Templates
            Route::get('templates', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'listTemplates']);
            Route::post('templates', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'createTemplate']);
            Route::post('templates/sync', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'syncTemplates']);
            Route::delete('templates/{name}', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'deleteTemplate']);
            
            // Broadcasts
            Route::get('broadcasts', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'listBroadcasts']);
            Route::post('broadcasts', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'createBroadcast']);
            Route::post('broadcasts/{id}/execute', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'executeBroadcast']);
            
            // Stats
            Route::get('stats', [\App\Http\Controllers\Api\V1\WhatsAppController::class, 'getStats']);
        });
        
        // Users management (admin only) — إنفاذ من الخادم عبر role middleware
        Route::middleware('role:super_admin|agency_admin')->group(function () {
            Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);
        });
    });
});

/*
|----------------------------------------------------------------------
| Requests Module + External Portal (مُضاف لطبقة SaaS)
|----------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {

    // ── البوابة الخارجية (عامة — مصادقة بالتوكن داخل المتحكّم) ──
    Route::prefix('portal')->middleware('throttle:60,1')->group(function () {
        Route::post('login',              [PortalController::class, 'login']);
        Route::get('requests',            [PortalController::class, 'myRequests']);
        Route::post('requests',           [PortalController::class, 'createRequest']);
        Route::post('requests/{id}/messages',          [PortalController::class, 'addMessage']);
        Route::post('nominations/{id}/decision',        [PortalController::class, 'decideNomination']);
    });

    // ── الموارد الداخلية (مصادقة + عزل + حدود الخطة) ──
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

        Route::get('requests',          [RequestController::class, 'index']);
        Route::get('requests/{id}',     [RequestController::class, 'show']);
        Route::post('requests',         [RequestController::class, 'store'])->middleware('plan.limit:campaigns');
        Route::put('requests/{id}',     [RequestController::class, 'update']);
        Route::delete('requests/{id}',  [RequestController::class, 'destroy'])->middleware('role:agency_admin|campaign_manager');

        Route::get('request-users',          [RequestUserController::class, 'index']);
        Route::post('request-users',         [RequestUserController::class, 'store'])->middleware('plan.limit:portal_links');
        Route::post('request-users/{id}/revoke', [RequestUserController::class, 'revokeToken']);
        Route::post('request-users/{id}/rotate', [RequestUserController::class, 'rotateToken']);
        Route::post('request-users/{id}/disable',[RequestUserController::class, 'disable']);
        Route::post('request-users/{id}/enable', [RequestUserController::class, 'enable']);
    });
});

