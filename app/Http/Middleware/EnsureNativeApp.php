<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class EnsureNativeApp
{
    /**
     * Allow requests coming from the Capacitor WebView (native app) and
     * redirect everyone else to the app landing page.
     *
     * @param  Closure(Request): (HttpResponse)  $next
     */
    public function handle(Request $request, Closure $next): HttpResponse
    {
        if (config('app.web_access_allowed')) {
            return $next($request);
        }

        if ($this->isNativeUserAgent($request->userAgent())) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            abort(Response::HTTP_FORBIDDEN, 'This application is only available via the Life Man app.');
        }

        return redirect()->away((string) config('app.web_redirect_url'));
    }

    private function isNativeUserAgent(?string $userAgent): bool
    {
        return $userAgent !== null && str_contains($userAgent, 'Capacitor');
    }
}
