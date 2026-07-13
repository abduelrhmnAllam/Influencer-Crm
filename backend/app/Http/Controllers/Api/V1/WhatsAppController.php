<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppConfig;
use App\Models\WhatsAppTemplate;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppBroadcast;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * WhatsApp Business API Controller
 * All endpoints under /api/v1/whatsapp/*
 */
class WhatsAppController extends Controller
{
    protected WhatsAppService $service;
    
    public function __construct(WhatsAppService $service)
    {
        $this->service = $service;
    }
    
    /* ═══════ CONFIG ═══════ */
    
    /** GET /whatsapp/config — fetch current configuration */
    public function getConfig(): JsonResponse
    {
        $config = WhatsAppConfig::first();
        // Mask sensitive fields in response
        if ($config) {
            $config = $config->toArray();
            if (!empty($config['access_token'])) {
                $config['access_token'] = '****' . substr($config['access_token'], -8);
            }
            if (!empty($config['app_secret'])) {
                $config['app_secret'] = '****';
            }
        }
        return response()->json(['data' => $config]);
    }
    
    /** PUT /whatsapp/config — update configuration */
    public function updateConfig(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_account_id' => 'nullable|string|max:100',
            'phone_number_id' => 'nullable|string|max:100',
            'display_phone_number' => 'nullable|string|max:30',
            'access_token' => 'nullable|string',
            'app_id' => 'nullable|string|max:100',
            'app_secret' => 'nullable|string',
            'webhook_verify_token' => 'nullable|string|max:100',
            'api_version' => 'nullable|string|max:20',
            'business_name' => 'nullable|string|max:255',
            'business_email' => 'nullable|email|max:255',
            'business_website' => 'nullable|url|max:255',
            'business_about' => 'nullable|string|max:139', // Meta limit
            'business_description' => 'nullable|string|max:512',
            'auto_reply_enabled' => 'nullable|boolean',
            'working_hours_enabled' => 'nullable|boolean',
            'working_hours' => 'nullable|array',
        ]);
        
        // Don't overwrite secrets if they're masked
        if (isset($validated['access_token']) && str_starts_with($validated['access_token'], '****')) {
            unset($validated['access_token']);
        }
        if (isset($validated['app_secret']) && $validated['app_secret'] === '****') {
            unset($validated['app_secret']);
        }
        
        $config = WhatsAppConfig::first();
        if ($config) {
            $config->update($validated);
        } else {
            $config = WhatsAppConfig::create($validated);
        }
        
        return response()->json(['ok' => true, 'data' => $config]);
    }
    
    /** POST /whatsapp/config/test — test connection to Meta */
    public function testConnection(): JsonResponse
    {
        $result = $this->service->testConnection();
        return response()->json($result);
    }
    
    /** POST /whatsapp/config/generate-token — generate verify token */
    public function generateVerifyToken(): JsonResponse
    {
        $token = 'wt_' . bin2hex(random_bytes(24));
        $config = WhatsAppConfig::first();
        if ($config) $config->update(['webhook_verify_token' => $token]);
        return response()->json(['token' => $token]);
    }
    
    /* ═══════ CONVERSATIONS ═══════ */
    
    /** GET /whatsapp/conversations */
    public function listConversations(Request $request): JsonResponse
    {
        $query = WhatsAppConversation::query()
            ->orderBy('last_message_at', 'desc');
        
        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('contact_name', 'like', "%$search%")
                  ->orWhere('contact_number', 'like', "%$search%");
            });
        }
        
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        
        return response()->json(['data' => $query->paginate(50)]);
    }
    
    /** GET /whatsapp/conversations/{id}/messages */
    public function getMessages($id): JsonResponse
    {
        $messages = WhatsAppMessage::where('conversation_id', $id)
            ->orderBy('created_at', 'asc')
            ->limit(200)
            ->get();
        
        // Mark conversation as read
        WhatsAppConversation::where('id', $id)->update(['unread_count' => 0]);
        
        return response()->json(['data' => $messages]);
    }
    
    /** POST /whatsapp/messages/send */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to' => 'required|string',
            'type' => 'required|in:text,template,image,document,video,audio',
            'body' => 'required_if:type,text|string|max:4096',
            'template_name' => 'required_if:type,template|string',
            'language' => 'nullable|string|max:10',
            'components' => 'nullable|array',
            'media_url' => 'required_if:type,image,document,video,audio|url',
            'caption' => 'nullable|string|max:1024',
            'filename' => 'nullable|string|max:255',
        ]);
        
        $result = match($validated['type']) {
            'text' => $this->service->sendTextMessage($validated['to'], $validated['body']),
            'template' => $this->service->sendTemplateMessage(
                $validated['to'],
                $validated['template_name'],
                $validated['language'] ?? 'ar',
                $validated['components'] ?? []
            ),
            default => $this->service->sendMediaMessage(
                $validated['to'],
                $validated['type'],
                $validated['media_url'],
                $validated['caption'] ?? '',
                $validated['filename'] ?? ''
            ),
        };
        
        return response()->json($result);
    }
    
    /** PATCH /whatsapp/conversations/{id} */
    public function updateConversation(Request $request, $id): JsonResponse
    {
        $conv = WhatsAppConversation::findOrFail($id);
        $conv->update($request->only(['contact_name', 'status', 'tags', 'notes']));
        return response()->json(['ok' => true, 'data' => $conv]);
    }
    
    /* ═══════ TEMPLATES ═══════ */
    
    /** GET /whatsapp/templates */
    public function listTemplates(): JsonResponse
    {
        $templates = WhatsAppTemplate::orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $templates]);
    }
    
    /** POST /whatsapp/templates */
    public function createTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:512|regex:/^[a-z0-9_]+$/',
            'language' => 'required|string|max:10',
            'category' => 'required|in:UTILITY,MARKETING,AUTHENTICATION',
            'body' => 'required|string|max:1024',
            'header' => 'nullable|string|max:60',
            'footer' => 'nullable|string|max:60',
        ]);
        
        $result = $this->service->createTemplate($validated);
        return response()->json($result);
    }
    
    /** POST /whatsapp/templates/sync */
    public function syncTemplates(): JsonResponse
    {
        $result = $this->service->fetchTemplates();
        return response()->json($result);
    }
    
    /** DELETE /whatsapp/templates/{name} */
    public function deleteTemplate($name): JsonResponse
    {
        $result = $this->service->deleteTemplate($name);
        return response()->json($result);
    }
    
    /* ═══════ BROADCASTS ═══════ */
    
    /** GET /whatsapp/broadcasts */
    public function listBroadcasts(): JsonResponse
    {
        $broadcasts = WhatsAppBroadcast::with('template:id,name,language')
            ->orderBy('created_at', 'desc')
            ->paginate(50);
        return response()->json(['data' => $broadcasts]);
    }
    
    /** POST /whatsapp/broadcasts */
    public function createBroadcast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'template_id' => 'required|exists:whatsapp_templates,id',
            'target_type' => 'required|in:customers,influencers,custom',
            'recipients_data' => 'required|array',
            'recipients_data.*.phone' => 'required|string',
            'recipients_data.*.variables' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);
        
        $broadcast = WhatsAppBroadcast::create([
            'name' => $validated['name'],
            'template_id' => $validated['template_id'],
            'target_type' => $validated['target_type'],
            'recipients_data' => json_encode($validated['recipients_data']),
            'recipients_count' => count($validated['recipients_data']),
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'status' => $validated['scheduled_at'] ? 'scheduled' : 'draft',
            'created_by' => auth()->id(),
        ]);
        
        // If no schedule, send immediately (in production: dispatch job)
        if (empty($validated['scheduled_at'])) {
            // Queue the broadcast execution
            // dispatch(new ExecuteBroadcastJob($broadcast));
            // For immediate: $this->service->executeBroadcast($broadcast);
        }
        
        return response()->json(['ok' => true, 'data' => $broadcast]);
    }
    
    /** POST /whatsapp/broadcasts/{id}/execute */
    public function executeBroadcast($id): JsonResponse
    {
        $broadcast = WhatsAppBroadcast::findOrFail($id);
        if (!in_array($broadcast->status, ['draft', 'scheduled'])) {
            return response()->json(['ok' => false, 'error' => 'Broadcast already executed'], 400);
        }
        
        $result = $this->service->executeBroadcast($broadcast);
        return response()->json($result);
    }
    
    /* ═══════ DASHBOARD ═══════ */
    
    /** GET /whatsapp/stats */
    public function getStats(): JsonResponse
    {
        $today = now()->startOfDay();
        
        return response()->json([
            'data' => [
                'total_sent' => WhatsAppMessage::where('direction', 'outbound')->count(),
                'total_received' => WhatsAppMessage::where('direction', 'inbound')->count(),
                'total_delivered' => WhatsAppMessage::where('status', 'delivered')->count(),
                'total_read' => WhatsAppMessage::where('status', 'read')->count(),
                'today_sent' => WhatsAppMessage::where('direction', 'outbound')->where('created_at', '>=', $today)->count(),
                'today_received' => WhatsAppMessage::where('direction', 'inbound')->where('created_at', '>=', $today)->count(),
                'active_conversations' => WhatsAppConversation::where('status', 'open')->count(),
                'total_conversations' => WhatsAppConversation::count(),
                'approved_templates' => WhatsAppTemplate::where('status', 'APPROVED')->count(),
                'pending_templates' => WhatsAppTemplate::where('status', 'PENDING')->count(),
                'completed_broadcasts' => WhatsAppBroadcast::where('status', 'completed')->count(),
            ],
        ]);
    }
}
