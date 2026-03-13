<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ThirdParty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ThirdPartyController extends Controller
{
    // 1. Ambil semua data untuk tabel
    public function index()
    {
        $data = ThirdParty::all()->map(function ($item) {
            // Menambahkan URL lengkap untuk file dokumen agar mudah dibuka di React
            $item->dokumen_url = $item->dokumen ? asset('storage/' . $item->dokumen) : null;
            return $item;
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    // 2. Simpan data baru (dengan Upload PDF)
    public function store(Request $request)
    {
        $request->validate([
            'nama_vendor'     => 'required|string',
            'lokasi'          => 'required|string',
            'tanggal_mulai'   => 'required|date',
            'tanggal_berakhir'=> 'nullable|date',
            'latitude'        => 'nullable|numeric',
            'longitude'       => 'nullable|numeric',
            'dokumen'         => 'required|mimes:pdf|max:5120', // Max 5MB
        ]);

        $path = $request->hasFile('dokumen') 
                ? $request->file('dokumen')->store('documents', 'public') 
                : null;

        $thirdParty = ThirdParty::create([
            'nama_vendor'     => $request->nama_vendor,
            'lokasi'          => $request->lokasi,
            'latitude'        => $request->latitude,
            'longitude'       => $request->longitude,
            'tanggal_mulai'   => $request->tanggal_mulai,
            'tanggal_berakhir'=> $request->tanggal_berakhir,
            'status'          => 'Open',
            'dokumen'         => $path,
        ]);

        return response()->json(['success' => true, 'data' => $thirdParty], 201);
    }

    // 3. Update data (termasuk ganti file PDF)
    public function update(Request $request, $id)
    {
        $thirdParty = ThirdParty::findOrFail($id);

        $request->validate([
            'nama_vendor' => 'string',
            'dokumen'     => 'nullable|mimes:pdf|max:5120',
        ]);

        $data = $request->all();

        if ($request->hasFile('dokumen')) {
            // Hapus file lama jika ada
            if ($thirdParty->dokumen) {
                Storage::disk('public')->delete($thirdParty->dokumen);
            }
            // Simpan file baru
            $data['dokumen'] = $request->file('dokumen')->store('documents', 'public');
        }

        $thirdParty->update($data);

        return response()->json(['success' => true, 'data' => $thirdParty]);
    }

    // 4. Toggle Status (Open/Close)
   public function updateStatus($id)
{
    $thirdParty = ThirdParty::findOrFail($id);

    // Logika murni: Jika Open jadi Close, jika Close jadi Open
    if ($thirdParty->status === 'Open') {
        $thirdParty->status = 'Close';
    } else {
        $thirdParty->status = 'Open';
    }

    // Simpan perubahan status saja
    $thirdParty->save();

    return response()->json([
        'success' => true,
        'message' => 'Status Berhasil Diperbarui!',
        'data'    => $thirdParty
    ]);
}

    // 5. Hapus data & file terkait
    public function destroy($id)
    {
        $thirdParty = ThirdParty::findOrFail($id);
        
        if ($thirdParty->dokumen) {
            Storage::disk('public')->delete($thirdParty->dokumen);
        }
        
        $thirdParty->delete();

        return response()->json(['success' => true, 'message' => 'Data berhasil dihapus']);
    }

    // Tambahkan di bagian atas controller jika belum ada

    public function downloadFile($id)
    {
        $thirdParty = ThirdParty::findOrFail($id);

        // Cek apakah data dokumen ada di database
        if (!$thirdParty->dokumen) {
            return response()->json(['success' => false, 'message' => 'Dokumen tidak terdaftar'], 404);
        }

        // Ambil path lengkap file di storage
        $path = storage_path('app/public/' . $thirdParty->dokumen);

        // Cek apakah file fisik benar-benar ada di folder
        if (!file_exists($path)) {
            return response()->json(['success' => false, 'message' => 'File fisik tidak ditemukan di server'], 404);
        }

        // Mengembalikan file sebagai download (Ini akan memicu Header CORS Laravel)
        return response()->download($path);
    }

    
}