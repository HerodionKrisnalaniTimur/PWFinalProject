<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\PointActivityController;
use App\Http\Controllers\AdminConfigController;
use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Admin\UserController as AdminUserController;

// ============================================
// PUBLIC ROUTES (Tanpa Verifikasi)
// ============================================

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public Article routes
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);

// Public Point Activity routes
Route::get('/point-activities', [PointActivityController::class, 'index']);
Route::get('/point-activities/{id}', [PointActivityController::class, 'show']);
Route::post('/point-activities', [PointActivityController::class, 'store']); // dipindah ke sini, tidak butuh login/token

// ============================================
// ADMIN ROUTES (Dengan Verifikasi Wallet)
// ============================================

Route::prefix('admin')->group(function () {
    
    // ENDPOINT 1: Get admin wallet (tanpa verifikasi)
    Route::get('/config/wallet', [AdminConfigController::class, 'getAdminWallet']);

    // ENDPOINT 1B: Cek status admin per wallet (baca dari database)
    Route::get('/config/check-admin/{wallet}', [AdminConfigController::class, 'checkAdminStatus']);
    
    // ENDPOINT 2: Admin Article Management (dengan verifikasi)
    Route::middleware(['admin.wallet'])->group(function () {
        Route::post('/articles', [AdminArticleController::class, 'store']);
        Route::put('/articles/{id}', [AdminArticleController::class, 'update']);
        Route::delete('/articles/{id}', [AdminArticleController::class, 'destroy']);

        // ENDPOINT 3: Admin User Management
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{id}/role', [AdminUserController::class, 'updateRole']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    });
});

// ============================================
// AUTHENTICATED ROUTES (Pakai Sanctum)
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/point-activities/{id}', [PointActivityController::class, 'update']);
    Route::delete('/point-activities/{id}', [PointActivityController::class, 'destroy']);
});