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
}
