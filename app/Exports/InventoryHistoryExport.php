<?php

namespace App\Exports;

use App\Models\InventoryHistory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class InventoryHistoryExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return InventoryHistory::latest()->get();
    }

    public function headings(): array
    {
        return ['ID', 'Nama Barang', 'Jumlah Diambil', 'Unit Pengambil', 'Tanggal Ambil'];
    }

    public function map($history): array
    {
        return [
            $history->id,
            $history->nama_barang,
            $history->jumlah,
            $history->unit,
            $history->created_at->format('d/m/Y H:i'),
        ];
    }
}