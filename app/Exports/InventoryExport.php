<?php

namespace App\Exports;

use App\Models\Inventory;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    use Exportable;

    protected $request;
    protected $rowNumber = 0;

    public function __construct($request)
    {
        $this->request = $request;
    }

    // 1. Logika Filter Data (Sama dengan fungsi index di Controller)
    public function query()
    {
        $query = Inventory::query();

        if ($this->request->unit && $this->request->unit != 'ALL') {
            $query->where('unit', $this->request->unit);
        }

        if ($this->request->search) {
            $searchTerm = $this->request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama_barang', 'like', '%' . $searchTerm . '%')
                  ->orWhere('lokasi', 'like', '%' . $searchTerm . '%');
            });
        }

        return $query->latest();
    }

    // 2. Judul Kolom di Excel
    public function headings(): array
    {
        return [
            'NO',
            'NAMA BARANG',
            'JUMLAH',
            'UNIT',
            'LOKASI',
            'TANGGAL INPUT'
        ];
    }

    // 3. Mapping Data ke Baris Tabel
    public function map($inventory): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            strtoupper($inventory->nama_barang),
            $inventory->jumlah_barang,
            strtoupper($inventory->unit),
            strtoupper($inventory->lokasi),
            $inventory->created_at->format('Y-m-d')
        ];
    }

    // 4. Styling Header (Tebal)
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}