<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $token = $user ? $user->currentAccessToken() : null;
        $abilities = $token ? (array) ($token->abilities ?? []) : [];

        $hasExplicitAdminAbility = in_array('admin', $abilities, true) && !in_array('*', $abilities, true);

        if (!$user || $user->role !== 'admin' || !$hasExplicitAdminAbility) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Admin privileges required.',
            ], 403);
        }

        return $next($request);
    }
}
