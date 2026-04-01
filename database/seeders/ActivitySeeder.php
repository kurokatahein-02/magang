<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;
use Carbon\Carbon;
use Illuminate\Support\Arr;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = ['osp', 'isp', 'aso', 'hai'];
        $statuses = ['Open', 'Close'];
        $kegiatanNames = [
            'Maintenance Link', 'Perbaikan Kabel Putus', 'Instalasi Perangkat Baru',
            'Survei Lokasi SITAC', 'Audit Inventaris', 'Optimasi Jaringan',
            'Pengecekan Baterai OLT', 'Migrasi User', 'Penanganan Gangguan Massal',
            'Update Dokumentasi'
        ];

        for ($i = 1; $i <= 25; $i++) {
            $status = Arr::random($statuses);
            
            // Membuat tanggal random antara tahun 2023 sampai sekarang
            $startDate = Carbon::now()
                ->subYears(rand(0, 1)) // Mengacak tahun
                ->subMonths(rand(0, 11)) // Mengacak bulan
                ->subDays(rand(1, 28));  // Mengacak hari

            $endDate = ($status === 'Close') ? (clone $startDate)->addDays(rand(1, 7)) : null;

            Activity::create([
                'nama_kegiatan'   => Arr::random($kegiatanNames) . ' ' . $i,
                'unit'            => Arr::random($units),
                'tanggal_mulai'   => $startDate->format('Y-m-d'),
                'tanggal_berakhir' => $endDate ? $endDate->format('Y-m-d') : null,
                'status'          => $status,
            ]);
        }
    }
}
