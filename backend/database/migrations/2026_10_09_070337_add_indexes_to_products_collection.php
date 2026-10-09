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
        Schema::connection('mongodb')->table('products', function (Blueprint $collection) {
            $collection->index('category_slug');
            $collection->index('brand');
            $collection->index('color');
            $collection->index('price');
            $collection->index('rating');
            $collection->index('created_at');
            $collection->index(['category_slug' => 1, 'price' => 1]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->table('products', function (Blueprint $collection) {
            $collection->dropIndex('category_slug_1');
            $collection->dropIndex('brand_1');
            $collection->dropIndex('color_1');
            $collection->dropIndex('price_1');
            $collection->dropIndex('rating_1');
            $collection->dropIndex('created_at_1');
            $collection->dropIndex('category_slug_1_price_1');
        });
    }
};
