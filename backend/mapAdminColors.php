<?php

use App\Models\Product;

$colorMap = [
    "Black" => "Jet Black",
    "Beige" => "Bone White",
    "Grey" => "Slate Gray",
    "Dark Grey" => "Dark Charcoal",
    "Cream" => "Cream",
    "Silver" => "American Silver",
    "Olive Green" => "Forest Green",
    "Teal" => "Ocean Teal",
    "Sand" => "Natural Wood",
    "Crimson" => "Terracotta",
    "Gold" => "Natural Wood",
    "White" => "Bone White",
    "Rust" => "Terracotta",
    "Brown" => "Walnut Brown",
    "Bhagwa" => "Terracotta",
    "Rust Orange" => "Terracotta",
    "bhagwa" => "Terracotta"
];

$products = Product::all();
foreach ($products as $product) {
    $changed = false;
    
    $colors = $product->colors;
    if ($colors && is_array($colors)) {
        $newColors = [];
        foreach ($colors as $c) {
            if (isset($colorMap[$c])) {
                $newColors[] = $colorMap[$c];
                $changed = true;
            } else {
                $newColors[] = $c;
            }
        }
        if ($changed) {
            $product->colors = array_values(array_unique($newColors));
        }
    }

    $stockByColor = $product->stock_by_color;
    if ($stockByColor && is_array($stockByColor)) {
        $newStock = [];
        foreach ($stockByColor as $c => $stock) {
            if (isset($colorMap[$c])) {
                if (isset($newStock[$colorMap[$c]])) {
                     $newStock[$colorMap[$c]] += $stock;
                } else {
                     $newStock[$colorMap[$c]] = $stock;
                }
                $changed = true;
            } else {
                $newStock[$c] = $stock;
            }
        }
        if ($changed) {
            $product->stock_by_color = $newStock;
        }
    }
    
    if ($product->color && isset($colorMap[$product->color])) {
        $product->color = $colorMap[$product->color];
        $changed = true;
    }

    if ($changed) {
        $product->save();
    }
}
echo "Colors updated to admin defaults successfully.\n";
