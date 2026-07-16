<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminConfigController extends Controller
{
    /**
     * Get admin wallet address dari .env
     * (dipertahankan untuk kompatibilitas / super-admin fallback)
     */
    public function getAdminWallet()
    {
        $adminWallet = env('ADMIN_WALLET_ADDRESS');
        
        if (!$adminWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Admin wallet not configured'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'admin_wallet' => $adminWallet
        ]);
    }

    /**
     * Cek status admin berdasarkan wallet address.
     * Sumber utama: kolom is_admin di tabel users.
     * Wallet super-admin di .env tetap dianggap admin walau
     * belum/tidak punya row di tabel users.
     */
    public function checkAdminStatus(string $wallet)
    {
        $wallet = strtolower($wallet);
        $superAdminWallet = strtolower((string) env('ADMIN_WALLET_ADDRESS', ''));

        if ($superAdminWallet && $wallet === $superAdminWallet) {
            return response()->json([
                'success' => true,
                'is_admin' => true,
                'is_super_admin' => true,
                'source' => 'env',
            ]);
        }

        $user = User::whereRaw('LOWER(wallet_address) = ?', [$wallet])->first();

        return response()->json([
            'success' => true,
            'is_admin' => (bool) ($user->is_admin ?? false),
            'is_super_admin' => false,
            'source' => 'database',
        ]);
    }
}