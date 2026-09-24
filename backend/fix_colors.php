<?php
$products = \App\Models\Product::all();
$colors = ['Black', 'Blue', 'Bone', 'Green', 'Grey', 'Orange'];
foreach ($products as $p) {
    if ($p->name === 'LC2 Modern Sofa') {
        $p->color = 'Green';
    } elseif ($p->color === 'Jet') {
        $p->color = 'Black';
    } elseif ($p->color === 'Gray' || $p->color === 'American Silver' || $p->color === 'Dark Gray') {
        $p->color = 'Grey';
    } elseif ($p->color === 'Various') {
        $p->color = $colors[array_rand($colors)];
    } elseif (!in_array($p->color, $colors)) {
        $p->color = $colors[array_rand($colors)];
    }
    $p->save();
}
echo "Updated colors successfully\n";
