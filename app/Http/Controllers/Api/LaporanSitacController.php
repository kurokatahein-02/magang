<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanSitac;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LaporanSitacController extends Controller
{
    public function index()
    {
        $data = LaporanSitac::all()->map(function ($item) {
            $item->dokumen_url = $item->dokumen ? asset('storage/' . $item->dokumen) : null;
            return $item;
        });
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_vendor' => 'required|string',
            'lokasi' => 'required|string',
            'tanggal_mulai' => 'required|date',
            'dokumen' => 'nullable|mimes:pdf|max:5120',
        ]);

        $path = $request->hasFile('dokumen') 
            ? $request->file('dokumen')->store('documents/sitac', 'public') 
            : null;

        $sitac = LaporanSitac::create([
            'nama_vendor' => $request->nama_vendor,
            'lokasi' => $request->lokasi,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_berakhir' => $request->tanggal_berakhir,
            'status' => 'Open',
            'dokumen' => $path,
        ]);

        return response()->json(['success' => true, 'data' => $sitac], 201);
    }

    public function update(Request $request, $id)
    {
        $sitac = LaporanSitac::findOrFail($id);
        $data = $request->all();

        if ($request->hasFile('dokumen')) {
            if ($sitac->dokumen) Storage::disk('public')->delete($sitac->dokumen);
            $data['dokumen'] = $request->file('dokumen')->store('documents/sitac', 'public');
        }

        $sitac->update($data);
        return response()->json(['success' => true, 'data' => $sitac]);
    }

    public function updateStatus($id)
    {
        $sitac = LaporanSitac::findOrFail($id);

        // Hanya mengubah status: jika Open jadi Close, jika Close jadi Open
        if ($sitac->status === 'Open') {
            $sitac->status = 'Close';
        } else {
            $sitac->status = 'Open';
        }

        // Simpan perubahan tanpa mengubah tanggal_berakhir
        $sitac->save();

        return response()->json([
            'success' => true, 
            'message' => 'Status berhasil diperbarui',
            'data' => $sitac
        ]);
    }

    public function destroy($id)
    {
        $sitac = LaporanSitac::findOrFail($id);
        if ($sitac->dokumen) Storage::disk('public')->delete($sitac->dokumen);
        $sitac->delete();

        return response()->json(['success' => true, 'message' => 'Data SITAC dihapus']);
    }
}