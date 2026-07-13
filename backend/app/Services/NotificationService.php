<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Throwable;

class NotificationService
{
    public function notifyUser(User|int $user, array $payload, ?User $actor = null, bool $force = false): ?Notification
    {
        $target = $user instanceof User ? $user : User::query()->find($user);
        if (! $target) {
            return null;
        }

        $type = (string) ($payload['type'] ?? 'info');
        $settings = $this->settingsFor($actor ?? $target);

        if (! $force && ! $this->inAppEnabled($settings, $type)) {
            return null;
        }

        $notification = Notification::create([
            'user_id' => $target->id,
            'type' => $type,
            'title' => (string) ($payload['title'] ?? 'إشعار جديد'),
            'body' => $payload['body'] ?? null,
            'url' => $payload['url'] ?? null,
            'related_type' => $payload['related_type'] ?? null,
            'related_id' => $payload['related_id'] ?? null,
        ]);

        if ($force || $this->emailEnabled($settings, $type)) {
            $sent = $this->sendEmail($notification, $target, $settings);
            if ($sent) {
                $notification->forceFill(['emailed_at' => now()])->save();
            }
        }

        return $notification->fresh();
    }

    public function notifyUsers(iterable $users, array $payload, ?User $actor = null, bool $force = false): array
    {
        $created = [];
        foreach ($users as $user) {
            $notification = $this->notifyUser($user, $payload, $actor, $force);
            if ($notification) {
                $created[] = $notification;
            }
        }
        return $created;
    }

    public function notifyRoles(array $roles, array $payload, ?User $actor = null, bool $force = false): array
    {
        $query = User::query()->where('is_active', true)->whereIn('role', $roles);
        if (($actor?->role ?? null) !== 'super_admin') {
            $query->where('agency_id', $actor?->agency_id);
        }

        return $this->notifyUsers($query->get(), $payload, $actor, $force);
    }

    private function sendEmail(Notification $notification, User $target, array $settings): bool
    {
        $recipients = $this->emailRecipients($settings, $target);
        if ($recipients === []) {
            return false;
        }

        $subject = '[SmartCode CRM] ' . $notification->title;
        $bodyText = trim($notification->title . "\n\n" . ($notification->body ?? '') . "\n\n" . $this->absoluteUrl($notification->url));
        $bodyHtml = $this->emailHtml($notification, $target);
        $allSent = true;

        foreach ($recipients as $email) {
            $logId = $this->logEmail($email, $subject, $bodyHtml, $bodyText, 'queued', $notification);
            try {
                Mail::html($bodyHtml, function ($message) use ($email, $subject) {
                    $message->to($email)->subject($subject);
                });

                $this->markEmailLog($logId, 'sent');
            } catch (Throwable $e) {
                $allSent = false;
                $this->markEmailLog($logId, 'failed', $e->getMessage());
                Log::warning('Notification email failed', [
                    'notification_id' => $notification->id,
                    'to' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $allSent;
    }

    private function settingsFor(User $user): array
    {
        $defaults = $this->defaultSettings();
        $paths = array_filter([
            $user->agency_id ? 'demo/settings-agency-' . $user->agency_id . '.json' : null,
            $user->id ? 'demo/settings-' . $user->id . '.json' : null,
        ]);

        foreach ($paths as $path) {
            if (! Storage::disk('local')->exists($path)) {
                continue;
            }

            $decoded = json_decode(Storage::disk('local')->get($path), true);
            if (is_array($decoded) && isset($decoded['notifications']) && is_array($decoded['notifications'])) {
                return array_replace($defaults, $decoded['notifications']);
            }
        }

        return $defaults;
    }

    private function defaultSettings(): array
    {
        return [
            'inapp_enabled' => true,
            'inapp_new_transfer' => true,
            'inapp_transfer_receipt' => true,
            'inapp_transfer_completed' => true,
            'inapp_new_ad' => true,
            'inapp_backup_failed' => true,
            'email_enabled' => true,
            'email_recipients' => env('NOTIFICATION_EMAIL_RECIPIENTS', ''),
            'email_new_transfer' => true,
            'email_transfer_completed' => true,
            'email_daily_summary' => false,
            'email_weekly_report' => true,
        ];
    }

    private function inAppEnabled(array $settings, string $type): bool
    {
        if (! ($settings['inapp_enabled'] ?? true)) {
            return false;
        }

        return match ($type) {
            'transfer_pending', 'new_transfer' => (bool) ($settings['inapp_new_transfer'] ?? true),
            'transfer_receipt' => (bool) ($settings['inapp_transfer_receipt'] ?? true),
            'transfer_completed' => (bool) ($settings['inapp_transfer_completed'] ?? true),
            'daily_ad_created' => (bool) ($settings['inapp_new_ad'] ?? true),
            'backup_failed', 'system_warning' => (bool) ($settings['inapp_backup_failed'] ?? true),
            default => true,
        };
    }

    private function emailEnabled(array $settings, string $type): bool
    {
        if (! ($settings['email_enabled'] ?? false)) {
            return false;
        }

        return match ($type) {
            'transfer_pending', 'new_transfer' => (bool) ($settings['email_new_transfer'] ?? true),
            'transfer_completed' => (bool) ($settings['email_transfer_completed'] ?? true),
            default => true,
        };
    }

    private function emailRecipients(array $settings, User $target): array
    {
        $recipients = [];
        if ($target->email) {
            $recipients[] = $target->email;
        }

        $configured = (string) ($settings['email_recipients'] ?? '');
        foreach (preg_split('/[,;\s]+/', $configured) ?: [] as $email) {
            $email = trim($email);
            if ($email !== '') {
                $recipients[] = $email;
            }
        }

        return collect($recipients)
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values()
            ->all();
    }

    private function emailHtml(Notification $notification, User $target): string
    {
        $url = $this->absoluteUrl($notification->url);
        $body = nl2br(e($notification->body ?? ''));
        $button = $url ? '<a href="' . e($url) . '" style="display:inline-block;margin-top:16px;background:#0d8a6f;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700">فتح في النظام</a>' : '';

        return '<div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;background:#f6f8fb;padding:24px;color:#0f172a">'
            . '<div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px">'
            . '<div style="font-size:13px;color:#0d8a6f;font-weight:700;margin-bottom:10px">SmartCode Influencer CRM</div>'
            . '<h2 style="margin:0 0 12px;font-size:22px">' . e($notification->title) . '</h2>'
            . '<p style="font-size:15px;line-height:1.8;color:#334155">' . $body . '</p>'
            . $button
            . '<hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0">'
            . '<div style="font-size:12px;color:#64748b">تم إرسال هذا الإشعار إلى ' . e($target->name ?: $target->username) . ' من نظام SmartCode CRM.</div>'
            . '</div></div>';
    }

    private function absoluteUrl(?string $url): string
    {
        if (! $url) {
            return '';
        }
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', env('APP_URL'))), '/') . '/' . ltrim($url, '/');
    }

    private function logEmail(string $to, string $subject, string $bodyHtml, string $bodyText, string $status, Notification $notification): ?int
    {
        if (! Schema::hasTable('email_log')) {
            return null;
        }

        return DB::table('email_log')->insertGetId([
            'to_email' => $to,
            'subject' => $subject,
            'body_html' => $bodyHtml,
            'body_text' => $bodyText,
            'status' => $status,
            'related_type' => 'notification',
            'related_id' => $notification->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function markEmailLog(?int $logId, string $status, ?string $error = null): void
    {
        if (! $logId || ! Schema::hasTable('email_log')) {
            return;
        }

        DB::table('email_log')->where('id', $logId)->update([
            'status' => $status,
            'error_message' => $error,
            'sent_at' => $status === 'sent' ? now() : null,
            'failed_at' => $status === 'failed' ? now() : null,
            'updated_at' => now(),
        ]);
    }
}