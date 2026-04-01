<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryHistory;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InventoryExport; // Pastikan class export ini dibuat jika ingin fitur download jalan
use App\Exports\InventoryHistoryExport;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::query();

        if ($request->filled('unit') && $request->unit !== 'ALL') {
            $query->where('unit', $request->unit);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_barang', 'like', '%' . $request->search . '%')
                  ->orWhere('lokasi', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required|string',
            'jumlah_barang' => 'required|numeric',
            'unit' => 'required|string',
            'lokasi' => 'nullable|string',
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
        $inventory = Inventory::findOrFail($id);
        $inventory->delete();
        return response()->json(['success' => true, 'message' => 'Data inventori berhasil dihapus']);
    }

    /**
     * Fitur Ambil Barang: Mengurangi stok dan mencatat ke tabel histori
     */
    public function take(Request $request, $id)
    {
        $request->validate([
            'jumlah' => 'required|numeric|min:1',
            'unit' => 'required|string', // Unit pengambil
        ]);

        $inventory = Inventory::findOrFail($id);

        // Validasi stok mencukupi
        if ($inventory->jumlah_barang < $request->jumlah) {
            return response()->json([
                'success' => false, 
                'message' => 'Stok tidak mencukupi untuk pengambilan sejumlah ' . $request->jumlah
            ], 400);
        }

        // Kurangi stok barang utama
        $inventory->decrement('jumlah_barang', $request->jumlah);

        // Simpan catatan ke histori
        InventoryHistory::create([
            'inventory_id' => $inventory->id,
            'nama_barang' => $inventory->nama_barang,
            'jumlah' => $request->jumlah,
            'unit' => $request->unit,
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Barang berhasil diambil.'
        ]);
    }

    public function history(Request $request)
    {
        $query = InventoryHistory::query();

        if ($request->filled('unit') && $request->unit !== 'ALL') {
            $query->where('unit', $request->unit);
        }

        return response()->json(['success' => true, 'data' => $query->latest()->get()]);
    }

    public function export(Request $request)
    {
        $fileName = 'Laporan_Inventori_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new InventoryExport($request), $fileName);
    }

    public function exportHistory()
    {
        $fileName = 'Histori_Pengambilan_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new InventoryHistoryExport, $fileName);
    }
}
