<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kegiatan');
            // Menggunakan enum untuk membatasi input unit sesuai permintaan
            $table->enum('unit', ['osp', 'isp', 'aso', 'hai']);
            $table->date('tanggal_mulai');
            $table->date('tanggal_berakhir')->nullable(); // Dibuat nullable jika belum ditentukan saat input awal
            $table->string('status');
            $table->timestamps(); // Membuat created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};