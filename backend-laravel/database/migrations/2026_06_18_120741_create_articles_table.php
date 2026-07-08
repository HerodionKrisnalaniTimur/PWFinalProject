<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Kolom untuk judul artikel
            $table->string('slug')->unique(); // Kolom untuk URL ramah SEO
            $table->text('content'); // Kolom untuk isi artikel yang panjang
            $table->string('image')->nullable(); // Kolom gambar (nullable artinya boleh kosong)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};