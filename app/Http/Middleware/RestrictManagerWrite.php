<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictManagerWrite
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
{
    $user = $request->user();

    // Jika user adalah manager dan mencoba melakukan selain GET (melihat)
    if ($user && $user->role === 'manager' && !$request->isMethod('get')) {
        return response()->json([
            'success' => false,
            'message' => 'Akses Ditolak: Manager hanya diperbolehkan melihat data.'
        ], 403);
    }

    return $next($request);
}
}
