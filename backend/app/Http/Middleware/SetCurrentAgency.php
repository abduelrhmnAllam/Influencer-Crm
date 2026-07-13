<?php

namespace App\Http\Middleware;

use App\Support\Tenancy;
use Closure;
use Illuminate\Http\Request;

/** يضبط سياق الوكالة من المستخدم المُصادَق — أساس عزل البيانات */
class SetCurrentAgency
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user) {
            if (($user->role ?? null) === 'super_admin') {
                Tenancy::bypass(true); // يرى كل الوكالات
            } else {
                Tenancy::setAgencyId($user->agency_id);
            }
        }
        return $next($request);
    }
}
