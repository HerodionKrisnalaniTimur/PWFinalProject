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

    public function redeem($id)
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

        $reward->is_redeemed = true;
        $reward->save();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil me-redeem reward.',
            'data' => $reward
        ]);
    }
}
