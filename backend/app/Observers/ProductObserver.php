<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductObserver
{
    public function created(Product $product): void
    {
        Cache::forget('catalog_products_filters');
    }

    public function updated(Product $product): void
    {
        Cache::forget('catalog_products_filters');
    }

    public function deleted(Product $product): void
    {
        Cache::forget('catalog_products_filters');
    }

    public function restored(Product $product): void
    {
        Cache::forget('catalog_products_filters');
    }
}
