<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    /**
     * Store a newly created article
     */
    public function store(Request $request)
    {
        // 1. Validasi data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Simpan ke database
        try {
            $article = Article::create([
                'title' => $request->title,
                'content' => $request->content,
                'category' => $request->category,
                'status' => 'published',
            ]);

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
            'category' => 'sometimes|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $article->update($request->all());

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