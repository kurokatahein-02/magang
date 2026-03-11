<?php

use App\Http\Controllers\Api\ActivityController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ThirdPartyController;
use App\Http\Controllers\Api\LaporanSitacController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;


Route::middleware(['auth:sanctum', 'RestrictManagerWrite'])->group(function () {
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
    // Route khusus untuk toggle status
    Route::patch('/activities/{id}/status', [ActivityController::class, 'updateStatus']);
    // Endpoint untuk Control Pihak Ketiga
    Route::get('/third-parties', [ThirdPartyController::class, 'index']);
    Route::post('/third-parties', [ThirdPartyController::class, 'store']);
    Route::put('/third-parties/{id}', [ThirdPartyController::class, 'update']);
    Route::patch('/third-parties/{id}/status', [ThirdPartyController::class, 'updateStatus']);
    Route::delete('/third-parties/{id}', [ThirdPartyController::class, 'destroy']);
    // Route untuk Laporan SITAC
    Route::get('/laporan-sitacs', [LaporanSitacController::class, 'index']);
    Route::post('/laporan-sitacs', [LaporanSitacController::class, 'store']);
    Route::put('/laporan-sitacs/{id}', [LaporanSitacController::class, 'update']);
    Route::patch('/laporan-sitacs/{id}/status', [LaporanSitacController::class, 'updateStatus']);
    Route::delete('/laporan-sitacs/{id}', [LaporanSitacController::class, 'destroy']);
    Route::get('/activities/export', [ActivityController::class, 'export']);
        
    // Dan semua route tulis/tambah lainnya
});


Route::get('/activities', [ActivityController::class, 'index']);
Route::post('/activities', [ActivityController::class, 'store']);
Route::put('/activities/{id}', [ActivityController::class, 'update']);
Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
// Route khusus untuk toggle status
Route::patch('/activities/{id}/status', [ActivityController::class, 'updateStatus']);
// Endpoint untuk Control Pihak Ketiga
Route::get('/third-parties', [ThirdPartyController::class, 'index']);
Route::post('/third-parties', [ThirdPartyController::class, 'store']);
Route::put('/third-parties/{id}', [ThirdPartyController::class, 'update']);
Route::patch('/third-parties/{id}/status', [ThirdPartyController::class, 'updateStatus']);
Route::delete('/third-parties/{id}', [ThirdPartyController::class, 'destroy']);
// Route untuk Laporan SITAC
Route::get('/laporan-sitacs', [LaporanSitacController::class, 'index']);
Route::post('/laporan-sitacs', [LaporanSitacController::class, 'store']);
Route::put('/laporan-sitacs/{id}', [LaporanSitacController::class, 'update']);
Route::patch('/laporan-sitacs/{id}/status', [LaporanSitacController::class, 'updateStatus']);
Route::delete('/laporan-sitacs/{id}', [LaporanSitacController::class, 'destroy']);
// Route untuk Inventory
Route::get('/inventories', [InventoryController::class, 'index']);
Route::post('/inventories', [InventoryController::class, 'store']);
Route::put('/inventories/{id}', [InventoryController::class, 'update']);
Route::delete('/inventories/{id}', [InventoryController::class, 'destroy']);
// Tambahkan baris ini (Pastikan diletakkan DI ATAS route inventories/{id} agar tidak bentrok)
Route::get('/inventories/export', [InventoryController::class, 'export']);
// Tambahkan baris ini di atas Route::get('/activities/{id}', ...)
Route::get('/activities/export', [ActivityController::class, 'export']);
Route::get('/dashboard', [App\Http\Controllers\Api\DashboardController::class, 'index']);

// Route Publik (Bisa diakses tanpa login)
Route::post('/login', [AuthController::class, 'login']);

// Route Terproteksi (Harus kirim Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Masukkan route dashboard/inventory bapak di sini nanti agar aman
});
