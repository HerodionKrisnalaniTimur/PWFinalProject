<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyAdminWallet
{
    public function handle(Request $request, Closure $next)
    {
        // Ambil wallet dari header
        $wallet = $request->header('X-Wallet-Address');
        $adminWallet = env('ADMIN_WALLET_ADDRESS');

        // Cek apakah admin wallet sudah di-set
        if (!$adminWallet) {
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

        // Verifikasi wallet (case insensitive)
        if (strtolower($wallet) !== strtolower($adminWallet)) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet tidak memiliki akses admin'
            ], 403);
        }

        return $next($request);
    }
}