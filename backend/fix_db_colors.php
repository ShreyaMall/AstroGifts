<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$colorMap = [
    'White Rose' => 'White',
    'Maroon Rose' => 'Maroon',
    'Astro Yellow Ring' => 'Yellow',
    'Natural brown  Astrological Ring' => 'Brown',
    'Black Pendent' => 'Black',
    'Golden Pyrite Ring' => 'Gold',
    'Green pendent' => 'Green',
    'Birthdar Balloon' => 'Multi Color',
    'Pink Balloon' => 'Pink',
    'Golden Pyrite Stone' => 'Gold',
    'Rose Quartz Healing Crystal' => 'Pink',
    'Sunflower bouquet' => 'Yellow',
];

foreach ($colorMap as $name => $col) {
    $p = App\Models\Product::where('name', $name)->first();
    if ($p) {
        $p->color = $col;
        $p->save();
        echo "Updated '{$p->name}' color to '{$col}'\n";
    }
}
