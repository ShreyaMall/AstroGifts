<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'status',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];
}
