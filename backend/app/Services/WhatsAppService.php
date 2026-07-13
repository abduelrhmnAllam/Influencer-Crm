<?php

namespace App\Services;

use App\Models\WhatsAppMessage;
use App\Models\WhatsAppConfig;
use App\Models\WhatsAppTemplate;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppBroadcast;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * WhatsApp Business Cloud API Service
 * Production-grade Meta Graph API integration
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
class WhatsAppService
{
    protected ?WhatsAppConfig $config = null;
    
    public function __construct()
    {
        $this->loadConfig();
    }
    
    protected function loadConfig(): void
    {
        $this->config = WhatsAppConfig::first() ?? WhatsAppConfig::create([
            'business_account_id' => env('WHATSAPP_BUSINESS_ACCOUNT_ID', ''),
            'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID', ''),
            'access_token' => env('WHATSAPP_ACCESS_TOKEN', ''),
            'app_id' => env('WHATSAPP_APP_ID', ''),
            'app_secret' => env('WHATSAPP_APP_SECRET', ''),
            'webhook_verify_token' => env('WHATSAPP_VERIFY_TOKEN', Str::random(32)),
            'api_version' => env('WHATSAPP_API_VERSION', 'v18.0'),
            'connection_status' => 'disconnected',
        ]);
    }
    
    protected function apiUrl(string $path = ''): string
    {
        $base = "https://graph.facebook.com/{$this->config->api_version}";
        return $path ? "$base/$path" : $base;
    }
    
    public function isConfigured(): bool
    {
        return !empty($this->config->business_account_id)
            && !empty($this->config->phone_number_id)
            && !empty($this->config->access_token);
    }
    
    protected function client()
    {
        return Http::withToken($this->config->access_token)->timeout(30)->acceptJson();
    }
    
    public function normalizePhone(string $phone): string
    {
        $p = preg_replace('/[^\d]/', '', $phone);
        if (str_starts_with($p, '00')) $p = substr($p, 2);
        if (str_starts_with($p, '966')) return $p;
        if (str_starts_with($p, '05')) return '966' . substr($p, 1);
        if (strlen($p) === 9 && str_starts_with($p, '5')) return '966' . $p;
        if (strlen($p) === 10 && str_starts_with($p, '0')) return '966' . substr($p, 1);
        return $p;
    }
    
    /* ═══════ CONNECTION TEST ═══════ */
    
    public function testConnection(): array
    {
        if (!$this->isConfigured()) {
            return ['ok' => false, 'error' => 'Missing required configuration'];
        }
        
        try {
            $response = $this->client()->get($this->apiUrl($this->config->phone_number_id));
            
            if ($response->successful()) {
                $data = $response->json();
                $this->config->update([
                    'connection_status' => 'connected',
                    'last_connected_at' => now(),
                    'last_error' => null,
                    'display_phone_number' => $data['display_phone_number'] ?? $this->config->display_phone_number,
                    'verified_name' => $data['verified_name'] ?? null,
                    'quality_rating' => $data['quality_rating'] ?? 'GREEN',
                ]);
                return ['ok' => true, 'data' => $data];
            }
            
            $error = $response->json('error.message', 'Unknown error');
            $this->config->update(['connection_status' => 'error', 'last_error' => $error]);
            return ['ok' => false, 'error' => $error];
        } catch (\Exception $e) {
            $this->config->update(['connection_status' => 'error', 'last_error' => $e->getMessage()]);
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
    
    /* ═══════ SEND MESSAGES ═══════ */
    
    public function sendTextMessage(string $to, string $message, array $meta = []): array
    {
        $phone = $this->normalizePhone($to);
        
        $msg = WhatsAppMessage::create([
            'direction' => 'outbound',
            'type' => 'text',
            'to_phone' => $phone,
            'body' => $message,
            'status' => 'queued',
            'related_type' => $meta['related_type'] ?? null,
            'related_id' => $meta['related_id'] ?? null,
            'sent_by' => Auth::id(),
        ]);
        
        if (!$this->isConfigured()) return $this->simulate($msg);
        
        try {
            $response = $this->client()->post(
                $this->apiUrl($this->config->phone_number_id . '/messages'),
                [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $phone,
                    'type' => 'text',
                    'text' => ['preview_url' => true, 'body' => $message],
                ]
            );
            return $this->handleResponse($msg, $response);
        } catch (\Exception $e) {
            return $this->markFailed($msg, $e->getMessage());
        }
    }
    
    public function sendTemplateMessage(
        string $to, string $templateName, string $language = 'ar',
        array $components = [], array $meta = []
    ): array {
        $phone = $this->normalizePhone($to);
        
        $msg = WhatsAppMessage::create([
            'direction' => 'outbound',
            'type' => 'template',
            'to_phone' => $phone,
            'template_name' => $templateName,
            'template_data' => $components,
            'status' => 'queued',
            'related_type' => $meta['related_type'] ?? null,
            'related_id' => $meta['related_id'] ?? null,
            'sent_by' => Auth::id(),
        ]);
        
        if (!$this->isConfigured()) return $this->simulate($msg);
        
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $phone,
            'type' => 'template',
            'template' => ['name' => $templateName, 'language' => ['code' => $language]],
        ];
        if (!empty($components)) $payload['template']['components'] = $components;
        
        try {
            $response = $this->client()->post(
                $this->apiUrl($this->config->phone_number_id . '/messages'), $payload
            );
            return $this->handleResponse($msg, $response);
        } catch (\Exception $e) {
            return $this->markFailed($msg, $e->getMessage());
        }
    }
    
    public function sendMediaMessage(string $to, string $type, string $url, string $caption = '', string $filename = ''): array
    {
        $phone = $this->normalizePhone($to);
        
        $msg = WhatsAppMessage::create([
            'direction' => 'outbound',
            'type' => $type,
            'to_phone' => $phone,
            'media_url' => $url,
            'media_caption' => $caption,
            'body' => $caption,
            'status' => 'queued',
            'sent_by' => Auth::id(),
        ]);
        
        if (!$this->isConfigured()) return $this->simulate($msg);
        
        $mediaPayload = ['link' => $url];
        if ($caption && in_array($type, ['image', 'video', 'document'])) $mediaPayload['caption'] = $caption;
        if ($filename && $type === 'document') $mediaPayload['filename'] = $filename;
        
        try {
            $response = $this->client()->post(
                $this->apiUrl($this->config->phone_number_id . '/messages'),
                ['messaging_product' => 'whatsapp', 'to' => $phone, 'type' => $type, $type => $mediaPayload]
            );
            return $this->handleResponse($msg, $response);
        } catch (\Exception $e) {
            return $this->markFailed($msg, $e->getMessage());
        }
    }
    
    /* ═══════ TEMPLATES ═══════ */
    
    public function fetchTemplates(): array
    {
        if (!$this->isConfigured()) return ['ok' => false, 'error' => 'Not configured'];
        
        try {
            $response = $this->client()->get(
                $this->apiUrl($this->config->business_account_id . '/message_templates'),
                ['limit' => 100]
            );
            
            if ($response->successful()) {
                $templates = $response->json('data', []);
                foreach ($templates as $tpl) {
                    WhatsAppTemplate::updateOrCreate(
                        ['name' => $tpl['name'], 'language' => $tpl['language']],
                        [
                            'meta_id' => $tpl['id'] ?? null,
                            'status' => $tpl['status'],
                            'category' => $tpl['category'],
                            'components' => $tpl['components'] ?? [],
                            'rejection_reason' => $tpl['rejected_reason'] ?? null,
                        ]
                    );
                }
                return ['ok' => true, 'count' => count($templates)];
            }
            return ['ok' => false, 'error' => $response->json('error.message')];
        } catch (\Exception $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
    
    public function createTemplate(array $data): array
    {
        if (!$this->isConfigured()) return ['ok' => false, 'error' => 'Not configured'];
        
        $components = [];
        if (!empty($data['header'])) $components[] = ['type' => 'HEADER', 'format' => 'TEXT', 'text' => $data['header']];
        $components[] = ['type' => 'BODY', 'text' => $data['body']];
        if (!empty($data['footer'])) $components[] = ['type' => 'FOOTER', 'text' => $data['footer']];
        
        try {
            $response = $this->client()->post(
                $this->apiUrl($this->config->business_account_id . '/message_templates'),
                [
                    'name' => $data['name'],
                    'category' => $data['category'] ?? 'UTILITY',
                    'language' => $data['language'] ?? 'ar',
                    'components' => $components,
                ]
            );
            
            if ($response->successful()) {
                $template = WhatsAppTemplate::create([
                    'meta_id' => $response->json('id'),
                    'name' => $data['name'],
                    'language' => $data['language'] ?? 'ar',
                    'category' => $data['category'] ?? 'UTILITY',
                    'status' => $response->json('status', 'PENDING'),
                    'body' => $data['body'],
                    'header' => $data['header'] ?? null,
                    'footer' => $data['footer'] ?? null,
                    'components' => $components,
                ]);
                return ['ok' => true, 'template' => $template];
            }
            return ['ok' => false, 'error' => $response->json('error.message')];
        } catch (\Exception $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
    
    /* ═══════ BROADCAST ═══════ */
    
    public function executeBroadcast(WhatsAppBroadcast $broadcast): array
    {
        $template = WhatsAppTemplate::findOrFail($broadcast->template_id);
        if ($template->status !== 'APPROVED') {
            return ['ok' => false, 'error' => 'Template not approved by Meta'];
        }
        
        $broadcast->update(['status' => 'sending', 'started_at' => now()]);
        
        $sent = 0; $failed = 0;
        $recipients = json_decode($broadcast->recipients_data, true) ?? [];
        
        foreach ($recipients as $recipient) {
            usleep(15000); // 15ms rate limit (~66 msg/sec)
            
            try {
                $components = !empty($recipient['variables']) ? [[
                    'type' => 'body',
                    'parameters' => array_map(fn($v) => ['type' => 'text', 'text' => $v], $recipient['variables']),
                ]] : [];
                
                $result = $this->sendTemplateMessage(
                    $recipient['phone'], $template->name, $template->language,
                    $components, ['related_type' => 'broadcast', 'related_id' => $broadcast->id]
                );
                
                if (isset($result['id'])) $sent++; else $failed++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('Broadcast send failed', ['recipient' => $recipient, 'error' => $e->getMessage()]);
            }
            
            if (($sent + $failed) % 50 === 0) {
                $broadcast->update(['sent_count' => $sent, 'failed_count' => $failed]);
            }
        }
        
        $broadcast->update([
            'status' => 'completed',
            'completed_at' => now(),
            'sent_count' => $sent,
            'failed_count' => $failed,
        ]);
        
        return ['ok' => true, 'sent' => $sent, 'failed' => $failed];
    }
    
    /* ═══════ BUSINESS PROFILE ═══════ */
    
    public function updateBusinessProfile(array $data): array
    {
        if (!$this->isConfigured()) return ['ok' => false, 'error' => 'Not configured'];
        
        try {
            $payload = array_filter([
                'messaging_product' => 'whatsapp',
                'about' => $data['about'] ?? null,
                'address' => $data['address'] ?? null,
                'description' => $data['description'] ?? null,
                'email' => $data['email'] ?? null,
                'websites' => isset($data['website']) ? [$data['website']] : null,
                'vertical' => $data['vertical'] ?? null,
            ]);
            
            $response = $this->client()->post(
                $this->apiUrl($this->config->phone_number_id . '/whatsapp_business_profile'), $payload
            );
            
            if ($response->successful()) {
                $this->config->update([
                    'business_about' => $data['about'] ?? $this->config->business_about,
                    'business_email' => $data['email'] ?? $this->config->business_email,
                    'business_website' => $data['website'] ?? $this->config->business_website,
                    'business_description' => $data['description'] ?? $this->config->business_description,
                ]);
                return ['ok' => true];
            }
            return ['ok' => false, 'error' => $response->json('error.message')];
        } catch (\Exception $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
    
    /* ═══════ WEBHOOK ═══════ */
    
    /** Verify Meta webhook signature (X-Hub-Signature-256) */
    public function verifyWebhookSignature(string $payload, ?string $signature): bool
    {
        if (!$signature || !$this->config->app_secret) return false;
        $signature = str_replace('sha256=', '', $signature);
        $expected = hash_hmac('sha256', $payload, $this->config->app_secret);
        return hash_equals($expected, $signature);
    }
    
    /** Process incoming webhook from Meta */
    public function handleWebhook(array $payload): void
    {
        if (($payload['object'] ?? '') !== 'whatsapp_business_account') return;
        
        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                $field = $change['field'] ?? null;
                $value = $change['value'] ?? [];
                
                switch ($field) {
                    case 'messages': $this->processMessages($value); break;
                    case 'message_template_status_update': $this->processTemplateUpdate($value); break;
                    case 'account_update': $this->processAccountUpdate($value); break;
                }
            }
        }
    }
    
    protected function processMessages(array $value): void
    {
        // Incoming messages
        foreach ($value['messages'] ?? [] as $msg) {
            $phone = $msg['from'];
            $type = $msg['type'];
            $body = $this->extractMessageBody($msg, $type);
            
            $contact = collect($value['contacts'] ?? [])->firstWhere('wa_id', $phone);
            $conv = WhatsAppConversation::firstOrCreate(
                ['contact_number' => $phone],
                ['contact_name' => $contact['profile']['name'] ?? null, 'status' => 'open']
            );
            
            $conv->update([
                'last_message_at' => now(),
                'unread_count' => $conv->unread_count + 1,
            ]);
            
            WhatsAppMessage::create([
                'conversation_id' => $conv->id,
                'whatsapp_message_id' => $msg['id'],
                'direction' => 'inbound',
                'type' => $type,
                'from_phone' => $phone,
                'body' => $body,
                'metadata' => $msg,
                'status' => 'received',
                'received_at' => now(),
            ]);
            
            $this->triggerAutomation($conv, $body);
        }
        
        // Status updates
        foreach ($value['statuses'] ?? [] as $status) {
            $msg = WhatsAppMessage::where('whatsapp_message_id', $status['id'])->first();
            if (!$msg) continue;
            
            $newStatus = $status['status'];
            $update = ['status' => $newStatus];
            if ($newStatus === 'delivered') $update['delivered_at'] = now();
            if ($newStatus === 'read') $update['read_at'] = now();
            if ($newStatus === 'failed') {
                $update['failed_at'] = now();
                $update['error_message'] = $status['errors'][0]['title'] ?? 'Unknown error';
            }
            $msg->update($update);
        }
    }
    
    protected function extractMessageBody(array $msg, string $type): string
    {
        return match($type) {
            'text' => $msg['text']['body'] ?? '',
            'image' => '[صورة]' . ($msg['image']['caption'] ?? ''),
            'document' => '[ملف] ' . ($msg['document']['filename'] ?? ''),
            'audio' => '[رسالة صوتية]',
            'video' => '[فيديو]' . ($msg['video']['caption'] ?? ''),
            'location' => '[موقع]',
            'button' => $msg['button']['text'] ?? '[زر]',
            'interactive' => $msg['interactive']['button_reply']['title'] ??
                            $msg['interactive']['list_reply']['title'] ?? '[تفاعلي]',
            'sticker' => '[ملصق]',
            'contacts' => '[جهة اتصال]',
            default => '[' . $type . ']',
        };
    }
    
    protected function processTemplateUpdate(array $value): void
    {
        WhatsAppTemplate::where('name', $value['message_template_name'] ?? null)
            ->where('language', $value['message_template_language'] ?? null)
            ->update([
                'status' => $value['event'] ?? 'PENDING',
                'rejection_reason' => $value['reason'] ?? null,
            ]);
    }
    
    protected function processAccountUpdate(array $value): void
    {
        $this->config->update([
            'quality_rating' => $value['quality_score']['score'] ?? $this->config->quality_rating,
            'messaging_limit_tier' => $value['messaging_limit'] ?? $this->config->messaging_limit_tier,
        ]);
    }
    
    protected function triggerAutomation(WhatsAppConversation $conv, string $body): void
    {
        if (!$this->config->auto_reply_enabled) return;
        
        $bodyLower = mb_strtolower($body);
        $automations = DB::table('whatsapp_automations')->where('enabled', true)->get();
        
        foreach ($automations as $auto) {
            $keywords = json_decode($auto->keywords, true) ?? [];
            foreach ($keywords as $kw) {
                if (str_contains($bodyLower, mb_strtolower($kw))) {
                    $this->sendTextMessage($conv->contact_number, $auto->response, [
                        'related_type' => 'automation', 'related_id' => $auto->id,
                    ]);
                    return;
                }
            }
        }
    }
    
    /* ═══════ HELPERS ═══════ */
    
    protected function handleResponse(WhatsAppMessage $msg, $response): array
    {
        if ($response->successful()) {
            $waId = $response->json('messages.0.id');
            $msg->update(['status' => 'sent', 'sent_at' => now(), 'whatsapp_message_id' => $waId]);
            return ['id' => $waId, 'message_id' => $msg->id];
        }
        return $this->markFailed($msg, $response->json('error.message', 'Unknown error'));
    }
    
    protected function markFailed(WhatsAppMessage $msg, string $error): array
    {
        $msg->update(['status' => 'failed', 'failed_at' => now(), 'error_message' => $error]);
        Log::error('WhatsApp send failed', ['msg_id' => $msg->id, 'error' => $error]);
        return ['error' => $error, 'message_id' => $msg->id];
    }
    
    protected function simulate(WhatsAppMessage $msg): array
    {
        $msg->update([
            'status' => 'sent',
            'sent_at' => now(),
            'whatsapp_message_id' => 'sim_' . Str::random(16),
        ]);
        return ['id' => $msg->whatsapp_message_id, 'simulated' => true, 'message_id' => $msg->id];
    }
}
