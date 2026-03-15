<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InventoryExport;

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
            $query->where(function ($q) use ($searchTerm) {
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
        $unitLabel = strtoupper($request->unit ?? 'ALL');
        $fileName = 'Laporan_Inventory_' . $unitLabel . '_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new InventoryExport($request), $fileName);
    }
}
