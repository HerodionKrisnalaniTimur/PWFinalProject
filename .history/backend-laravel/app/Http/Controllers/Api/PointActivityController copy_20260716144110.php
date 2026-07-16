<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PointActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PointActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     * Filter by wallet_address or user_id.
     */
    public function index(Request $request)
    {
        $query = PointActivity::query();

        if ($request->has('wallet_address')) {
            $query->where('wallet_address', $request->wallet_address);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $query->latest();

        if ($request->has('limit')) {
            $activities = $query->limit($request->limit)->get();
        } else {
            $activities = $query->paginate(10);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat aktivitas poin',
            'data'    => $activities,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * Sekarang wallet_address WAJIB dikirim, dan setiap aktivitas
     * langsung mengubah kolom users.points (sumber kebenaran saldo poin).
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'activity_type'  => 'required|string',
                'description'    => 'required|string',
                'points'         => 'required|integer',
                'wallet_address' => 'required|string',
                'user_id'        => 'nullable|exists:users,id',
                'chain'          => 'nullable|string',
            ]);

            $result = DB::transaction(function () use ($validated) {
                $walletAddress = $validated['wallet_address'];
                $userId = $validated['user_id'] ?? null;

                // Cari user berdasarkan user_id kalau ada, kalau tidak cari/buat berdasarkan wallet_address
                if ($userId) {
                    $user = User::find($userId);
                } else {
                    $user = User::firstOrCreate(
                        ['wallet_address' => $walletAddress],
                        [
                            'name'     => 'User ' . substr($walletAddress, 0, 6),
                            // Email harus unik & tidak null di tabel users bawaan Laravel,
                            // jadi kita generate placeholder unik dari wallet address.
                            'email'    => strtolower($walletAddress) . '@wallet.local',
                            'password' => Hash::make(Str::random(32)),
                            'points'   => 0,
                        ]
                    );
                }

                // Kalau user ditemukan lewat user_id tapi belum punya wallet_address tersimpan, sinkronkan
                if ($user && !$user->wallet_address) {
                    $user->wallet_address = $walletAddress;
                    $user->save();
                }

                $activity = PointActivity::create([
                    'user_id'        => $user?->id,
                    'wallet_address' => $walletAddress,
                    'activity_type'  => $validated['activity_type'],
                    'description'    => $validated['description'],
                    'points'         => $validated['points'],
                    'chain'          => $validated['chain'] ?? null,
                ]);

                // Update saldo poin user. increment() bisa terima nilai negatif untuk redeem/pengurangan.
                if ($user) {
                    $user->increment('points', $validated['points']);
                    $user->refresh();
                }

                return [
                    'activity'     => $activity,
                    'total_points' => $user?->points ?? 0,
                ];
            });

            return response()->json([
                'success'      => true,
                'message'      => 'Aktivitas poin berhasil dicatat!',
                'data'         => $result['activity'],
                'total_points' => $result['total_points'],
            ], 201);

        } catch (ValidationException $e) {
            // Data yang dikirim frontend tidak valid (422, bukan 500)
            return response()->json([
                'success' => false,
                'message' => 'Data tidak valid.',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            // Catat error asli ke storage/logs/laravel.log biar mudah dilacak
            Log::error('Gagal menyimpan point activity: ' . $e->getMessage(), [
                'exception' => $e,
                'payload'   => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan aktivitas poin.',
                // Hapus baris 'debug' ini kalau sudah production & sudah beres
                'debug'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mengambil total poin (saldo resmi) milik satu wallet address.
     * Ini yang dipakai frontend sebagai sumber kebenaran saldo poin,
     * bukan hasil hitung manual dari daftar riwayat aktivitas.
     */
    public function pointsByWallet(string $wallet)
    {
        $user = User::where('wallet_address', $wallet)->first();

        return response()->json([
            'success'        => true,
            'wallet_address' => $wallet,
            'points'         => $user->points ?? 0,
        ], 200);
    }
}