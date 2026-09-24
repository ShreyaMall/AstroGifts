<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Slider extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'price',
        'image',
        'cta_text',
        'link',
        'badge_text',
        'badge_category',
        'designer',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];
}
