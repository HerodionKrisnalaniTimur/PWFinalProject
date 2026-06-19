<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    // Fungsi untuk menampilkan semua daftar artikel
    public function index()
    {
        $articles = Article::latest()->get(); // Mengambil data urut dari yang paling baru
        return response()->json([
            'success' => true,
            'message' => 'Daftar Artikel',
            'data'    => $articles
        ], 200);
    }

    // Fungsi untuk menyimpan artikel baru dari form
    public function store(Request $request)
    {
        // Validasi inputan agar tidak ada yang kosong
        $request->validate([
            'title'   => 'required',
            'slug'    => 'required|unique:articles',
            'content' => 'required',
        ]);

        // Proses simpan ke database
        $article = Article::create([
            'title'   => $request->title,
            'slug'    => $request->slug,
            'content' => $request->content,
            'image'   => $request->image, // Ini opsional, dikosongkan tidak apa-apa
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Artikel Berhasil Dibuat!',
            'data'    => $article
        ], 201);
    }
}