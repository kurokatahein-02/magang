<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Activity;
use App\Models\ThirdParty;
use App\Models\LaporanSitac;
use App\Models\Inventory;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Hitung Total Data dari Semua Tabel
        $totalKegiatan = Activity::count();
        $totalP3 = ThirdParty::count();
        $totalSitac = LaporanSitac::count();
        $grandTotal = $totalKegiatan + $totalP3 + $totalSitac;

        // 2. Hitung Semua yang Berstatus "Open"
        $openKegiatan = Activity::where('status', 'Open')->count();
        $openP3 = ThirdParty::where('status', 'Open')->count();
        $openSitac = LaporanSitac::where('status', 'Open')->count();
        $grandOpen = $openKegiatan + $openP3 + $openSitac;

        // 3. Hitung Semua yang Berstatus "Close"
        $closeKegiatan = Activity::where('status', 'Close')->count();
        $closeP3 = ThirdParty::where('status', 'Close')->count();
        $closeSitac = LaporanSitac::where('status', 'Close')->count();
        $grandClose = $closeKegiatan + $closeP3 + $closeSitac;

        // 4. Kalkulasi Persentase
        $percentOpen = $grandTotal > 0 ? round(($grandOpen / $grandTotal) * 100) : 0;
        $percentClose = $grandTotal > 0 ? round(($grandClose / $grandTotal) * 100) : 0;
        
        // Progres keseluruhan (biasanya Close dianggap sebagai tugas selesai)
        $overallProgress = $percentClose;

        // 2. Unit Progress Logic (Donut Charts)
        $units = ['OSP', 'ISP', 'ASO', 'HAI']; // Samakan dengan nama unit di DB
        $unitStats = [];

        foreach ($units as $unit) {
            $totalUnit = Activity::where('unit', $unit)->count();
            $openUnit = Activity::where('unit', $unit)->where('status', 'Open')->count();
            $closeUnit = Activity::where('unit', $unit)->where('status', 'Close')->count();
            
            $unitStats[$unit] = [
                'open_percent' => $totalUnit > 0 ? round(($openUnit / $totalUnit) * 100) : 0,
                'close_percent' => $totalUnit > 0 ? round(($closeUnit / $totalUnit) * 100) : 0,
                'open_count' => $openUnit,
                'close_count' => $closeUnit
            ];
        }
        // 3. Alerts Logic (Expiring in < 3 months)
        // Bagian Alerts di DashboardController.php
        // Di DashboardController.php
        $threeMonthsFromNow = Carbon::now()->addMonths(3)->format('Y-m-d');

        $alertSitac = LaporanSitac::where('status', 'Open')
            ->whereNotNull('tanggal_berakhir') // Pastikan tanggal ada isinya
            ->whereDate('tanggal_berakhir', '<=', $threeMonthsFromNow) // Gunakan whereDate agar presisi
            ->get();

        $alertP3 = ThirdParty::where('status', 'Open')
            ->whereNotNull('tanggal_berakhir')
            ->whereDate('tanggal_berakhir', '<=', $threeMonthsFromNow)
            ->get();

        // 4. Map Markers
        $sitacMarkers = LaporanSitac::select('id', 'nama_vendor', 'lokasi', 'latitude', 'longitude')->get();
        $p3Markers = ThirdParty::select('id', 'nama_vendor', 'lokasi', 'latitude', 'longitude')->get();

        // 5. Recent Documents (Gabungan dari SITAC dan P3)
        $docs = collect();
        $docs = $docs->concat(LaporanSitac::whereNotNull('dokumen')->latest()->take(5)->get()->map(fn($i) => ['name' => $i->nama_vendor, 'file' => asset('storage/'.$i->dokumen)]));
        $docs = $docs->concat(ThirdParty::whereNotNull('dokumen')->latest()->take(5)->get()->map(fn($i) => ['name' => $i->nama_vendor, 'file' => asset('storage/'.$i->dokumen)]));

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total'    => $grandTotal, 
                    'open_count'  => $grandOpen,   // TAMBAHKAN INI (Angka riil)
                    'close_count' => $grandClose, // TAMBAHKAN INI (Angka riil)
                    'open'     => $percentOpen . '%',
                    'close'    => $percentClose . '%',
                    'progress' => $overallProgress . '%',
                ],
                'unitStats'      => $unitStats,
                'alerts'         => [
                    'sitac' => $alertSitac,
                    'p3'    => $alertP3,
                ],
                'markers'        => [
                    'sitac' => $sitacMarkers,
                    'p3'    => $p3Markers,
                ],
                'recentDocs' => $docs->sortByDesc('created_at')->take(10), // Ambil 10 agar bisa di-scroll
                'inventoryCount' => Inventory::count(),
            ],
        ]);
    }
}