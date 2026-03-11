<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_sitacs', function (Blueprint $create) {
            $create->id();
            $create->string('nama_vendor');
            $create->string('lokasi');
            $create->decimal('latitude', 10, 8)->nullable();
            $create->decimal('longitude', 11, 8)->nullable();
            $create->date('tanggal_mulai');
            $create->date('tanggal_berakhir')->nullable();
            $create->string('dokumen')->nullable(); // Untuk path file PDF
            $create->enum('status', ['Open', 'Close'])->default('Open');
            $create->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_sitacs');
    }
};