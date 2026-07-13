<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'tenant'     => \App\Http\Middleware\SetCurrentAgency::class,
            'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'plan.limit' => \App\Http\Middleware\EnforcePlanLimit::class,
        ]);

        // Sanctum stateful cookie authentication for API routes
        $middleware->statefulApi();

        // Tenant context must exist before Laravel resolves implicit model bindings.
        // Otherwise AgencyScope intentionally fails closed and valid detail/update
        // routes are returned as 404 even for an authenticated agency user.
        $middleware->prependToPriorityList(
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \App\Http\Middleware\SetCurrentAgency::class,
        );

        // Dynamically set application locale from client request headers
        $middleware->append(\App\Http\Middleware\AcceptLanguageMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null; // ليست طلبات API — اترك المعالجة الافتراضية
            }

            // 422 — أخطاء التحقق مع تفاصيل الحقول
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'message' => $e->getMessage() ?: 'البيانات المدخلة غير صحيحة',
                    'errors'  => $e->errors(),
                    'error'   => 'validation',
                ], 422);
            }

            // 401 — غير مصادَق
            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                return response()->json([
                    'message' => 'يجب تسجيل الدخول للوصول لهذا المورد',
                    'error'   => 'unauthenticated',
                ], 401);
            }

            // 403 — غير مصرَّح
            if ($e instanceof \Illuminate\Auth\Access\AuthorizationException
                || $e instanceof \Spatie\Permission\Exceptions\UnauthorizedException) {
                return response()->json([
                    'message' => 'ليس لديك صلاحية لهذا الإجراء',
                    'error'   => $e instanceof \Spatie\Permission\Exceptions\UnauthorizedException
                        ? 'forbidden_role' : 'forbidden',
                ], 403);
            }

            // 404 — سجل أو مسار غير موجود
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException
                || $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                return response()->json([
                    'message' => 'السجل أو المسار المطلوب غير موجود',
                    'error'   => 'not_found',
                ], 404);
            }

            // 429 — تجاوز حد الطلبات
            if ($e instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException) {
                return response()->json([
                    'message' => 'محاولات كثيرة. حاول مجدداً بعد قليل.',
                    'error'   => 'too_many_requests',
                ], 429);
            }

            // استثناءات HTTP الأخرى (لها كود حالة صريح)
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                return response()->json([
                    'message' => $e->getMessage() ?: 'حدث خطأ',
                    'error'   => class_basename($e),
                ], $e->getStatusCode());
            }

            // 500 — لا نكشف تفاصيل الخادم في الإنتاج
            report($e);
            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'حدث خطأ غير متوقع. تم تسجيله وسيتم معالجته.',
                'error'   => config('app.debug') ? class_basename($e) : 'server_error',
            ], 500);
        });
    })->create();
