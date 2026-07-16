<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * List semua user (tanpa password & remember_token, sudah otomatis
     * disembunyikan lewat #[Hidden] di model User).
     */
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'wallet_address', 'is_admin', 'created_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Ubah status admin seorang user (jadikan admin / cabut akses admin).
     */
    public function updateRole(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'is_admin' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $superAdminWallet = strtolower((string) env('ADMIN_WALLET_ADDRESS'));
        $currentWallet = strtolower((string) $request->header('X-Wallet-Address'));

        // Cuma super-admin (wallet dari .env) yang boleh mengubah role
        // admin/user lain. Admin hasil promote tidak boleh menjadikan
        // atau mencabut admin siapa pun, termasuk dirinya sendiri.
        if ($currentWallet !== $superAdminWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin utama yang bisa mengubah role admin',
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
            ], 404);
        }

        // Admin utama (dari .env) gak boleh dicabut aksesnya lewat sini,
        // biar sistem selalu punya minimal 1 admin yang gak bisa terkunci.
        if (
            $user->wallet_address &&
            strtolower($user->wallet_address) === $superAdminWallet &&
            !$request->boolean('is_admin')
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Admin utama tidak bisa dicabut aksesnya',
            ], 403);
        }

        try {
            $user->is_admin = $request->boolean('is_admin');
            $user->save();

            return response()->json([
                'success' => true,
                'message' => $user->is_admin
                    ? 'User berhasil dijadikan admin'
                    : 'Akses admin berhasil dicabut',
                'data' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah role: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hapus user.
     */
    public function destroy(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
            ], 404);
        }

        $currentWallet = strtolower((string) $request->header('X-Wallet-Address'));
        $superAdminWallet = strtolower((string) env('ADMIN_WALLET_ADDRESS'));

        // Admin utama gak boleh dihapus
        if ($user->wallet_address && strtolower($user->wallet_address) === $superAdminWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Admin utama tidak bisa dihapus',
            ], 403);
        }

        // Admin hasil promote gak boleh hapus admin lain (termasuk sesama
        // admin hasil promote) — hanya super-admin yang boleh.
        if ($user->is_admin && $currentWallet !== $superAdminWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin utama yang bisa menghapus admin lain',
            ], 403);
        }

        // Gak bisa hapus akun sendiri
        if ($user->wallet_address && strtolower($user->wallet_address) === $currentWallet) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus akun sendiri',
            ], 403);
        }

        try {
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus user: ' . $e->getMessage(),
            ], 500);
        }
    }
}