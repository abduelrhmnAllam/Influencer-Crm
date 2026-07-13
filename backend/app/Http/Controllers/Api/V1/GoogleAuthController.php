<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google
     * GET /api/v1/auth/google/redirect
     */
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle Google login callback (accepts redirect OR raw JWT ID token from frontend)
     * POST/GET /api/v1/auth/google/callback
     */
    public function callback(Request $request)
    {
        try {
            // Support both direct frontend Google One Tap / Sign-In token or full redirect flow
            if ($request->has('credential') || $request->has('token')) {
                $token = $request->input('credential') ?? $request->input('token');
                $tokenInfo = Http::timeout(10)->get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $token,
                ]);

                if (! $tokenInfo->successful()) {
                    return response()->json(['error' => 'تعذّر التحقق من حساب Google.'], 422);
                }

                $claims = $tokenInfo->json();
                if (($claims['aud'] ?? null) !== config('services.google.client_id')
                    || ! filter_var($claims['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                    return response()->json(['error' => 'رمز Google غير صالح لهذا التطبيق.'], 422);
                }

                $googleUser = new class($claims) {
                    public function __construct(private array $claims) {}
                    public function getId() { return $this->claims['sub'] ?? null; }
                    public function getEmail() { return $this->claims['email'] ?? null; }
                };
            } else {
                $googleUser = Socialite::driver('google')->stateless()->user();
            }

            if (!$googleUser || !$googleUser->getEmail()) {
                return response()->json([
                    'error' => 'تعذّر استرجاع معلومات الحساب من Google.'
                ], 422);
            }

            // Look up user by Google email
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                return response()->json([
                    'error' => 'البريد الإلكتروني لحساب Google غير مسجل في النظام. يرجى التواصل مع الإدارة.'
                ], 401);
            }

            if (!$user->is_active) {
                return response()->json([
                    'error' => 'الحساب موقوف. يرجى مراجعة الإدارة.'
                ], 403);
            }

            // Link Google account details if not linked yet
            if (empty($user->social_id) || $user->social_type !== 'google') {
                $user->update([
                    'social_id' => $googleUser->getId(),
                    'social_type' => 'google',
                    'email_verified_at' => $user->email_verified_at ?: now(),
                ]);
            }

            // Login user via stateful Sanctum session
            Auth::login($user);

            // Regenerate session for security
            $request->session()->regenerate();
            $user->update(['last_login_at' => now()]);

            return response()->json([
                'message' => 'تم تسجيل الدخول بنجاح عبر Google',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'roles' => $user->getRoleNames(),
                    'permissions' => collect($user->getAttribute('permissions') ?? [])
                        ->merge($user->getPermissionsViaRoles()->pluck('name'))
                        ->unique()
                        ->values(),
                    'avatar_color' => $user->avatar_color,
                    'preferences' => $user->preferences,
                    'agency_id' => $user->agency_id,
                ],
            ]);

        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'error' => 'فشلت عملية التحقق من حساب Google: ' . $e->getMessage()
            ], 500);
        }
    }
}
