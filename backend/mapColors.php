<?php

use App\Models\Product;

$colorMap = [
    "#1c1c1c" => "Black",
    "#e8e0d4" => "Beige",
    "#7d7d7d" => "Grey",
    "#2c2c2c" => "Dark Grey",
    "#c8c0b0" => "Cream",
    "#888888" => "Silver",
    "#4a6741" => "Olive Green",
    "#6fa8a0" => "Teal",
    "#e8d8b0" => "Sand",
    "#b22222" => "Crimson",
    "#c8a870" => "Gold",
    "#ffffff" => "White",
    "#c0622a" => "Rust",
    "#8b6340" => "Brown"
];

$products = Product::all();
foreach ($products as $product) {
    if ($product->color && isset($colorMap[$product->color])) {
        $product->color = $colorMap[$product->color];
        $product->save();
    }
}
echo "Single color updated successfully.\n";
