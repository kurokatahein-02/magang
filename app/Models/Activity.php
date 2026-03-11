<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    // Menentukan nama tabel (opsional jika nama tabel sudah 'activities')
    protected $table = 'activities';

    // Mass assignment: kolom yang boleh diisi secara massal
    protected $fillable = [
        'nama_kegiatan',
        'unit',
        'tanggal_mulai',
        'tanggal_berakhir',
        'status',
    ];
}