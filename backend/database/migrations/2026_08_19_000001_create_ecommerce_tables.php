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
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('category_slug')->nullable();
            $table->string('category_name')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2);
            $table->decimal('old_price', 10, 2)->nullable();
            $table->decimal('rating', 3, 1)->default(5.0);
            $table->string('badge')->nullable();
            $table->string('badge_type')->nullable(); // 'sale', 'new', 'hot'
            $table->string('brand')->nullable();
            $table->string('material')->nullable();
            $table->string('color')->nullable();
            $table->json('colors')->nullable(); // array of hex color strings
            $table->text('image')->nullable();
            $table->text('description')->nullable();
            $table->integer('stock')->default(50);
            $table->string('sku')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('shipping_address');
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('shipping_cost', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->string('payment_method')->default('cod'); // 'cod', 'card', 'upi'
            $table->string('payment_status')->default('pending'); // 'pending', 'paid', 'failed'
            $table->string('status')->default('Pending'); // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name');
            $table->string('product_image')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->string('selected_color')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });

        // 5. Sliders (Hero Banners)
        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('price')->nullable();
            $table->text('image');
            $table->string('cta_text')->default('Shop Now');
            $table->string('link')->nullable();
            $table->string('status')->default('Active'); // 'Active', 'Inactive'
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 6. Posts / Articles (Blog)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->default('Interior Design');
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->text('image')->nullable();
            $table->string('status')->default('Published'); // 'Published', 'Draft'
            $table->string('date_label')->nullable();
            $table->timestamps();
        });

        // 7. Coupons
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->integer('discount_percent');
            $table->decimal('min_spend', 10, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
