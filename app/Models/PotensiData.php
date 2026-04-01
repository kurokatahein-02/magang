<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PotensiData extends Model {
    use HasFactory;

    protected $table = 'potensi_data';

    protected $fillable = [
        'nama_alpro', 'lokasi', 'tahun_pembuatan', 'tahun_operasi',
        'jumlah', 'kapasitas_total', 'kapasitas_terpakai', 'status'
    ];
}