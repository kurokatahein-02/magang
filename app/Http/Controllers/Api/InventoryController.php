<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    // Ambil semua data (bisa difilter berdasarkan unit/kategori)
    public function index(Request $request)
    {
        $query = Inventory::query();

        // Fitur Filter (OSP, ISP, ASO, HI)
        if ($request->has('unit') && $request->unit != 'ALL') {
            $query->where('unit', $request->unit);
        }

        // Fitur Search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama_barang', 'like', '%' . $searchTerm . '%')
                ->orWhere('jumlah_barang', 'like', '%' . $searchTerm . '%')
                ->orWhere('unit', 'like', '%' . $searchTerm . '%')
                ->orWhere('lokasi', 'like', '%' . $searchTerm . '%');
            });
        }
        $data = $query->latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_barang'   => 'required|string',
            'jumlah_barang' => 'required|string',
            'unit'          => 'required|in:OSP,ISP,ASO,HAI',
            'lokasi'        => 'required|string',
        ]);

        $inventory = Inventory::create($request->all());

        return response()->json(['success' => true, 'data' => $inventory], 201);
    }

    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->update($request->all());

        return response()->json(['success' => true, 'data' => $inventory]);
    }

    public function destroy($id)
    {
        Inventory::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Barang berhasil dihapus']);
    }

    public function export(Request $request)
    {
        // 1. Ambil data dengan logika yang sama seperti index (Filter & Search)
        $query = Inventory::query();

        if ($request->has('unit') && $request->unit != 'ALL') {
            $query->where('unit', $request->unit);
        }

        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama_barang', 'like', '%' . $searchTerm . '%')
                ->orWhere('jumlah_barang', 'like', '%' . $searchTerm . '%')
                ->orWhere('unit', 'like', '%' . $searchTerm . '%')
                ->orWhere('lokasi', 'like', '%' . $searchTerm . '%');
            });
        }

        $data = $query->latest()->get();

        // 2. Setup Header untuk file CSV
        $fileName = 'Inventory_Report_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // 3. Membuat isi file
        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            // Header Kolom di Excel
            fputcsv($file, ['ID', 'Nama Barang', 'Jumlah', 'Unit', 'Lokasi', 'Tanggal Input']);

            foreach ($data as $item) {
                fputcsv($file, [
                    $item->id,
                    $item->nama_barang,
                    $item->jumlah_barang,
                    $item->unit,
                    $item->lokasi,
                    $item->created_at->format('Y-m-d')
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}