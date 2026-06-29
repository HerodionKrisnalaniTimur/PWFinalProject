<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_address',
        'activity_type',
        'description',
        'points',
        'chain',
    ];

    /**
     * Get the user that owns the point activity.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
