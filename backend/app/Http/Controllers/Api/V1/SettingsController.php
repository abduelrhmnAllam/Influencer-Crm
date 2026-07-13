<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $payload = $this->demoPayload();
        $cached = $this->storedSettings();

        foreach (['company', 'general', 'notifications'] as $section) {
            if (isset($cached[$section]) && is_array($cached[$section])) {
                $payload[$section] = array_replace($payload[$section], $cached[$section]);
            }
        }

        $payload['team'] = $this->teamRows($request);

        return response()->json($payload);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'company' => 'nullable|array',
            'general' => 'nullable|array',
            'notifications' => 'nullable|array',
        ]);

        $current = $this->storedSettings();
        $merged = array_replace_recursive($current, $data);
        $this->storeSettings($merged);

        Log::info('Settings demo save captured', ['user_id' => auth()->id(), 'payload' => $data]);

        return response()->json([
            'ok' => true,
            'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â­Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â¸ ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¸ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'data' => $merged,
        ]);
    }

    public function teamPreview(Request $request)
    {
        Log::info('Settings team preview captured', ['user_id' => auth()->id(), 'payload' => $request->all()]);
        return response()->json(['ok' => true, 'message' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¶Ãƒâ„¢Ã‹â€  ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¬ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©']);
    }

    public function action(Request $request)
    {
        $data = $request->validate([
            'action' => 'required|string|max:80',
            'payload' => 'nullable|array',
        ]);

        Log::info('Settings demo action captured', [
            'user_id' => auth()->id(),
            'action' => $data['action'],
            'payload' => $data['payload'] ?? [],
        ]);

        $messages = [
            'team.create' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¶ÃƒËœÃ‚Â§Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¶Ãƒâ„¢Ã‹â€  ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'team.update' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â« ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¶Ãƒâ„¢Ã‹â€  ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'team.delete' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â­ÃƒËœÃ‚Â°Ãƒâ„¢Ã‚Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¶Ãƒâ„¢Ã‹â€  ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'backup.auto' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â« ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â® ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¦Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©',
            'backup.create' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¥Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â´ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¡ Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â®ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Â·Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â©',
            'backup.download' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¬Ãƒâ„¢Ã¢â‚¬Â¡Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â² Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â®ÃƒËœÃ‚Â© Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â²Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾',
            'backup.restore' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¹ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â®ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Â·Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'backup.delete' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â­ÃƒËœÃ‚Â°Ãƒâ„¢Ã‚Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â®ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Â·Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©',
            'data.export' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¬Ãƒâ„¢Ã¢â‚¬Â¡Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â² Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚ÂµÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â±',
            'data.import' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â§ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â±ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¬ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â  ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'data.reset_empty' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â Ãƒâ„¢Ã‚ÂÃƒâ„¢Ã…Â ÃƒËœÃ‚Â° ÃƒËœÃ‚Â¥Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â±ÃƒËœÃ‚Â§ÃƒËœÃ‚Âº ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¬ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ',
            'data.reset_demo' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¹ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¬ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©',
            'sync.now' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â²ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â© Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¹ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â®ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'storage.clean_cache' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¸Ãƒâ„¢Ã…Â Ãƒâ„¢Ã‚Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã†â€™ÃƒËœÃ‚Â§ÃƒËœÃ‚Â´ ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'storage.clean_temp' => 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â³ÃƒËœÃ‚Â­ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â§ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¤Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚ÂªÃƒËœÃ‚Â© ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
        ];

        $responsePayload = $data['payload'] ?? [];

        if (in_array($data['action'], ['team.create', 'team.update', 'team.delete'], true)) {
            $responsePayload = $this->handleTeamAction($request, $data['action'], $responsePayload);
        }

        return response()->json([
            'ok' => true,
            'message' => $messages[$data['action']] ?? 'ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Â Ãƒâ„¢Ã‚ÂÃƒâ„¢Ã…Â ÃƒËœÃ‚Â° ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­',
            'action' => $data['action'],
            'payload' => $responsePayload,
            'timestamp' => now()->format('Y-m-d H:i'),
        ]);
    }

    private function teamRows(Request $request): array
    {
        $query = User::query();
        if ($request->user()?->role !== 'super_admin') {
            $query->where('agency_id', $request->user()?->agency_id);
        }

        return $query->orderByRaw("username = 'admin' desc")
            ->orderBy('name')
            ->get()
            ->map(function (User $user) {
                $this->syncUserRoleFromColumn($user);
                return $this->formatTeamUser($user->fresh() ?? $user);
            })
            ->values()
            ->all();
    }

    private function handleTeamAction(Request $request, string $action, array $payload): array
    {
        if (array_key_exists('password', $payload) && $payload['password'] === '') {
            unset($payload['password']);
        }

        if ($action === 'team.create') {
            $validated = validator($payload, [
                'username' => ['required', 'string', 'min:3', 'max:50', Rule::unique('users', 'username')],
                'name' => ['required', 'string', 'max:100'],
                'email' => ['nullable', 'email', Rule::unique('users', 'email')],
                'password' => ['required', 'string', 'min:6'],
                'role' => ['required', 'string', 'max:50'],
            ])->validate();

            $user = new User();
            $user->username = $validated['username'];
            $user->name = $validated['name'];
            $user->email = $validated['email'] ?? null;
            $user->password = $validated['password'];
            $user->role = $validated['role'];
            $user->is_active = true;
            $user->agency_id = $request->user()?->agency_id;
            $user->save();
            $this->syncUserRoleFromColumn($user);

            return ['team' => $this->teamRows($request), 'user' => $this->formatTeamUser($user->fresh())];
        }

        $user = $this->findTeamUser($request, $payload);

        if ($action === 'team.update') {
            $validated = validator($payload, [
                'username' => ['sometimes', 'string', 'min:3', 'max:50', Rule::unique('users', 'username')->ignore($user->id)],
                'name' => ['required', 'string', 'max:100'],
                'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($user->id)],
                'password' => ['nullable', 'string', 'min:6'],
                'role' => ['required', 'string', 'max:50'],
            ])->validate();

            $user->username = $validated['username'] ?? $user->username;
            $user->name = $validated['name'];
            $user->email = $validated['email'] ?? null;
            $user->role = $validated['role'];
            if (!empty($validated['password'])) {
                $user->password = $validated['password'];
            }
            $user->save();
            $this->syncUserRoleFromColumn($user);

            return ['team' => $this->teamRows($request), 'user' => $this->formatTeamUser($user->fresh())];
        }

        if ($action === 'team.delete') {
            if ($user->id === $request->user()?->id) {
                abort(422, 'Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã¢â‚¬Â  ÃƒËœÃ‚Â­ÃƒËœÃ‚Â°Ãƒâ„¢Ã‚Â Ãƒâ„¢Ã¢â‚¬Â Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â³Ãƒâ„¢Ã†â€™');
            }
            $user->delete();
            return ['team' => $this->teamRows($request)];
        }

        return ['team' => $this->teamRows($request)];
    }

    private function syncUserRoleFromColumn(User $user): void
    {
        $spatieRole = $this->spatieRoleFor($user->role ?? '');

        if (! $spatieRole) {
            return;
        }

        if (! Role::query()->where('name', $spatieRole)->where('guard_name', 'web')->exists()) {
            return;
        }

        $currentRoles = $user->getRoleNames();
        if ($currentRoles->count() !== 1 || ! $currentRoles->contains($spatieRole)) {
            $user->syncRoles([$spatieRole]);
        }
    }

    private function spatieRoleFor(string $role): ?string
    {
        return match ($role) {
            'super_admin' => 'super_admin',
            'admin', 'agency_admin' => 'agency_admin',
            'campaign_manager', 'operations_manager', 'campaign_coordinator', 'marketing_manager', 'accounts_manager' => 'campaign_manager',
            'finance', 'finance_manager' => 'finance_manager',
            'accountant' => 'accountant',
            'influencer', 'influencer_manager', 'influencer_coordinator' => 'influencer_manager',
            'viewer', 'client', 'custom' => 'viewer',
            default => null,
        };
    }
    private function findTeamUser(Request $request, array $payload): User
    {
        $query = User::query();
        if ($request->user()?->role !== 'super_admin') {
            $query->where('agency_id', $request->user()?->agency_id);
        }

        return $query->where(function ($q) use ($payload) {
            if (!empty($payload['id'])) {
                $q->orWhere('id', $payload['id']);
            }
            if (!empty($payload['username'])) {
                $q->orWhere('username', $payload['username']);
            }
        })->firstOrFail();
    }

    private function formatTeamUser(User $user): array
    {
        $labels = [
            'agency_admin' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¸ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¦', 'admin' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â¸ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¦', 'campaign_manager' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª', 'finance' => 'ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©', 'finance_manager' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©', 'viewer' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â´ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¡ÃƒËœÃ‚Â¯', 'client' => 'ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾', 'influencer' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¤ÃƒËœÃ‚Â«ÃƒËœÃ‚Â±', 'operations_manager' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â¹Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª', 'campaign_coordinator' => 'Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³Ãƒâ„¢Ã¢â‚¬Å¡ ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª', 'influencer_coordinator' => 'Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³Ãƒâ„¢Ã¢â‚¬Å¡ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â´ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¡Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â±', 'marketing_manager' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚ÂªÃƒËœÃ‚Â³Ãƒâ„¢Ã‹â€ Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¡', 'accounts_manager' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â­ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª', 'accountant' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â­ÃƒËœÃ‚Â§ÃƒËœÃ‚Â³ÃƒËœÃ‚Â¨', 'custom' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â®ÃƒËœÃ‚ÂµÃƒËœÃ‚Âµ',
        ];

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'role_label' => $labels[$user->role] ?? $user->role,
            'status' => $user->is_active ? 'active' : 'inactive',
        ];
    }
    private function storagePath(): string
    {
        $agencyId = auth()->user()?->agency_id;
        return 'demo/settings-agency-' . ($agencyId ?: auth()->id() ?: 'guest') . '.json';
    }

    private function legacyStoragePath(): string
    {
        return 'demo/settings-' . (auth()->id() ?: 'guest') . '.json';
    }

    private function storedSettings(): array
    {
        $disk = Storage::disk('local');
        $path = $disk->exists($this->storagePath()) ? $this->storagePath() : $this->legacyStoragePath();

        if (! $disk->exists($path)) {
            return [];
        }

        $decoded = json_decode($disk->get($path), true);
        return is_array($decoded) ? $decoded : [];
    }

    private function storeSettings(array $settings): void
    {
        Storage::disk('local')->put(
            $this->storagePath(),
            json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
        );
    }

    private function demoPayload(): array
    {
        return [
            'company' => [
                'company_name' => 'Smart Code',
                'company_brand' => 'ÃƒËœÃ‚Â³Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â§ÃƒËœÃ‚Â±ÃƒËœÃ‚Âª Ãƒâ„¢Ã†â€™Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â¯',
                'cr_number' => '1010897654',
                'vat_number' => '300456789000003',
                'contact_email' => 'ops@smartcode.sa',
                'contact_phone' => '+966 11 200 5000',
                'address' => 'ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¶ÃƒËœÃ…â€™ ÃƒËœÃ‚Â­Ãƒâ„¢Ã…Â  ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â§ÃƒËœÃ…â€™ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã†â€™ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â±ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â³ÃƒËœÃ‚Â¹Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©',
            ],
            'general' => [
                'currency' => 'SAR',
                'vat_rate' => 15,
                'timezone' => 'Asia/Riyadh',
                'language' => 'ar',
                'theme' => 'light',
            ],
            'notifications' => [
                'inapp_enabled' => true,
                'inapp_new_transfer' => true,
                'inapp_transfer_receipt' => true,
                'inapp_transfer_completed' => true,
                'inapp_new_ad' => true,
                'inapp_backup_failed' => true,
                'sound_enabled' => false,
                'email_enabled' => true,
                'email_recipients' => 'ops@smartcode.sa, finance@smartcode.sa',
                'email_new_transfer' => true,
                'email_transfer_completed' => true,
                'email_daily_summary' => false,
                'email_weekly_report' => true,
            ],
            'team' => [
                ['id' => 1, 'name' => 'ÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â¯ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¡ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â±', 'username' => 'admin', 'email' => 'admin@smartcode.sa', 'role' => 'agency_admin', 'role_label' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‹â€ Ãƒâ„¢Ã†â€™ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â©', 'status' => 'active'],
                ['id' => 2, 'name' => 'ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§ÃƒËœÃ‚Â±ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¹ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ', 'username' => 'sarah.ops', 'email' => 'sarah@smartcode.sa', 'role' => 'campaign_manager', 'role_label' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â± ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª', 'status' => 'active'],
                ['id' => 3, 'name' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¯ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â­ÃƒËœÃ‚Â±ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ', 'username' => 'moh.finance', 'email' => 'finance@smartcode.sa', 'role' => 'finance', 'role_label' => 'ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©', 'status' => 'active'],
                ['id' => 4, 'name' => 'Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â§ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â³ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Â¦', 'username' => 'lina.viewer', 'email' => 'lina@smartcode.sa', 'role' => 'viewer', 'role_label' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â´ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¡ÃƒËœÃ‚Â¯', 'status' => 'active'],
            ],
            'stats' => ['influencers' => 186, 'customers' => 24, 'daily_ads' => 64, 'transfers' => 31, 'campaigns' => 17, 'contents' => 92, 'requests' => 8, 'portal_users' => 6],
            'backups' => [
                ['id' => 'bk_20260713_0900', 'type' => 'auto', 'label' => 'Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â®ÃƒËœÃ‚Â© ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¦Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Å¾ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â²ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â·Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª', 'created_at' => '2026-07-13 09:00', 'size_kb' => 842, 'user' => 'system'],
                ['id' => 'bk_20260712_1830', 'type' => 'manual', 'label' => 'Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â®ÃƒËœÃ‚Â© Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¯Ãƒâ„¢Ã‹â€ Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚ÂªÃƒËœÃ‚Â¹ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â­Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª', 'created_at' => '2026-07-12 18:30', 'size_kb' => 801, 'user' => 'admin'],
                ['id' => 'bk_20260711_0800', 'type' => 'pre_import', 'label' => 'Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â¨Ãƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â§ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â±ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯ Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¤ÃƒËœÃ‚Â«ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Â  TikTok', 'created_at' => '2026-07-11 08:00', 'size_kb' => 766, 'user' => 'sarah.ops'],
            ],
            'activity' => [
                ['id' => 1, 'type' => 'update', 'short' => '~', 'action' => 'ÃƒËœÃ‚ÂªÃƒËœÃ‚Â­ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â« ÃƒËœÃ‚Â¨Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Âª ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â´ÃƒËœÃ‚Â±Ãƒâ„¢Ã†â€™ÃƒËœÃ‚Â©', 'user' => 'admin', 'timestamp' => '2026-07-13 09:14'],
                ['id' => 2, 'type' => 'backup', 'short' => 'B', 'action' => 'ÃƒËœÃ‚Â¥Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â´ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¡ Ãƒâ„¢Ã¢â‚¬Â ÃƒËœÃ‚Â³ÃƒËœÃ‚Â®ÃƒËœÃ‚Â© ÃƒËœÃ‚Â§ÃƒËœÃ‚Â­ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â§ÃƒËœÃ‚Â·Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â© ÃƒËœÃ‚ÂªÃƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã¢â‚¬Å¡ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¦Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â©', 'user' => 'system', 'timestamp' => '2026-07-13 09:00'],
                ['id' => 3, 'type' => 'create', 'short' => '+', 'action' => 'ÃƒËœÃ‚Â¥ÃƒËœÃ‚Â¶ÃƒËœÃ‚Â§Ãƒâ„¢Ã‚ÂÃƒËœÃ‚Â© Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒËœÃ‚Â®ÃƒËœÃ‚Â¯Ãƒâ„¢Ã¢â‚¬Â¦ ÃƒËœÃ‚Â¨Ãƒâ„¢Ã‹â€ ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â© ÃƒËœÃ‚Â®ÃƒËœÃ‚Â§ÃƒËœÃ‚Â±ÃƒËœÃ‚Â¬Ãƒâ„¢Ã…Â ', 'user' => 'sarah.ops', 'timestamp' => '2026-07-12 17:20'],
                ['id' => 4, 'type' => 'import', 'short' => 'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“', 'action' => 'ÃƒËœÃ‚Â§ÃƒËœÃ‚Â³ÃƒËœÃ‚ÂªÃƒâ„¢Ã…Â ÃƒËœÃ‚Â±ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯ Ãƒâ„¢Ã¢â‚¬Â¦Ãƒâ„¢Ã¢â‚¬Å¾Ãƒâ„¢Ã‚Â Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚Â¤ÃƒËœÃ‚Â«ÃƒËœÃ‚Â±Ãƒâ„¢Ã…Â Ãƒâ„¢Ã¢â‚¬Â  ÃƒËœÃ‚Â¬ÃƒËœÃ‚Â¯Ãƒâ„¢Ã…Â ÃƒËœÃ‚Â¯', 'user' => 'admin', 'timestamp' => '2026-07-11 08:03'],
            ],
            'storage' => ['sync_status' => 'Ãƒâ„¢Ã¢â‚¬Â¦ÃƒËœÃ‚ÂªÃƒËœÃ‚ÂµÃƒâ„¢Ã¢â‚¬Å¾ ÃƒËœÃ‚Â¨ÃƒËœÃ‚Â§Ãƒâ„¢Ã¢â‚¬Å¾ÃƒËœÃ‚Â®ÃƒËœÃ‚Â§ÃƒËœÃ‚Â¯Ãƒâ„¢Ã¢â‚¬Â¦', 'last_sync' => '2026-07-13 09:22', 'total_mb' => 512, 'used_mb' => 184, 'cache_mb' => 31],
        ];
    }
}