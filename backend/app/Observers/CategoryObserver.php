<?php

namespace App\Observers;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryObserver
{
    public function created(Category $category): void
    {
        Cache::forget('catalog_products_filters');
    }

    public function updated(Category $category): void
    {
        Cache::forget('catalog_products_filters');
    }

    public function deleted(Category $category): void
    {
        Cache::forget('catalog_products_filters');
    }

    public function restored(Category $category): void
    {
        Cache::forget('catalog_products_filters');
    }
}
