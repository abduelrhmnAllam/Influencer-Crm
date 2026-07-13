<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
            'message' => 'تم حفظ إعدادات النظام بنجاح',
            'data' => $merged,
        ]);
    }

    public function teamPreview(Request $request)
    {
        Log::info('Settings team preview captured', ['user_id' => auth()->id(), 'payload' => $request->all()]);

        return response()->json([
            'ok' => true,
            'message' => 'تم استقبال بيانات العضو التجريبية',
        ]);
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
            'team.create' => 'تم إضافة العضو بنجاح',
            'team.update' => 'تم تحديث بيانات العضو بنجاح',
            'team.delete' => 'تم حذف العضو بنجاح',
            'backup.auto' => 'تم تحديث إعداد النسخ التلقائية',
            'backup.create' => 'تم إنشاء نسخة احتياطية جديدة',
            'backup.download' => 'تم تجهيز ملف النسخة للتنزيل',
            'backup.restore' => 'تمت استعادة النسخة الاحتياطية بنجاح',
            'backup.delete' => 'تم حذف النسخة الاحتياطية',
            'data.export' => 'تم تجهيز ملف التصدير',
            'data.import' => 'تم استيراد الملف التجريبي بنجاح',
            'data.reset_empty' => 'تم تنفيذ إفراغ البيانات التجريبية',
            'data.reset_demo' => 'تمت استعادة البيانات التجريبية',
            'sync.now' => 'تمت المزامنة مع الخادم بنجاح',
            'storage.clean_cache' => 'تم تنظيف الكاش بنجاح',
            'storage.clean_temp' => 'تم مسح الملفات المؤقتة بنجاح',
        ];

        $responsePayload = $data['payload'] ?? [];

        if (in_array($data['action'], ['team.create', 'team.update', 'team.delete'], true)) {
            $responsePayload = $this->handleTeamAction($request, $data['action'], $responsePayload);
        }

        return response()->json([
            'ok' => true,
            'message' => $messages[$data['action']] ?? 'تم تنفيذ العملية بنجاح',
            'payload' => $responsePayload,
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
            if (! empty($validated['password'])) {
                $user->password = $validated['password'];
            }
            $user->save();
            $this->syncUserRoleFromColumn($user);

            return ['team' => $this->teamRows($request), 'user' => $this->formatTeamUser($user->fresh())];
        }

        if ($action === 'team.delete') {
            if ($user->id === $request->user()?->id) {
                abort(422, 'لا يمكن حذف نفسك');
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
            if (! empty($payload['id'])) {
                $q->orWhere('id', $payload['id']);
            }
            if (! empty($payload['username'])) {
                $q->orWhere('username', $payload['username']);
            }
        })->firstOrFail();
    }

    private function formatTeamUser(User $user): array
    {
        $labels = $this->roleLabels();

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

    private function roleLabels(): array
    {
        return [
            'super_admin' => 'مدير النظام',
            'agency_admin' => 'مدير الوكالة',
            'admin' => 'مدير الوكالة',
            'campaign_manager' => 'مدير حملات',
            'finance' => 'المالية',
            'finance_manager' => 'مدير المالية',
            'viewer' => 'مشاهد',
            'client' => 'عميل',
            'influencer' => 'مؤثر',
            'influencer_manager' => 'مدير المؤثرين',
            'operations_manager' => 'مدير عمليات',
            'campaign_coordinator' => 'منسق حملات',
            'influencer_coordinator' => 'منسق مؤثرين',
            'marketing_manager' => 'مدير تسويق',
            'accounts_manager' => 'مدير حسابات',
            'accountant' => 'محاسب',
            'custom' => 'مخصص',
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
                'company_brand' => 'سمارت كود',
                'cr_number' => '1010897654',
                'vat_number' => '300456789000003',
                'contact_email' => 'ops@smartcode.sa',
                'contact_phone' => '+966 11 200 5000',
                'address' => 'الرياض، حي الملقا، المملكة العربية السعودية',
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
                ['id' => 1, 'name' => 'عبدالله المدير', 'username' => 'admin', 'email' => 'admin@smartcode.sa', 'role' => 'agency_admin', 'role_label' => 'مدير الوكالة', 'status' => 'active'],
                ['id' => 2, 'name' => 'سارة العتيبي', 'username' => 'sarah.ops', 'email' => 'sarah@smartcode.sa', 'role' => 'campaign_manager', 'role_label' => 'مدير حملات', 'status' => 'active'],
                ['id' => 3, 'name' => 'محمد الحربي', 'username' => 'moh.finance', 'email' => 'finance@smartcode.sa', 'role' => 'finance', 'role_label' => 'المالية', 'status' => 'active'],
                ['id' => 4, 'name' => 'لينا السالم', 'username' => 'lina.viewer', 'email' => 'lina@smartcode.sa', 'role' => 'viewer', 'role_label' => 'مشاهد', 'status' => 'active'],
            ],
            'stats' => [
                'influencers' => 186,
                'customers' => 24,
                'daily_ads' => 64,
                'transfers' => 31,
                'campaigns' => 17,
                'contents' => 92,
                'requests' => 8,
                'portal_users' => 6,
            ],
            'backups' => [
                ['id' => 'bk_20260713_0900', 'type' => 'auto', 'label' => 'نسخة تلقائية قبل مزامنة الطلبات', 'created_at' => '2026-07-13 09:00', 'size_kb' => 842, 'user' => 'system'],
                ['id' => 'bk_20260712_1830', 'type' => 'manual', 'label' => 'نسخة يدوية قبل تعديل الحملات', 'created_at' => '2026-07-12 18:30', 'size_kb' => 801, 'user' => 'admin'],
                ['id' => 'bk_20260711_0800', 'type' => 'pre_import', 'label' => 'قبل استيراد مؤثرين TikTok', 'created_at' => '2026-07-11 08:00', 'size_kb' => 766, 'user' => 'sarah.ops'],
            ],
            'activity' => [
                ['id' => 1, 'type' => 'update', 'short' => '~', 'action' => 'تحديث بيانات الشركة', 'user' => 'admin', 'timestamp' => '2026-07-13 09:14'],
                ['id' => 2, 'type' => 'backup', 'short' => 'B', 'action' => 'إنشاء نسخة احتياطية تلقائية', 'user' => 'system', 'timestamp' => '2026-07-13 09:00'],
                ['id' => 3, 'type' => 'create', 'short' => '+', 'action' => 'إضافة مستخدم ببوابة خارجية', 'user' => 'sarah.ops', 'timestamp' => '2026-07-12 17:20'],
                ['id' => 4, 'type' => 'import', 'short' => '↓', 'action' => 'استيراد ملف مؤثرين جديد', 'user' => 'admin', 'timestamp' => '2026-07-11 08:03'],
            ],
            'storage' => [
                'sync_status' => 'متصل بالخادم',
                'last_sync' => '2026-07-13 09:22',
                'total_mb' => 512,
                'used_mb' => 184,
                'cache_mb' => 31,
            ],
        ];
    }
}
