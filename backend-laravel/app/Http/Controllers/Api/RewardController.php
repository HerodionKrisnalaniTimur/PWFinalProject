<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function index()
    {
        $rewards = Reward::orderBy('id', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $rewards
        ]);
    }

    public function redeem(Request $request, $id)
    {
        $reward = Reward::find($id);
        if (!$reward) {
            return response()->json([
                'success' => false,
                'message' => 'Reward tidak ditemukan.'
            ], 404);
        }

        if ($reward->is_redeemed) {
            return response()->json([
                'success' => false,
                'message' => 'Reward ini sudah habis terjual / sudah di-redeem.'
            ], 400);
        }

        $walletAddress = $request->input('wallet_address');
        if (!$walletAddress) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet address diperlukan untuk melakukan redeem.'
            ], 400);
        }

        $user = \App\Models\User::where('wallet_address', $walletAddress)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User dengan wallet address tersebut tidak ditemukan.'
            ], 404);
        }

        // Catat ke tabel redeem_histories
        \App\Models\RedeemHistory::create([
            'user_id' => $user->id,
            'reward_id' => $reward->id,
            'points_spent' => $reward->price,
            'status' => 'completed',
        ]);

        $reward->is_redeemed = true;
        $reward->save();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil me-redeem reward.',
            'data' => $reward
        ]);
    }
}
