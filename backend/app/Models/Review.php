<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'product_slug',
        'product_name',
        'product_image',
        'user_name',
        'user_email',
        'user_image',
        'image',
        'rating',
        'comment',
        'status',
        'created_at',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];
}
