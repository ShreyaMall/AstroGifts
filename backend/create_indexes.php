<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

Schema::connection('mongodb')->table('products', function (Blueprint $collection) {
    $collection->index('category_slug');
    $collection->index('brand');
    $collection->index('color');
    $collection->index('price');
    $collection->index('rating');
    $collection->index('created_at');
    $collection->index(['category_slug' => 1, 'price' => 1]);
});
echo "Indexes created successfully\n";
