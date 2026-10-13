<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $price = (float) ($this->price ?? 0);
        $salePrice = ($this->sale_price !== null && $this->sale_price !== '') 
            ? (float) $this->sale_price 
            : $price;
        $stock = (int) ($this->stock ?? 0);

        return [
            'id' => (string) ($this->id ?? $this->_id),
            '_id' => (string) ($this->id ?? $this->_id),
            'name' => (string) ($this->name ?? ''),
            'slug' => (string) ($this->slug ?? ''),
            'price' => $price,
            'sale_price' => $salePrice,
            'old_price' => ($this->old_price !== null && $this->old_price !== '') ? (float) $this->old_price : null,
            'image' => (string) ($this->image ?? ''),
            'images' => (array) ($this->images ?? []),
            'in_stock' => $stock > 0,
            'stock' => $stock,
            'category' => [
                'name' => (string) ($this->category_name ?? ($this->category?->name ?? '')),
                'slug' => (string) ($this->category_slug ?? ($this->category?->slug ?? '')),
            ],
            // Preserve fields used by existing ProductCard and callers
            'category_id' => (string) ($this->category_id ?? ''),
            'category_name' => (string) ($this->category_name ?? ''),
            'category_slug' => (string) ($this->category_slug ?? ''),
            'subcategory_name' => (string) ($this->subcategory_name ?? ''),
            'subcategory_slug' => (string) ($this->subcategory_slug ?? ''),
            'badge' => $this->badge,
            'badge_type' => $this->badge_type,
            'brand' => $this->brand,
            'material' => $this->material,
            'color' => $this->color,
            'colors' => $this->colors,
            'size' => $this->size,
            'sizes' => $this->sizes,
            'sku' => $this->sku,
            'rating' => (float) ($this->rating ?? 0),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'is_featured' => (bool) $this->is_featured,
            'is_bestseller' => (bool) $this->is_bestseller,
            'is_new' => (bool) $this->is_new,
            'is_active' => (bool) $this->is_active,
            'status' => (string) ($this->status ?? 'Active'),
            'description' => (string) ($this->description ?? ''),
            'computed_discount' => ($this->old_price && $this->old_price > $price)
                ? (int) round((($this->old_price - $price) / $this->old_price) * 100)
                : 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
