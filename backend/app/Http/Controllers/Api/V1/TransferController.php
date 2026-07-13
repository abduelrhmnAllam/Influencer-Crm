<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use App\Models\TransferAttachment;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;
use App\Models\User;

class TransferController extends Controller
{
    public function index(Request $request)
    {
        $query = Transfer::with([
            'campaign:id,name,code',
            'customer:id,name',
            'requester:id,name',
            'assignee:id,name',
        ]);

        if ($stage = $request->input('stage')) {
            if ($stage === 'all') {
                // no filter
            } elseif ($stage === 'complete') {
                $query->where('workflow_stage', 'complete');
            } else {
                $query->where('workflow_stage', $stage);
            }
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('campaign', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($from = $request->input('from')) $query->whereDate('created_at', '>=', $from);
        if ($to = $request->input('to')) $query->whereDate('created_at', '<=', $to);

        $query->orderByDesc('created_at');
        $perPage = min((int) $request->input('per_page', 25), 100);
        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request, NotificationService $notifications)
    {
        $data = $request->validate([
            'direction' => 'in:outgoing,incoming',
            'campaign_id' => 'nullable|exists:campaigns,id',
            'customer_id' => 'nullable|exists:customers,id',
            'amount_base' => 'required|numeric|min:0',
            'vat' => 'nullable|numeric|min:0',
            'amount_total' => 'required|numeric|min:0',
            'with_vat' => 'boolean',
            'notes' => 'nullable|string',
            'reason' => 'nullable|string',
            'recipients' => 'required|array|min:1',
            'recipients.*.name' => 'required|string',
            'recipients.*.influencer_id' => 'nullable|exists:influencers,id',
            'recipients.*.bank_name' => 'nullable|string',
            'recipients.*.iban' => 'nullable|string',
            'recipients.*.amount_total' => 'required|numeric|min:0',
        ]);

        $transfer = Transfer::create([
            'direction' => $data['direction'] ?? 'outgoing',
            'campaign_id' => $data['campaign_id'] ?? null,
            'customer_id' => $data['customer_id'] ?? null,
            'amount_base' => $data['amount_base'],
            'vat' => $data['vat'] ?? 0,
            'amount_total' => $data['amount_total'],
            'with_vat' => $data['with_vat'] ?? true,
            'notes' => $data['notes'] ?? null,
            'reason' => $data['reason'] ?? null,
            'recipients_count' => count($data['recipients']),
            'workflow_stage' => '1',
            'status' => 'pending',
            'requested_by' => Auth::id(),
        ]);

        foreach ($data['recipients'] as $r) {
            $transfer->recipients()->create([
                'influencer_id' => $r['influencer_id'] ?? null,
                'name' => $r['name'],
                'role' => $r['role'] ?? 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â´Ãƒâ„¢Ã¢â‚¬Â¡Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â±',
                'bank_name' => $r['bank_name'] ?? null,
                'iban' => $r['iban'] ?? null,
                'account_holder' => $r['account_holder'] ?? $r['name'],
                'amount_base' => $r['amount_base'] ?? $r['amount_total'],
                'vat' => $r['vat'] ?? 0,
                'amount_total' => $r['amount_total'],
            ]);
        }

        $transfer->logHistory('submitted', 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â±Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â¹ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â·Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¨ Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©');
        $notifications->notifyRoles(['agency_admin', 'finance', 'finance_manager', 'accountant'], [
            'type' => 'transfer_pending',
            'title' => 'Ø·Ù„Ø¨ Ø­ÙˆØ§Ù„Ø© Ø¬Ø¯ÙŠØ¯: ' . $transfer->code,
            'body' => 'ØªÙ… Ø±ÙØ¹ Ø·Ù„Ø¨ Ø­ÙˆØ§Ù„Ø© Ø¨Ù‚ÙŠÙ…Ø© ' . number_format((float) $transfer->amount_total, 2) . ' Ø±.Ø³ ÙˆÙŠØ­ØªØ§Ø¬ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…Ø§Ù„ÙŠØ©.',
            'url' => '/transfer-detail/' . $transfer->id,
            'related_type' => 'transfer',
            'related_id' => $transfer->id,
        ], Auth::user());


        return response()->json([
            'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â±Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â¹ ÃƒËœÃ‚Â·Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¨ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â­Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â©',
            'data' => $transfer->load('recipients'),
        ], 201);
    }

    public function show(Transfer $transfer)
    {
        $transfer->load([
            'recipients.influencer:id,name,code,phone',
            'attachments.uploader:id,name',
            'history.user:id,name',
            'campaign:id,name,code',
            'customer:id,name,phone',
            'requester:id,name',
            'assignee:id,name',
        ]);

        return response()->json(['data' => $transfer]);
    }

    public function update(Request $request, Transfer $transfer, NotificationService $notifications)
    {
        $data = $request->validate([
            'status' => 'sometimes|in:pending,transferred,completed,cancelled',
            'workflow_stage' => 'sometimes|in:1,2,3,complete',
            'notes' => 'nullable|string',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $transfer->update($data);
        $transfer->logHistory('updated', 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â«');
        if (($data['workflow_stage'] ?? null) === 'complete' || ($data['status'] ?? null) === 'completed') {
            $notifyUsers = User::query()
                ->where('agency_id', Auth::user()?->agency_id)
                ->where(function ($query) use ($transfer) {
                    $query->whereIn('role', ['agency_admin', 'finance', 'finance_manager', 'accountant']);
                    if ($transfer->requested_by) {
                        $query->orWhere('id', $transfer->requested_by);
                    }
                })
                ->get();

            $notifications->notifyUsers($notifyUsers, [
                'type' => 'transfer_completed',
                'title' => 'Ø§ÙƒØªÙ…Ù„Øª Ø§Ù„Ø­ÙˆØ§Ù„Ø©: ' . $transfer->code,
                'body' => 'ØªÙ… Ø¥Ù†Ù‡Ø§Ø¡ Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ø­ÙˆØ§Ù„Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„ØªÙ‡Ø§ Ø¥Ù„Ù‰ Ù…ÙƒØªÙ…Ù„Ø©.',
                'url' => '/transfer-detail/' . $transfer->id,
                'related_type' => 'transfer',
                'related_id' => $transfer->id,
            ], Auth::user());
        }


        return response()->json([
            'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â«',
            'data' => $transfer->fresh()->load('recipients'),
        ]);
    }

    /**
     * Upload receipt or tax invoice
     * POST /api/v1/transfers/{transfer}/upload
     */
    public function upload(Request $request, Transfer $transfer, NotificationService $notifications)
    {
        $request->validate([
            'type' => 'required|in:receipt,tax_invoice,quotation,other',
            'recipient_id' => 'nullable|exists:transfer_recipients,id',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png',
        ]);

        $file = $request->file('file');
        $path = $file->store('transfers/' . $transfer->id, 'public');

        $attachment = $transfer->attachments()->create([
            'recipient_id' => $request->recipient_id,
            'type' => $request->type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
            'uploaded_at' => now(),
        ]);

        // Auto-advance workflow
        if ($request->type === 'receipt' && $transfer->workflow_stage === '1') {
            $transfer->markTransferred(Auth::user());
        } elseif ($request->type === 'tax_invoice' && in_array($transfer->workflow_stage, ['2', '3'])) {
            $transfer->markInvoiceUploaded(Auth::user());
        }

        $transfer->logHistory(
            $request->type === 'receipt' ? 'receipt_uploaded' : 'tax_invoice_uploaded',
            'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â±Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â¹ ' . ($request->type === 'receipt' ? 'ÃƒËœÃ‚Â¥Ãƒâ„¢Ã…Â ÃƒËœÃ‚ÂµÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­Ãƒâ„¢Ã‹â€ Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾' : 'ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒâ„¢Ã‹â€ ÃƒËœÃ‚Â±ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¶ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©')
        );

        $notifyUsers = User::query()
            ->where('agency_id', Auth::user()?->agency_id)
            ->where(function ($query) use ($transfer) {
                $query->whereIn('role', ['agency_admin', 'campaign_manager']);
                if ($transfer->requested_by) {
                    $query->orWhere('id', $transfer->requested_by);
                }
            })
            ->get();

        $notifications->notifyUsers($notifyUsers, [
            'type' => $request->type === 'receipt' ? 'transfer_receipt' : 'transfer_invoice',
            'title' => ($request->type === 'receipt' ? 'تم رفع إيصال حوالة: ' : 'تم رفع فاتورة ضريبية: ') . $transfer->code,
            'body' => 'تم رفع الملف "' . $file->getClientOriginalName() . '" على طلب الحوالة.',
            'url' => '/transfer-detail/' . $transfer->id,
            'related_type' => 'transfer',
            'related_id' => $transfer->id,
        ], Auth::user());
        return response()->json([
            'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â±Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â¹ ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'data' => $attachment,
        ]);
    }

    /**
     * Send receipt to influencer via WhatsApp
     * POST /api/v1/transfers/{transfer}/send-receipt
     */
    public function sendReceiptToInfluencer(Request $request, Transfer $transfer, WhatsAppService $whatsapp)
    {
        $request->validate([
            'recipient_id' => 'nullable|exists:transfer_recipients,id',
            'phone' => 'nullable|string',
            'message' => 'nullable|string',
        ]);

        $recipient = $request->recipient_id 
            ? $transfer->recipients()->find($request->recipient_id)
            : $transfer->recipients()->first();
        
        if (!$recipient) {
            return response()->json(['error' => 'Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ Ãƒâ„¢Ã…Â ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â«Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â± ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â° Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦'], 404);
        }

        $phone = $request->phone ?? optional($recipient->influencer)->phone;
        if (!$phone) {
            return response()->json(['error' => 'ÃƒËœÃ‚Â±Ãƒâ„¢Ã¢â‚¬Å¡Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒËœÃ‚Â³ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¨ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â·Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â¨'], 422);
        }

        $message = $request->message ?? $this->buildReceiptMessage($transfer, $recipient);

        try {
            $response = $whatsapp->sendMessage($phone, $message, [
                'related_type' => 'transfer',
                'related_id' => $transfer->id,
            ]);

            $transfer->markReceiptSentToInfluencer(Auth::user());

            return response()->json([
                'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â±ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â´Ãƒâ„¢Ã¢â‚¬Â¡Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â±',
                'whatsapp_message_id' => $response['id'] ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â´Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â±ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send tax invoice to customer
     * POST /api/v1/transfers/{transfer}/send-invoice
     */
    public function sendInvoiceToCustomer(Request $request, Transfer $transfer, WhatsAppService $whatsapp)
    {
        $request->validate([
            'phone' => 'nullable|string',
            'message' => 'nullable|string',
        ]);

        $customer = $transfer->customer;
        if (!$customer && $transfer->campaign) {
            $customer = $transfer->campaign->customer;
        }

        $phone = $request->phone ?? optional($customer)->phone;
        if (!$phone) {
            return response()->json(['error' => 'ÃƒËœÃ‚Â±Ãƒâ„¢Ã¢â‚¬Å¡Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â·Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â¨'], 422);
        }

        $message = $request->message ?? $this->buildInvoiceMessage($transfer);

        try {
            $whatsapp->sendMessage($phone, $message, [
                'related_type' => 'transfer',
                'related_id' => $transfer->id,
            ]);

            $transfer->markInvoiceSentToCustomer(Auth::user());
            
            // Auto-complete if both sent
            if ($transfer->receipt_sent_to_influencer_at && $transfer->invoice_sent_to_customer_at) {
                $transfer->markCompleted(Auth::user());
            }

            return response()->json(['message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â±ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â´Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â±ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Transfer $transfer)
    {
        // Delete attachments from storage
        foreach ($transfer->attachments as $att) {
            Storage::disk('public')->delete($att->file_path);
        }
        $transfer->delete();
        return response()->json(['message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â­ÃƒËœÃ‚Â°Ãƒâ„¢Ã‚Â']);
    }

    protected function buildReceiptMessage(Transfer $transfer, $recipient): string
    {
        $amount = number_format((float) $recipient->amount_total, 2);
        $campaign = $transfer->campaign?->name ?? 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â';
        
        return "ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â³Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â±ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¡ Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â±Ãƒâ„¢Ã†â€™ÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¡ÃƒËœÃ…â€™\n\n" .
               "Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â´Ãƒâ„¢Ã†â€™ÃƒËœÃ‚Â±Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â° ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¹ÃƒËœÃ‚Â§Ãƒâ„¢Ã‹â€ Ãƒâ„¢Ã¢â‚¬Â Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â§ Ãƒâ„¢Ã‚ÂÃƒâ„¢Ã…Â  ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â© \"{$campaign}\".\n\n" .
               "Ãƒâ„¢Ã¢â‚¬Â Ãƒâ„¢Ã‚ÂÃƒâ„¢Ã‚ÂÃƒâ„¢Ã…Â ÃƒËœÃ‚Â¯Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â£Ãƒâ„¢Ã¢â‚¬Â Ãƒâ„¢Ã¢â‚¬Â¡ ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­Ãƒâ„¢Ã‹â€ Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Âº {$amount} ÃƒËœÃ‚Â±.ÃƒËœÃ‚Â³ ÃƒËœÃ‚Â¥Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â° ÃƒËœÃ‚Â­ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¨Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã…Â .\n\n" .
               "Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â±Ãƒâ„¢Ã‚ÂÃƒâ„¢Ã¢â‚¬Å¡ Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¥Ãƒâ„¢Ã…Â ÃƒËœÃ‚ÂµÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­Ãƒâ„¢Ã‹â€ Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾ Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¥Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â±ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¡ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª.\n\n" .
               "Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¹ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒËœÃ…â€™\nÃƒâ„¢Ã‚ÂÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¡ ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â§ÃƒËœÃ‚Â±ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª";
    }

    protected function buildInvoiceMessage(Transfer $transfer): string
    {
        $amount = number_format((float) $transfer->amount_total, 2);
        $campaign = $transfer->campaign?->name ?? 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â';
        
        return "ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â³Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â±ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¡ Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â±Ãƒâ„¢Ã†â€™ÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¡ÃƒËœÃ…â€™\n\n" .
               "Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â±Ãƒâ„¢Ã‚ÂÃƒâ„¢Ã¢â‚¬Å¡ Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒâ„¢Ã‹â€ ÃƒËœÃ‚Â±ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¶ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â®ÃƒËœÃ‚Â§ÃƒËœÃ‚ÂµÃƒËœÃ‚Â© ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â© \"{$campaign}\".\n\n" .
               "ÃƒËœÃ‚ÂªÃƒâ„¢Ã‚ÂÃƒËœÃ‚Â§ÃƒËœÃ‚ÂµÃƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒâ„¢Ã‹â€ ÃƒËœÃ‚Â±ÃƒËœÃ‚Â©:\nÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Âº: {$amount} ÃƒËœÃ‚Â±.ÃƒËœÃ‚Â³\n\n" .
               "Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â£Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒâ„¢Ã†â€™ÃƒËœÃ‚Â±Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Â·Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¹.\n\n" .
               "Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¹ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚ÂªÃƒËœÃ…â€™\nÃƒâ„¢Ã‚ÂÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¡ ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â§ÃƒËœÃ‚Â±ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª";
    }
}
