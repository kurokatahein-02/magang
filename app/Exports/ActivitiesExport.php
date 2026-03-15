<?php

namespace App\Exports;

use App\Models\Activity;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ActivitiesExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    use Exportable;

    protected $request;
    protected $rowNumber = 0;

    public function __construct($request)
    {
        $this->request = $request;
    }

    // 1. Logika Filter Data (Sama dengan di Controller)
    public function query()
    {
        $query = Activity::query();

        if ($this->request->unit && $this->request->unit != 'ALL') {
            $query->where('unit', $this->request->unit);
        }

        if ($this->request->month) {
            $query->whereMonth('tanggal_mulai', $this->request->month);
        }

        if ($this->request->year) {
            $query->whereYear('tanggal_mulai', $this->request->year);
        }

        return $query->latest();
    }

    // 2. Judul Kolom (Header)
    public function headings(): array
    {
        return [
            'NO',
            'NAMA KEGIATAN',
            'UNIT',
            'TANGGAL MULAI',
            'TANGGAL BERAKHIR',
            'STATUS'
        ];
    }

    // 3. Mapping Data (Format isi sel)
    public function map($activity): array
    {
        $this->rowNumber++;
        return [
            $this->rowNumber,
            strtoupper($activity->nama_kegiatan),
            strtoupper($activity->unit),
            $activity->tanggal_mulai,
            $activity->tanggal_berakhir ?? '-',
            strtoupper($activity->status)
        ];
    }

    // 4. Styling (Membuat Header Bold)
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]], // Baris 1 jadi tebal
        ];
    }
}