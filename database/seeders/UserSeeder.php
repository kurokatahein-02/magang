<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // <--- TAMBAHKAN BARIS INI

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
{
    $roles = ['superadmin', 'manager', 'isp', 'osp', 'aso', 'hai'];

    foreach ($roles as $role) {
        \App\Models\User::create([
            'name'     => "User " . strtoupper($role),
            'username' => $role, // Username sama dengan nama role agar gampang ingat
            'email'    => $role . "@gmail.com",
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role'     => $role,
        ]);
    }
}
}
