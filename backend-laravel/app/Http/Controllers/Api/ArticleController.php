<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // <-- Tambahkan ini untuk fitur hapus file fisik

class ArticleController extends Controller
{
    // 1. Fungsi INDEX (Menampilkan semua artikel)
    public function index()
    {
        $articles = Article::query()->latest()->get(); 
        return response()->json([
            'success' => true,
            'message' => 'Daftar Artikel',
            'data'    => $articles
        ], 200);
    }

    // 2. Fungsi STORE (Menyimpan artikel baru)
    public function store(Request $request)
    {
        // --- RADAR DETEKSI SEMENTARA ---
        if (!$request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'message' => 'RADAR: Laravel tidak mendeteksi ada file gambar yang masuk dari React!'
            ], 400);
        }
        $request->validate([
            'title'   => 'required',
            'slug'    => 'required|unique:articles',
            'content' => 'required',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048' 
        ]);

        $imageUrl = null;
        
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            // Tambahkan parameter 'public' di bagian paling belakang
            $image->storeAs('articles', $image->hashName(), 'public'); 
            $imageUrl = url('storage/articles/' . $image->hashName());
        }

        $article = Article::query()->create([
            'title'   => $request->title,
            'slug'    => $request->slug,
            'content' => $request->input('content'),
            'image'   => $imageUrl, 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Artikel Berhasil Dibuat!',
            'data'    => $article
        ], 201);
    }

    // 3. Fungsi SHOW (Menampilkan 1 detail artikel)
    public function show($id)
    {
        $article = Article::query()->find($id);

        if ($article) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Artikel',
                'data'    => $article
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Artikel Tidak Ditemukan!',
        ], 404);
    }

    // 4. Fungsi UPDATE (Mengubah artikel lama)
    public function update(Request $request, $id)
    {
        $article = Article::query()->find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel Tidak Ditemukan!',
            ], 404);
        }

        // Siapkan data teks yang akan diupdate
        $dataToUpdate = [
            'title'   => $request->title,
            'slug'    => $request->slug,
            'content' => $request->input('content'),
        ];

        // Jika user memilih gambar baru saat mengedit
        if ($request->hasFile('image')) {
            // Hapus gambar lama dari folder storage (jika sebelumnya punya gambar)
            if ($article->image) {
                // Mengekstrak nama file dari URL lengkap
                $oldImagePath = str_replace(url('storage') . '/', '', $article->image);
                Storage::disk('public')->delete($oldImagePath);
            }

            // Simpan gambar baru
            $image = $request->file('image');
            $image->storeAs('articles', $image->hashName(), 'public');
            
            // Masukkan URL gambar baru ke daftar data yang akan diupdate
            $dataToUpdate['image'] = url('storage/articles/' . $image->hashName());
        }

        // Proses update ke database
        $article->update($dataToUpdate);

        return response()->json([
            'success' => true,
            'message' => 'Artikel Berhasil Diperbarui!',
            'data'    => $article
        ], 200);
    }

    // 5. Fungsi DESTROY (Menghapus artikel)
    public function destroy($id)
    {
        $article = Article::query()->find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel Tidak Ditemukan!',
            ], 404);
        }

        // Hapus file fisik gambar dari folder storage sebelum menghapus data di database
        if ($article->image) {
            $oldImagePath = str_replace(url('storage') . '/', '', $article->image);
            Storage::disk('public')->delete($oldImagePath);
        }

        // Proses hapus data dari database
        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artikel Berhasil Dihapus!',
        ], 200);
    }
}