<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = $user->notifications()->latest();
        
        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }
        
        return response()->json([
            'data' => $query->paginate(20),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markRead(int $notification)
    {
        $notification = Notification::findOrFail($notification);
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }
        $notification->markAsRead();
        return response()->json(['data' => $notification]);
    }

    public function markAllRead()
    {
        Auth::user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['message' => 'Ã˜ÂªÃ™â€¦ Ã˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â¯ Ã˜Â§Ã™â€žÃ™Æ’Ã™â€ž Ã™Æ’Ã™â€¦Ã™â€šÃ˜Â±Ã™Ë†Ã˜Â¡']);
    }

    public function test(Request $request, NotificationService $notifications)
    {
        $user = Auth::user();
        $notification = $notifications->notifyUser($user, [
            'type' => $request->input('type', 'success'),
            'title' => $request->input('title', 'إشعار تجريبي'),
            'body' => $request->input('body', 'تم إرسال هذا الإشعار من صفحة الإعدادات للتأكد أن النظام يعمل بشكل صحيح.'),
            'url' => $request->input('url', '/settings'),
            'related_type' => 'settings',
            'related_id' => null,
        ], $user, true);

        return response()->json([
            'message' => $notification?->emailed_at ? 'تم إرسال إشعار تجريبي وحفظه وإرساله بالبريد' : 'تم حفظ الإشعار التجريبي، والبريد يحتاج إعداد SMTP صحيح',
            'data' => $notification,
            'unread_count' => $user->unreadNotifications()->count(),
        ], 201);
    }
    public function clear()
    {
        Auth::user()->notifications()->delete();
        return response()->json(['message' => 'Ã˜ÂªÃ™â€¦ Ã˜ÂªÃ™ÂÃ˜Â±Ã™Å Ã˜Âº Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â´Ã˜Â¹Ã˜Â§Ã˜Â±Ã˜Â§Ã˜Âª Ã˜Â¨Ã™â€ Ã˜Â¬Ã˜Â§Ã˜Â­', 'unread_count' => 0]);
    }
}