<?php

namespace App\Exports;

use App\Models\PotensiData;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PotensiDataExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    use Exportable;

    protected $rowNumber = 0;

    public function query()
    {
        // Mengambil data terbaru sama seperti ActivityExport
        return PotensiData::query()->latest();
    }

    public function headings(): array
    {
        return [
            'NO',
            'NAMA ALPRO',
            'LOKASI',
            'THN BUAT',
            'THN OPS',
            'JML',
            'KAP. TOTAL',
            'KAP. PAKAI',
            'STATUS'
        ];
    }

    public function map($item): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            strtoupper($item->nama_alpro),
            strtoupper($item->lokasi),
            $item->tahun_pembuatan,
            $item->tahun_operasi,
            $item->jumlah,
            $item->kapasitas_total,
            $item->kapasitas_terpakai,
            strtoupper($item->status),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]], // Membuat header menjadi tebal
        ];
    }
}