<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ActivitiesExport;
class ActivityController extends Controller
{
    // Mengambil semua data untuk ditampilkan di tabel React
    public function index(Request $request)
    {
        $query = Activity::query(); // Sesuaikan nama Model Anda

        // 1. Filter berdasarkan Unit
        if ($request->has('unit') && $request->unit != 'ALL') {
            $query->where('unit', $request->unit);
        }

        // 2. Global Search (Nama, Unit, Status)
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nama_kegiatan', 'like', '%' . $searchTerm . '%')
                    ->orWhere('unit', 'like', '%' . $searchTerm . '%')
                    ->orWhere('status', 'like', '%' . $searchTerm . '%');
            });

            // 3. Filter berdasarkan Bulan
            if ($request->has('month') && $request->month != '') {
                $query->whereMonth('tanggal_mulai', $request->month);
            }

            // 4. Filter berdasarkan Tahun
            if ($request->has('year') && $request->year != '') {
                $query->whereYear('tanggal_mulai', $request->year);
            }
        }

        $data = $query->latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // Menyimpan data baru dari form React
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'nama_kegiatan'   => 'required|string',
            'unit'            => 'required|in:osp,isp,aso,hai',
            'tanggal_mulai'   => 'required|date',
            'status'          => 'required|string',
        ]);

        $activity = Activity::create([
            'nama_kegiatan'   => $request->nama_kegiatan,
            'unit'            => $request->unit,
            'tanggal_mulai'   => $request->tanggal_mulai,
            'tanggal_berakhir' => $request->tanggal_berakhir, // opsional
            'status'          => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil disimpan!',
            'data'    => $activity
        ], 201);
    }

    // Tambahkan ini di ActivityController.php

    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);
        $activity->update($request->all());
        return response()->json(['success' => true, 'data' => $activity]);
    }

    public function destroy($id)
    {
        Activity::destroy($id);
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }

    public function updateStatus($id)
    {
        $activity = Activity::findOrFail($id);

        if ($activity->status === 'Open') {
            // Jika Open diklik -> Berubah jadi Close
            $activity->status = 'Close';
            // Mengisi tanggal berakhir dengan tanggal hari ini
            $activity->tanggal_berakhir = now()->format('Y-m-d');
        } else {
            // Jika Close diklik -> Berubah jadi Open (Reset tanggal berakhir)
            $activity->status = 'Open';
            $activity->tanggal_berakhir = null;
        }

        $activity->save();

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui!',
            'data'    => $activity
        ]);
    }

    public function export(Request $request)
    {
        $unitLabel = strtoupper($request->unit ?? 'ALL');
        $fileName = 'Laporan_Kegiatan_' . $unitLabel . '_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new ActivitiesExport($request), $fileName);
    }
}
