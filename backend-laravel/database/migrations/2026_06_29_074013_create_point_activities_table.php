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
        Schema::create('point_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('wallet_address')->nullable();
            $table->string('activity_type');
            $table->string('description');
            $table->integer('points');
            $table->string('chain')->nullable();
            $table->timestamps();

            // Indexing for faster retrieval
            $table->index(['user_id', 'created_at']);
            $table->index(['wallet_address', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_activities');
    }
};
