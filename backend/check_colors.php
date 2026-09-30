<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$prods = App\Models\Product::all();
foreach ($prods as $p) {
    echo "ID: {$p->id} | Name: {$p->name} | Color: " . json_encode($p->color) . "\n";
}
