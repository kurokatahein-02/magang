<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Activity;
use App\Models\ThirdParty;
use App\Models\LaporanSitac;
use App\Models\Inventory;
use App\Models\InventoryHistory;
use Carbon\Carbon;
use App\Models\OltDevice; //

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $now = Carbon::now();
        // Ambil dari request atau gunakan bulan/tahun sekarang jika kosong
        $currentMonth = $request->input('month', $now->month);
        $currentYear = $request->input('year', $now->year);

        // Pastikan variabel $now disesuaikan untuk label periode di bawah
        $displayDate = Carbon::createFromDate($currentYear, $currentMonth, 1);

        // 2. Hitung Total Data (Hanya Bulan Ini & Berdasarkan tanggal_mulai)
        $totalKegiatan = Activity::whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();
        $totalP3 = ThirdParty::whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();
        $totalSitac = LaporanSitac::whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();

        $grandTotal = $totalKegiatan + $totalP3 + $totalSitac;

        // 3. Hitung Status "Open" (Hanya Bulan Ini)
        $openKegiatan = Activity::where('status', 'Open')
            ->whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();
        $openP3 = ThirdParty::where('status', 'Open')
            ->whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();
        $openSitac = LaporanSitac::where('status', 'Open')
            ->whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();

        $grandOpen = $openKegiatan + $openP3 + $openSitac;

        // 4. Hitung Status "Close" (Hanya Bulan Ini)
        $closeKegiatan = Activity::where('status', 'Close')
            ->whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();
        $closeP3 = ThirdParty::where('status', 'Close')
            ->whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();
        $closeSitac = LaporanSitac::where('status', 'Close')
            ->whereMonth('tanggal_mulai', $currentMonth)
            ->whereYear('tanggal_mulai', $currentYear)->count();

        $grandClose = $closeKegiatan + $closeP3 + $closeSitac;

        // 5. Kalkulasi Persentase & Progres
        $percentOpen = $grandTotal > 0 ? round(($grandOpen / $grandTotal) * 100) : 0;
        $percentClose = $grandTotal > 0 ? round(($grandClose / $grandTotal) * 100) : 0;
        $overallProgress = $percentClose;

        // 6. Unit Progress Logic (Donut Charts - Filter Bulan Ini)
        $units = ['OSP', 'ISP', 'ASO', 'HAI'];
        $unitStats = [];

        foreach ($units as $unit) {
            // Ambil query dasar per unit
            $queryUnit = Activity::where('unit', $unit)
                ->whereMonth('tanggal_mulai', $currentMonth)
                ->whereYear('tanggal_mulai', $currentYear);

            $totalUnit = 0;
            $openUnit = 0;
            $closeUnit = 0;

            // B. Tambahan Logika Khusus per Unit
            if ($unit === 'OSP') {
                // Tambahkan data dari ThirdParty (Pihak Ketiga) untuk OSP
                $queryP3 = ThirdParty::whereMonth('tanggal_mulai', $currentMonth)
                    ->whereYear('tanggal_mulai', $currentYear);

                $totalUnit += (clone $queryP3)->count();
                $openUnit  += (clone $queryP3)->where('status', 'Open')->count();
                $closeUnit += (clone $queryP3)->where('status', 'Close')->count();
            } elseif ($unit === 'HAI') {
                // Tambahkan data dari LaporanSitac untuk HAI
                $querySitac = LaporanSitac::whereMonth('tanggal_mulai', $currentMonth)
                    ->whereYear('tanggal_mulai', $currentYear);

                $totalUnit += (clone $querySitac)->count();
                $openUnit  += (clone $querySitac)->where('status', 'Open')->count();
                $closeUnit += (clone $querySitac)->where('status', 'Close')->count();
            }

            $totalUnit = (clone $queryUnit)->count();
            $openUnit  = (clone $queryUnit)->where('status', 'Open')->count();
            $closeUnit = (clone $queryUnit)->where('status', 'Close')->count();


            $unitStats[$unit] = [
                'open_percent'  => $totalUnit > 0 ? round(($openUnit / $totalUnit) * 100) : 0,
                'close_percent' => $totalUnit > 0 ? round(($closeUnit / $totalUnit) * 100) : 0,
                'open_count'    => $openUnit,
                'close_count'   => $closeUnit,
                'total_count'   => $totalUnit // Tambahkan ini agar frontend lebih mudah
            ];
        }

        // 7. Alerts, Markers, dan Recent Documents (Tetap ditampilkan tanpa filter bulan ini agar data penting tidak terlewat)

        // 7. Alerts Logic (Kegiatan Belum Close & SITAC Expiring)
        // Batas "Jangka Waktu Sebulan": Ambil tanggal 1 di bulan berjalan sebagai batas tunggakan.
        $startOfCurrentMonth = Carbon::now()->startOfMonth()->format('Y-m-d');

        // Alert Kegiatan: Status Open dan Tanggal Mulai < Awal Bulan Sekarang (Berarti berasal dari bulan sebelumnya)
        $alertKegiatanQuery = Activity::where('status', 'Open')
            ->whereDate('tanggal_mulai', '<', $startOfCurrentMonth);

        // Jika dashboard unit menyertakan param 'unit', filter alert hanya untuk unit tersebut
        if ($request->filled('unit') && $request->unit !== 'ALL') {
            $alertKegiatanQuery->where('unit', strtolower($request->unit));
        }
        $alertKegiatan = $alertKegiatanQuery->get();

        $threeMonthsFromNow = Carbon::now()->addMonths(3)->format('Y-m-d');
        $alertSitacQuery = LaporanSitac::where('status', 'Open')
            ->whereNotNull('tanggal_berakhir')
            ->whereDate('tanggal_berakhir', '<=', $threeMonthsFromNow);

        // Alert SITAC hanya relevan untuk unit HAI
        if ($request->filled('unit') && $request->unit !== 'ALL' && strtoupper($request->unit) !== 'HAI') {
            $alertSitac = collect();
        } else {
            $alertSitac = $alertSitacQuery->get();
        }

        // Alert OLT: Perangkat dengan status baterai 'Bad'
        $queryOlt = OltDevice::where('status_baterai', 'Bad');

        // Alert OLT hanya relevan untuk unit ISP
        if ($request->filled('unit') && $request->unit !== 'ALL' && strtoupper($request->unit) !== 'ISP') {
            $alertOlt = collect();
        } else {
            $alertOlt = $queryOlt->get()->map(fn($item) => [
                'id'             => $item->id,
                'nama_olt'       => $item->nama_perangkat,
                'lokasi'         => $item->lokasi,
                'battery_status' => $item->status_baterai,
                'status'         => 'URGENT',
            ]);
        }

        // Markers Logic - Sesuaikan markers dengan unit yang merequest
        $targetUnit = $request->filled('unit') ? strtoupper($request->unit) : 'ALL';
        $sitacMarkers = ($targetUnit === 'ALL' || $targetUnit === 'HAI') 
            ? LaporanSitac::select('id', 'nama_vendor', 'lokasi', 'latitude', 'longitude')->get() 
            : collect();
        
        $p3Markers = ($targetUnit === 'ALL' || $targetUnit === 'OSP') 
            ? ThirdParty::select('id', 'nama_vendor', 'lokasi', 'latitude', 'longitude')->get() 
            : collect();
            
        $oltMarkers = ($targetUnit === 'ALL' || $targetUnit === 'ISP') 
            ? OltDevice::select('id', 'nama_perangkat', 'lokasi', 'latitude', 'longitude', 'status_baterai')->get() 
            : collect();

        $docs = collect();
        if ($targetUnit === 'ALL' || $targetUnit === 'HAI') {
            $docs = $docs->concat(LaporanSitac::whereNotNull('dokumen')->latest()->take(5)->get()->map(fn($i) => ['name' => $i->nama_vendor, 'file' => asset('storage/' . $i->dokumen)]));
        }
        if ($targetUnit === 'ALL' || $targetUnit === 'OSP') {
            $docs = $docs->concat(ThirdParty::whereNotNull('dokumen')->latest()->take(5)->get()->map(fn($i) => ['name' => $i->nama_vendor, 'file' => asset('storage/' . $i->dokumen)]));
        }

        // Filter Histori Inventory berdasarkan Unit
        $inventoryHistoryQuery = InventoryHistory::latest();
        if ($request->filled('unit') && $request->unit !== 'ALL') {
            $inventoryHistoryQuery->where('unit', $request->unit);
        }
        $inventoryHistory = $inventoryHistoryQuery->take(5)->get();

        // 8. Kirim Respon JSON
        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total'       => $grandTotal,
                    'open_count'  => $grandOpen,
                    'close_count' => $grandClose,
                    'open'        => $percentOpen . '%',
                    'close'       => $percentClose . '%',
                    'progress'    => $overallProgress . '%',
                    'periode'     => $displayDate->translatedFormat('F Y'), // Label tetap mengikuti pilihan
                ],
                'unitStats'      => $unitStats,
                'alerts'         => [
                    'sitac' => $alertSitac,
                    'kegiatan' => $alertKegiatan,
                    'olt'      => $alertOlt,
                ],
                'markers'        => [
                    'sitac' => $sitacMarkers,
                    'p3'    => $p3Markers,
                    'olt'   => $oltMarkers,
                ],
                'recentDocs'     => $docs->sortByDesc('created_at')->take(10),
                'inventoryCount' => Inventory::count(),
                'inventoryHistory' => $inventoryHistory,
            ],
        ]);
    }
}
