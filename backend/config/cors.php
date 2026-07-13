<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // أصول الواجهة فقط (من env) — لا '*'. تُطبَّع: المضيف العاري (من Render host) يُضاف له https://
    'allowed_origins' => array_values(array_filter(array_map(function ($o) {
        $o = trim($o);
        if ($o === '') return null;
        return preg_match('#^https?://#i', $o) ? $o : 'https://' . $o;
    }, explode(',', env('FRONTEND_ORIGINS', 'http://localhost:8080'))))),
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Portal-Token', 'X-Requested-With'],
    'exposed_headers' => [],
    'max_age' => 3600,
    'supports_credentials' => true,
];
