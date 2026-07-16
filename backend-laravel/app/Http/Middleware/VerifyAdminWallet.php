<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class VerifyAdminWallet
{
    public function handle(Request $request, Closure $next)
    {
        // Ambil wallet dari header
        $wallet = $request->header('X-Wallet-Address');
        $superAdminWallet = env('ADMIN_WALLET_ADDRESS');

        // Cek apakah admin wallet utama sudah di-set
        if (!$superAdminWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Admin wallet belum dikonfigurasi'
            ], 500);
        }

        // Cek apakah wallet dikirim
        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet address diperlukan'
            ], 400);
        }

        // 1) Cek apakah wallet ini adalah super admin (dari .env)
        $isSuperAdmin = strtolower($wallet) === strtolower($superAdminWallet);

        // 2) Kalau bukan, cek apakah wallet ini terdaftar sebagai admin di database
        //    (user yang di-promote lewat fitur "Kelola User")
        $isDbAdmin = false;
        if (!$isSuperAdmin) {
            $isDbAdmin = User::whereRaw('LOWER(wallet_address) = ?', [strtolower($wallet)])
                ->where('is_admin', true)
                ->exists();
        }

        if (!$isSuperAdmin && !$isDbAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet tidak memiliki akses admin'
            ], 403);
        }

        return $next($request);
    }
}