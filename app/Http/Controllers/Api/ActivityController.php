<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;

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
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama_kegiatan', 'like', '%' . $searchTerm . '%')
                ->orWhere('unit', 'like', '%' . $searchTerm . '%')
                ->orWhere('status', 'like', '%' . $searchTerm . '%');
            });
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
            'tanggal_berakhir'=> $request->tanggal_berakhir, // opsional
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
        $query = Activity::query(); // Pastikan nama Model sesuai (Activity/Kegiatan)

        // 1. Terapkan Filter Unit yang sama dengan fungsi index
        if ($request->has('unit') && $request->unit != 'ALL') {
            $query->where('unit', $request->unit);
        }

        // 2. Terapkan Search yang sama dengan fungsi index
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama_kegiatan', 'like', '%' . $searchTerm . '%')
                ->orWhere('unit', 'like', '%' . $searchTerm . '%')
                ->orWhere('status', 'like', '%' . $searchTerm . '%');
            });
        }

        $data = $query->latest()->get();

        // 3. Konfigurasi CSV
        $fileName = 'Laporan_Kegiatan_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            // Header Kolom Excel
            fputcsv($file, ['ID', 'Nama Kegiatan', 'Unit', 'Tanggal Mulai', 'Tanggal Berakhir', 'Status']);

            foreach ($data as $item) {
                fputcsv($file, [
                    $item->id,
                    $item->nama_kegiatan,
                    $item->unit,
                    $item->tanggal_mulai,
                    $item->tanggal_berakhir ?? '-',
                    $item->status
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}   