<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use App\Models\UsageLimit;
use App\Support\Tenancy;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** فرض حدود الخطة قبل الإنشاء: Route::middleware('plan.limit:campaigns') */
class EnforcePlanLimit
{
    public function handle(Request $request, Closure $next, string $resource): Response
    {
        // يطبَّق فقط على عمليات الإنشاء
        if (! $request->isMethod('post')) {
            return $next($request);
        }
        $agencyId = Tenancy::agencyId();
        if (! $agencyId) {
            return $next($request); // super admin / لا سياق
        }

        $sub = Subscription::where('agency_id', $agencyId)->latest()->first();
        $plan = $sub?->plan;
        if (! $plan) {
            return $next($request);
        }
        $limit = $plan->limitFor($resource);
        if ($limit <= 0) {
            return $next($request); // غير محدود
        }

        $usage = UsageLimit::firstOrCreate(
            ['agency_id' => $agencyId, 'resource' => $resource],
            ['used' => 0, 'limit' => $limit]
        );

        if ($usage->used >= $limit) {
            return response()->json([
                'message'  => 'تجاوزت حد خطتك لـ ' . $resource . ' (' . $limit . '). رقّ خطتك للمتابعة.',
                'error'    => 'plan_limit_reached',
                'resource' => $resource,
                'limit'    => $limit,
            ], 402); // Payment Required
        }

        $response = $next($request);
        // زِد الاستهلاك عند نجاح الإنشاء فقط
        if ($response->getStatusCode() < 300) {
            $usage->increment('used');
        }
        return $response;
    }
}
