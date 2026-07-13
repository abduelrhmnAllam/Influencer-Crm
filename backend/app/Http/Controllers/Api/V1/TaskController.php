<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Task::with(['assignedBy:id,name', 'assignedTo:id,name']);
        
        if ($filter = $request->input('filter')) {
            switch ($filter) {
                case 'mine': $query->where('assigned_to', $user->id); break;
                case 'assigned_by_me': $query->where('assigned_by', $user->id); break;
                case 'overdue': $query->where('due_date', '<', today())->whereNotIn('status', ['completed', 'cancelled']); break;
            }
        }
        
        foreach (['status', 'priority', 'assigned_to'] as $f) {
            if ($v = $request->input($f)) $query->where($f, $v);
        }
        
        $query->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END")
              ->orderBy('due_date', 'asc');
        
        return response()->json($query->paginate(min((int)$request->input('per_page', 25), 100)));
    }

    public function store(Request $request, NotificationService $notifications)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:users,id',
            'related_type' => 'nullable|in:customer,influencer,campaign,transfer',
            'related_id' => 'nullable|integer',
            'priority' => 'in:low,normal,high,urgent',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|date_format:H:i',
        ]);
        
        $data['assigned_by'] = Auth::id();
        $task = Task::create($data);
        
        $notifications->notifyUser($task->assigned_to, [
            'type' => 'task_assigned',
            'title' => 'Ù…Ù‡Ù…Ø© Ø¬Ø¯ÙŠØ¯Ø©: ' . $task->title,
            'body' => $task->description ?: 'ØªÙ… Ø¥Ø³Ù†Ø§Ø¯ Ù…Ù‡Ù…Ø© Ø¬Ø¯ÙŠØ¯Ø© Ø¥Ù„ÙŠÙƒ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù†Ø¸Ø§Ù….',
            'url' => '/tasks/' . $task->id,
            'related_type' => 'task',
            'related_id' => $task->id,
        ], Auth::user());
        return response()->json(['data' => $task->load(['assignedBy', 'assignedTo']), 'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¥Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â´ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¡ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Â¡Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â©'], 201);
    }

    public function show(Task $task)
    {
        $task->load(['assignedBy', 'assignedTo', 'comments.user', 'activity.user']);
        return response()->json(['data' => $task]);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'due_date' => 'nullable|date',
            'progress' => 'sometimes|integer|min:0|max:100',
        ]);
        
        if (isset($data['status']) && $data['status'] === 'completed') {
            $data['completed_at'] = now();
            $data['progress'] = 100;
        }
        
        $task->update($data);
        return response()->json(['data' => $task->fresh()]);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â­ÃƒËœÃ‚Â°Ãƒâ„¢Ã‚Â']);
    }

    public function addComment(Request $request, Task $task)
    {
        $request->validate(['content' => 'required|string']);
        $comment = $task->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);
        return response()->json(['data' => $comment->load('user'), 'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¶ÃƒËœÃ‚Â§Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¡'], 201);
    }

    public function updateProgress(Request $request, Task $task)
    {
        $request->validate(['progress' => 'required|integer|min:0|max:100']);
        $task->update(['progress' => $request->progress]);
        if ($request->progress === 100) {
            $task->update(['status' => 'completed', 'completed_at' => now()]);
        }
        return response()->json(['data' => $task->fresh()]);
    }
}
