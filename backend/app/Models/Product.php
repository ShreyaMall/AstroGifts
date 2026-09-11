<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'category_slug',
        'category_name',
        'name',
        'slug',
        'price',
        'old_price',
        'rating',
        'badge',
        'badge_type',
        'brand',
        'material',
        'color',
        'colors',
        'image',
        'description',
        'stock',
        'sku',
        'is_featured',
        'is_bestseller',
        'is_active',
        'is_new',
        'discount_percentage',
    ];

    protected $casts = [
        'price' => 'float',
        'old_price' => 'float',
        'rating' => 'float',
        'colors' => 'array',
        'stock' => 'integer',
        'is_featured' => 'boolean',
        'is_bestseller' => 'boolean',
        'is_active' => 'boolean',
        'is_new' => 'boolean',
        'discount_percentage' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
