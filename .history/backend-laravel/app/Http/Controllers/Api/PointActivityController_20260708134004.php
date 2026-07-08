<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PointActivity;
use App\Models\User;
use Illuminate\Http\Request;

class PointActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     * Filter by wallet_address or user_id.
     */
    public function index(Request $request)
    {
        $query = PointActivity::query();

        // Filter berdasarkan wallet address (Web3)
        if ($request->has('wallet_address')) {
            $query->where('wallet_address', $request->wallet_address);
        }

        // Filter berdasarkan user_id (jika menggunakan Auth Laravel)
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Ambil data terbaru
        $query->latest();

        // Dukungan limit (misal untuk recent widget di dashboard)
        if ($request->has('limit')) {
            $activities = $query->limit($request->limit)->get();
        } else {
            // Default gunakan pagination
            $activities = $query->paginate(10);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat aktivitas poin',
            'data'    => $activities
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'activity_type' => 'required|string',
            'description'   => 'required|string',
            'points'        => 'required|integer',
            'wallet_address'=> 'nullable|string',
            'user_id'       => 'nullable|exists:users,id',
            'chain'         => 'nullable|string',
        ]);

        // Tentukan user_id: pakai yang dikirim langsung kalau ada,
        // kalau tidak, cari/buatkan user otomatis dari wallet_address.
        $userId = $request->user_id;

        if (!$userId && $request->wallet_address) {
            $user = User::firstOrCreate(
                ['wallet_address' => $request->wallet_address],
                ['name' => 'User ' . substr($request->wallet_address, 0, 6)]
            );
            $userId = $user->id;
        }

        $activity = PointActivity::create([
            'user_id'        => $userId,
            'wallet_address' => $request->wallet_address,
            'activity_type'  => $request->activity_type,
            'description'    => $request->description,
            'points'         => $request->points,
            'chain'          => $request->chain,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Aktivitas poin berhasil dicatat!',
            'data'    => $activity
        ], 201);
    }
}