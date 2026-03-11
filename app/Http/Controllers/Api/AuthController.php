<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth; // <--- TAMBAHKAN INI UNTUK JAGA-JAGA

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        // 2. Cari User berdasarkan Username
        $user = User::where('username', $request->username)->first();

        // 3. Cek Password
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau Password salah!'
            ], 401);
        }

        // 4. Buat Token (Laravel Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Kirim Respon ke React
        return response()->json([
            'success' => true,
            'message' => 'Login Berhasil!',
            'user'    => [
                'name'     => $user->name,
                'username' => $user->username,
                'role'     => $user->role,
            ],
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Berhasil Keluar']);
    }
}