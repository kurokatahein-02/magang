<?php

namespace App\Exports;

use App\Models\LaporanSitac;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanSitacExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    use Exportable;

    protected $rowNumber = 0;

    // Ambil semua data Laporan SITAC
    public function query()
    {
        return LaporanSitac::query()->latest();
    }

    // Header Kolom Excel
    public function headings(): array
    {
        return [
            'NO',
            'NAMA VENDOR / LAHAN',
            'LOKASI',
            'KOORDINAT (LAT, LNG)',
            'TANGGAL MULAI',
            'TANGGAL BERAKHIR',
            'STATUS'
        ];
    }

    // Mapping Data ke Kolom
    public function map($sitac): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            strtoupper($sitac->nama_vendor),
            strtoupper($sitac->lokasi),
            $sitac->latitude . ', ' . $sitac->longitude,
            $sitac->tanggal_mulai,
            $sitac->tanggal_berakhir ?? '-',
            strtoupper($sitac->status)
        ];
    }

    // Styling Header (Tebal)
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}