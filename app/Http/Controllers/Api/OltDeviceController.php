<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OltDevice;
use Illuminate\Http\Request;

class OltDeviceController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => OltDevice::all()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_perangkat' => 'required',
            'lokasi' => 'required',
            'latitude' => 'required',
            'longitude' => 'required',
            'status_baterai' => 'required|in:Good,Average,Bad'
        ]);
        $olt = OltDevice::create($data);
        return response()->json(['success' => true, 'data' => $olt]);
    }

    public function update(Request $request, $id)
    {
        $olt = OltDevice::findOrFail($id);
        $olt->update($request->all());
        return response()->json(['success' => true, 'data' => $olt]);
    }

    public function destroy($id)
    {
        OltDevice::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function updateBatteryStatus(Request $request, $id)
    {
        // Validasi input
        $request->validate([
            'status_baterai' => 'required|in:Good,Average,Bad'
        ]);

        $olt = OltDevice::findOrFail($id);
        $olt->status_baterai = $request->status_baterai;
        $olt->save();

        return response()->json([
            'success' => true,
            'message' => 'Status baterai berhasil diperbarui',
            'data' => $olt
        ]);
    }
}
