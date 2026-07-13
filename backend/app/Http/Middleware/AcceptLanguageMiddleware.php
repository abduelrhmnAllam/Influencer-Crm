<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AcceptLanguageMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language') ?? $request->header('Accept_Language');
        
        // Match primary language code (e.g. ar-SA -> ar, en-US -> en)
        if ($locale) {
            $primaryLocale = substr(trim($locale), 0, 2);
            if (in_array($primaryLocale, ['ar', 'en'], true)) {
                app()->setLocale($primaryLocale);
            }
        }

        return $next($request);
    }
}
