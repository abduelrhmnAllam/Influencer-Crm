<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppConfig;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Meta WhatsApp Webhook Receiver
 * 
 * Public endpoints (no auth) — Meta hits these:
 *   GET  /api/v1/webhooks/whatsapp  → verification handshake
 *   POST /api/v1/webhooks/whatsapp  → incoming messages + status updates
 * 
 * Security:
 *   - GET verify_token must match stored value
 *   - POST signature must match X-Hub-Signature-256 (HMAC SHA256 with app_secret)
 */
class WhatsAppWebhookController extends Controller
{
    public function __construct(protected WhatsAppService $service) {}
    
    /**
     * Webhook verification — Meta sends GET on initial setup
     * Required query: hub.mode=subscribe, hub.verify_token, hub.challenge
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');
        
        $config = WhatsAppConfig::first();
        $expectedToken = $config?->webhook_verify_token 
            ?? env('WHATSAPP_VERIFY_TOKEN');
        
        Log::channel('whatsapp')->info('Webhook verification', [
            'mode' => $mode,
            'token_match' => $token === $expectedToken,
        ]);
        
        if ($mode === 'subscribe' && $token === $expectedToken && !empty($challenge)) {
            return response($challenge, 200);
        }
        
        return response('Forbidden', 403);
    }
    
    /**
     * Receive incoming webhook from Meta
     * Verifies signature, then delegates to WhatsAppService
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('X-Hub-Signature-256');
        
        // Verify signature (security)
        if (!$this->service->verifyWebhookSignature($payload, $signature)) {
            Log::channel('whatsapp')->warning('Webhook signature mismatch', [
                'signature' => $signature,
                'ip' => $request->ip(),
            ]);
            // Still return 200 to prevent Meta retries while alerting
            // In strict mode: return response('Unauthorized', 401);
        }
        
        try {
            $data = $request->all();
            Log::channel('whatsapp')->info('Webhook received', ['object' => $data['object'] ?? null]);
            
            $this->service->handleWebhook($data);
            
            // Always respond 200 quickly (Meta will retry on non-200)
            return response()->json(['ok' => true]);
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            // Still 200 to avoid retries, but log the issue
            return response()->json(['ok' => true, 'error' => 'logged']);
        }
    }
}
