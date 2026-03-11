<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThirdParty extends Model
{
    use HasFactory;

    protected $table = 'third_parties';

    // PASTIKAN SEMUA KOLOM INI ADA
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