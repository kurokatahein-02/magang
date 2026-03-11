<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaporanSitac extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_vendor',
        'lokasi',
        'latitude',
        'longitude',
        'tanggal_mulai',
        'tanggal_berakhir',
        'dokumen',
        'status',
    ];
}