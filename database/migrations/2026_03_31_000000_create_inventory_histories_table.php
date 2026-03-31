<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventory_id');
            $table->string('nama_barang');
            $table->integer('jumlah');
            $table->string('unit'); // Unit yang mengambil barang
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('inventory_id')->references('id')->on('inventories')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_histories');
    }
};
