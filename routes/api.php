<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OltDeviceController;
use App\Http\Controllers\Api\ThirdPartyController;
use App\Http\Controllers\Api\LaporanSitacController;
use App\Http\Controllers\Api\PotensiDataController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Must Login)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);



    // Activities
    Route::get('/activities/export', [ActivityController::class, 'export']); // Di atas {id}
    Route::patch('/activities/{id}/status', [ActivityController::class, 'updateStatus']);
    Route::apiResource('activities', ActivityController::class);

    // Inventories
    Route::get('/inventories/export', [InventoryController::class, 'export']);
    Route::get('/inventories/history', [InventoryController::class, 'history']);
    Route::get('/inventories/history/export', [InventoryController::class, 'exportHistory']);
    Route::post('/inventories/{id}/take', [InventoryController::class, 'take']);
    Route::apiResource('inventories', InventoryController::class);


    // Third Party
    Route::get('/third-parties/download/{id}', [ThirdPartyController::class, 'downloadFile']);
    Route::patch('/third-parties/{id}/status', [ThirdPartyController::class, 'updateStatus']);
    Route::apiResource('third-parties', ThirdPartyController::class);

    // Laporan SITAC
    Route::get('/laporan-sitacs/export', [LaporanSitacController::class, 'export']);
    Route::get('/laporan-sitacs/download/{id}', [LaporanSitacController::class, 'downloadFile']);
    Route::patch('/laporan-sitacs/{id}/status', [LaporanSitacController::class, 'updateStatus']);
    Route::apiResource('laporan-sitacs', LaporanSitacController::class);

    // OLT Devices
    Route::patch('/olt-devices/{id}/status-battery', [OltDeviceController::class, 'updateBatteryStatus']);
    Route::apiResource('olt-devices', OltDeviceController::class);

    // Potensi Data
    Route::apiResource('potensi-data', PotensiDataController::class);

    // User Management (Biasanya hanya Superadmin, tapi masuk ke grup proteksi dulu)
    Route::apiResource('users', UserController::class);
});
