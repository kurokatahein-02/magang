<?php

namespace App\Exports;

use App\Models\Inventory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Http\Request;

class InventoryExport implements FromCollection, WithHeadings, WithMapping
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function collection()
    {
        $query = Inventory::query();

        if ($this->request->filled('unit') && $this->request->unit !== 'ALL') {
            $query->where('unit', $this->request->unit);
        }

        if ($this->request->filled('search')) {
            $query->where(function ($q) {
                $q->where('nama_barang', 'like', '%' . $this->request->search . '%')
                  ->orWhere('lokasi', 'like', '%' . $this->request->search . '%');
            });
        }

        return $query->latest()->get();
    }

    public function headings(): array
    {
        return ['ID', 'Nama Barang', 'Jumlah Stok', 'Unit', 'Lokasi', 'Tanggal Input'];
    }

    public function map($inventory): array
    {
        return [
            $inventory->id,
            $inventory->nama_barang,
            $inventory->jumlah_barang,
            $inventory->unit,
            $inventory->lokasi,
            $inventory->created_at->format('d/m/Y H:i'),
        ];
    }
}