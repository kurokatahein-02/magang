<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PotensiData;
use Illuminate\Http\Request;

class PotensiDataController extends Controller {
    public function index() {
        return response()->json(PotensiData::all());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nama_alpro' => 'required|string',
            'lokasi' => 'required|string',
            'tahun_pembuatan' => 'required|integer',
            'tahun_operasi' => 'required|integer',
            'jumlah' => 'required|integer',
            'kapasitas_total' => 'required|integer',
            'kapasitas_terpakai' => 'required|integer',
            'status' => 'required|in:idle,terpakai',
        ]);

        $data = PotensiData::create($validated);
        return response()->json($data, 201);
    }

    public function show($id) {
        return PotensiData::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $data = PotensiData::findOrFail($id);
        $data->update($request->all());
        return response()->json($data);
    }

    public function destroy($id) {
        $data = PotensiData::findOrFail($id);
        $data->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}