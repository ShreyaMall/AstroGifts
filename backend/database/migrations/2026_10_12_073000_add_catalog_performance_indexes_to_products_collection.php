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
            $collection->index('slug');
            $collection->index('category_id');
            $collection->index('is_active');
            $collection->index('status');
            $collection->index('stock');
            $collection->index('name');
        });

        Schema::connection('mongodb')->table('categories', function (Blueprint $collection) {
            $collection->index('slug');
            $collection->index('parent_category');
            $collection->index('is_active');
            $collection->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->table('products', function (Blueprint $collection) {
            $collection->dropIndex('slug_1');
            $collection->dropIndex('category_id_1');
            $collection->dropIndex('is_active_1');
            $collection->dropIndex('status_1');
            $collection->dropIndex('stock_1');
            $collection->dropIndex('name_1');
        });

        Schema::connection('mongodb')->table('categories', function (Blueprint $collection) {
            $collection->dropIndex('slug_1');
            $collection->dropIndex('parent_category_1');
            $collection->dropIndex('is_active_1');
            $collection->dropIndex('sort_order_1');
        });
    }
};
