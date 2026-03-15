<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OltDevice extends Model
{
    protected $fillable = [
        'nama_perangkat',
        'lokasi',
        'latitude',
        'longitude',
        'status_baterai'
    ];
}
