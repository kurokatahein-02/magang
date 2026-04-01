<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('potensi_data', function (Blueprint $table) {
            $table->id();
            $table->string('nama_alpro');
            $table->string('lokasi');
            $table->integer('tahun_pembuatan');
            $table->integer('tahun_operasi');
            $table->integer('jumlah');
            $table->integer('kapasitas_total');
            $table->integer('kapasitas_terpakai');
            $table->enum('status', ['idle', 'terpakai']);
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('potensi_data');
    }
};