<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminConfigController extends Controller
{
    /**
     * Get admin wallet address dari .env
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
}