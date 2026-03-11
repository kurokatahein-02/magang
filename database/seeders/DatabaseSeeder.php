<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

       User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'admin_test', // Tambahkan ini agar tidak error
            'role' => 'superadmin',      // Tambahkan juga rolenya
        ]);

        // DAN PASTIKAN UserSeeder yang kita buat kemarin dipanggil di bawahnya:
        $this->call(UserSeeder::class);
    }
}
