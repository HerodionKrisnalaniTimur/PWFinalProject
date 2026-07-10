<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * Generate slug unik dari title.
     * Jika slug sudah ada, tambahkan -1, -2, dst.
     */
    private function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        $query = Article::where('slug', $slug);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;

            $query = Article::where('slug', $slug);
            if ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            }
        }

        return $slug;
    }

    /**
     * Upload file gambar ke storage/app/public/articles
     * dan kembalikan URL publik lengkapnya.
     */
    private function uploadImage($file): string
    {
        // Simpan ke disk "public", folder "articles"
        $path = $file->store('articles', 'public');

        // Hasilkan URL lengkap, contoh:
        // http://127.0.0.1:8000/storage/articles/namafile.jpg
        return asset(Storage::url($path));
    }

    /**
     * Store a newly created article
     */
    public function store(Request $request)
    {
        // 1. Validasi data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048', // max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Simpan ke database
        try {
            $data = [
                'title' => $request->title,
                'slug' => $this->generateUniqueSlug($request->title),
                'content' => $request->content,
            ];

            // Kalau ada file gambar yang diupload, proses dan simpan URL-nya
            if ($request->hasFile('image')) {
                $data['image'] = $this->uploadImage($request->file('image'));
            }

            $article = Article::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil dibuat',
                'data' => $article
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat artikel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified article
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->only(['title', 'content']);

            // Kalau title diubah, regenerate slug-nya juga
            if ($request->filled('title') && $request->title !== $article->title) {
                $data['slug'] = $this->generateUniqueSlug($request->title, $article->id);
            }

            // Kalau ada gambar baru diupload, ganti gambar lama
            if ($request->hasFile('image')) {
                // Hapus gambar lama dari storage kalau ada, biar tidak menumpuk file sampah
                if ($article->image) {
                    $oldPath = str_replace(asset('storage') . '/', '', $article->image);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                $data['image'] = $this->uploadImage($request->file('image'));
            }

            $article->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil diupdate',
                'data' => $article
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal update artikel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified article
     */
    public function destroy($id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan'
            ], 404);
        }

        try {
            // Hapus juga file gambarnya dari storage
            if ($article->image) {
                $path = str_replace(asset('storage') . '/', '', $article->image);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            $article->delete();

            return response()->json([
                'success' => true,
                'message' => 'Artikel berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus artikel: ' . $e->getMessage()
            ], 500);
        }
    }
}