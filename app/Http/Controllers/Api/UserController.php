<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Mengambil semua user (kecuali mungkin superadmin yang sedang login jika perlu)
    public function index()
    {
        $users = User::latest()->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    // Menambah User Baru
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users', // Username wajib dan harus unik
            'password' => 'required|string|min:8',
            'role'     => 'required|string',
        ]);
        

        $user = User::create([
            'name'     => $request->name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role'     => strtolower($request->role),
            // Jika di DB email masih NOT NULL, kita kasih nilai dummy otomatis:
            'email'    => $request->username . '@tif.com',
        ]);

        return response()->json(['success' => true, 'data' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users,username,' . $id,
            'role'     => 'required|string',
        ]);

        $user->name = $request->name;
        $user->username = $request->username;
        $user->role = strtolower($request->role);
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();
        return response()->json(['success' => true, 'data' => $user]);
    }

    // Hapus User
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['success' => true, 'message' => 'User berhasil dihapus']);
    }
}
