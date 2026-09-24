<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
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
        'size',
        'sizes',
        'image',
        'images',
        'description',
        'stock',
        'stock_by_color',
        'sku',
        'dimensions',
        'weight',
        'is_featured',
        'is_bestseller',
        'is_active',
        'status',
        'is_new',
        'discount_percentage',
        'features',
        'faqs',
        'trust_badges',
    ];

    protected $casts = [
        'price' => 'float',
        'old_price' => 'float',
        'rating' => 'float',
        'colors' => 'array',
        'images' => 'array',
        'stock_by_color' => 'array',
        'sizes' => 'array',
        'stock' => 'integer',
        'is_featured' => 'boolean',
        'is_bestseller' => 'boolean',
        'is_active' => 'boolean',
        'is_new' => 'boolean',
        'discount_percentage' => 'integer',
        'features' => 'array',
        'faqs' => 'array',
        'trust_badges' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
