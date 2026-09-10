<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Post;
use App\Models\Product;
use App\Models\Slider;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── 1. Users ──
        $admin = User::firstOrCreate(
            ['email' => 'admin@woodmart.com'],
            [
                'name' => 'WoodMart Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        $customer = User::firstOrCreate(
            ['email' => 'user@woodmart.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('user123'),
                'role' => 'customer',
            ]
        );

        // ── 2. Categories ──
        $categoriesData = [
            ['name' => 'Chairs',    'slug' => 'chairs',    'icon' => '🪑', 'sort_order' => 1, 'is_active' => true],
            ['name' => 'Tables',    'slug' => 'tables',    'icon' => '🪵', 'sort_order' => 2, 'is_active' => true],
            ['name' => 'Sofas',     'slug' => 'sofas',     'icon' => '🛋️', 'sort_order' => 3, 'is_active' => true],
            ['name' => 'Armchairs', 'slug' => 'armchairs', 'icon' => '💺', 'sort_order' => 4, 'is_active' => true],
            ['name' => 'Beds',      'slug' => 'beds',      'icon' => '🛏️', 'sort_order' => 5, 'is_active' => true],
            ['name' => 'Storage',   'slug' => 'storage',   'icon' => '🗄️', 'sort_order' => 6, 'is_active' => true],
            ['name' => 'Textiles',  'slug' => 'textiles',  'icon' => '🧵', 'sort_order' => 7, 'is_active' => true],
            ['name' => 'Lighting',  'slug' => 'lighting',  'icon' => '💡', 'sort_order' => 8, 'is_active' => true],
            ['name' => 'Toys',      'slug' => 'toys',      'icon' => '🧸', 'sort_order' => 9, 'is_active' => true],
            ['name' => 'Decor',     'slug' => 'decor',     'icon' => '🪴', 'sort_order' => 10, 'is_active' => true],
        ];

        $categoryMap = [];
        foreach ($categoriesData as $c) {
            $cat = Category::updateOrCreate(['slug' => $c['slug']], $c);
            $categoryMap[$c['slug']] = $cat;
        }

        // ── 3. Products Catalog ──
        $products = [
            // Chairs
            ['cat' => 'chairs', 'name' => 'Revolt Chair', 'price' => 275, 'old_price' => null, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'HAY', 'material' => 'Metal', 'color' => 'American Silver', 'colors' => ['#1c1c1c', '#e8e0d4'], 'image' => 'chair1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-CHR-001'],
            ['cat' => 'chairs', 'name' => 'Avana Chair', 'price' => 458, 'old_price' => 538, 'rating' => 5.0, 'badge' => '-15%', 'badge_type' => 'sale', 'brand' => 'Poliform', 'material' => 'Fabric', 'color' => 'Gray', 'colors' => ['#7d7d7d', '#2c2c2c'], 'image' => 'chair2.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-CHR-002'],
            ['cat' => 'chairs', 'name' => 'Sophie Dining Chair', 'price' => 520, 'old_price' => null, 'rating' => 5.0, 'badge' => null, 'badge_type' => null, 'brand' => 'Vitra', 'material' => 'Leather', 'color' => 'Bone', 'colors' => ['#c8c0b0', '#1c1c1c'], 'image' => 'chair3.jpg', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'WM-CHR-003'],
            ['cat' => 'chairs', 'name' => 'Petit Side Chair', 'price' => 327, 'old_price' => null, 'rating' => 4.5, 'badge' => null, 'badge_type' => null, 'brand' => 'HAY', 'material' => 'Wood', 'color' => 'American Silver', 'colors' => ['#e8e0d4', '#888888'], 'image' => 'chair4.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-CHR-004'],
            ['cat' => 'chairs', 'name' => 'Curve Modern Chair', 'price' => 320, 'old_price' => null, 'rating' => 4.5, 'badge' => null, 'badge_type' => null, 'brand' => 'Vitra', 'material' => 'Fabric', 'color' => 'Green', 'colors' => ['#4a6741', '#c8c0b0'], 'image' => 'chair5.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-CHR-005'],
            ['cat' => 'chairs', 'name' => '16 Side Lounge', 'price' => 295, 'old_price' => null, 'rating' => 4.0, 'badge' => null, 'badge_type' => null, 'brand' => 'HAY', 'material' => 'Plastic', 'color' => 'Jet', 'colors' => ['#1c1c1c', '#2c2c2c'], 'image' => 'chair6.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-CHR-006'],
            ['cat' => 'chairs', 'name' => '12 Side Nordic Chair', 'price' => 339, 'old_price' => 375, 'rating' => 4.5, 'badge' => '-10%', 'badge_type' => 'sale', 'brand' => 'Poliform', 'material' => 'Plastic', 'color' => 'Dark Gray', 'colors' => ['#6fa8a0', '#e8e0d4'], 'image' => 'chair7.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-CHR-007'],
            ['cat' => 'chairs', 'name' => 'Soft Edge Wood Chair', 'price' => 440, 'old_price' => null, 'rating' => 4.0, 'badge' => null, 'badge_type' => null, 'brand' => 'Vitra', 'material' => 'Wood', 'color' => 'Bone', 'colors' => ['#e8d8b0', '#1c1c1c', '#b22222'], 'image' => 'chair8.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-CHR-008'],
            ['cat' => 'chairs', 'name' => 'Result Minimalist Chair', 'price' => 279, 'old_price' => 310, 'rating' => 4.5, 'badge' => '-10%', 'badge_type' => 'sale', 'brand' => 'HAY', 'material' => 'Wood', 'color' => 'Bone', 'colors' => ['#c8a870', '#1c1c1c'], 'image' => 'chair9.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-CHR-009'],
            ['cat' => 'chairs', 'name' => 'Hal Wood Classic', 'price' => 625, 'old_price' => null, 'rating' => 5.0, 'badge' => null, 'badge_type' => null, 'brand' => 'Vitra', 'material' => 'Wood', 'color' => 'Gray', 'colors' => ['#7d7d7d'], 'image' => 'chair10.jpg', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'WM-CHR-010'],

            // Tables
            ['cat' => 'tables', 'name' => 'Bitta Dining Table', 'price' => 1519, 'old_price' => 1680, 'rating' => 5.0, 'badge' => '-10%', 'badge_type' => 'sale', 'brand' => 'Kettal', 'material' => 'Metal', 'color' => 'Dark Gray', 'colors' => ['#1c1c1c', '#e8e0d4'], 'image' => 'table2.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-TBL-001'],
            ['cat' => 'tables', 'name' => 'Giro LR Coffee Table', 'price' => 890, 'old_price' => null, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'Kettal', 'material' => 'Wood', 'color' => 'Bone', 'colors' => ['#c8a870', '#1c1c1c'], 'image' => 'table3.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-TBL-002'],
            ['cat' => 'tables', 'name' => 'Tulip Round Table', 'price' => 1200, 'old_price' => null, 'rating' => 4.5, 'badge' => null, 'badge_type' => null, 'brand' => 'Poliform', 'material' => 'Metal', 'color' => 'American Silver', 'colors' => ['#ffffff', '#1c1c1c'], 'image' => 'table4.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-TBL-003'],
            ['cat' => 'tables', 'name' => 'Oak Dining Table', 'price' => 980, 'old_price' => 1150, 'rating' => 5.0, 'badge' => '-15%', 'badge_type' => 'sale', 'brand' => 'Vitra', 'material' => 'Wood', 'color' => 'Bone', 'colors' => ['#c8a870', '#888888'], 'image' => 'table6.jpg', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'WM-TBL-004'],
            ['cat' => 'tables', 'name' => 'Marble Coffee Table', 'price' => 760, 'old_price' => null, 'rating' => 4.5, 'badge' => null, 'badge_type' => null, 'brand' => 'Poliform', 'material' => 'Metal', 'color' => 'American Silver', 'colors' => ['#e8e0d4', '#1c1c1c'], 'image' => 'table7.jpg', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'WM-TBL-005'],
            ['cat' => 'tables', 'name' => 'Hairpin Legs Desk', 'price' => 420, 'old_price' => null, 'rating' => 4.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'HAY', 'material' => 'Metal', 'color' => 'Dark Gray', 'colors' => ['#1c1c1c', '#c0622a'], 'image' => 'table8.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-TBL-006'],
            ['cat' => 'tables', 'name' => 'Walnut Extendable Table', 'price' => 1340, 'old_price' => null, 'rating' => 5.0, 'badge' => null, 'badge_type' => null, 'brand' => 'Vitra', 'material' => 'Wood', 'color' => 'Bone', 'colors' => ['#8b6340'], 'image' => 'table9.jpg', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'WM-TBL-007'],

            // Sofas
            ['cat' => 'sofas', 'name' => 'Belt Sectional Sofa', 'price' => 2150, 'old_price' => null, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'Kettal', 'material' => 'Fabric', 'color' => 'Bone', 'colors' => ['#e8e0d4', '#7d7d7d', '#1c1c1c'], 'image' => 'sofa1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-SOF-001'],
            ['cat' => 'sofas', 'name' => 'Camaleonda Modular Sofa', 'price' => 3800, 'old_price' => null, 'rating' => 5.0, 'badge' => null, 'badge_type' => null, 'brand' => 'B&B Italia', 'material' => 'Leather', 'color' => 'Bone', 'colors' => ['#c8a870', '#1c1c1c'], 'image' => 'sofa2.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-SOF-002'],
            ['cat' => 'sofas', 'name' => 'Cloud Comfort Sofa', 'price' => 2900, 'old_price' => 3400, 'rating' => 4.5, 'badge' => '-15%', 'badge_type' => 'sale', 'brand' => 'Poliform', 'material' => 'Fabric', 'color' => 'Gray', 'colors' => ['#6fa8a0', '#e8e0d4'], 'image' => 'sofa3.jpg', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'WM-SOF-003'],
            ['cat' => 'sofas', 'name' => 'LC2 Modern Sofa', 'price' => 4200, 'old_price' => null, 'rating' => 5.0, 'badge' => null, 'badge_type' => null, 'brand' => 'Cassina', 'material' => 'Leather', 'color' => 'Jet', 'colors' => ['#1c1c1c', '#888888'], 'image' => 'sofa4.jpg', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'WM-SOF-004'],
            ['cat' => 'sofas', 'name' => 'Grand Repos Recliner', 'price' => 3100, 'old_price' => null, 'rating' => 4.5, 'badge' => null, 'badge_type' => null, 'brand' => 'Vitra', 'material' => 'Fabric', 'color' => 'Bone', 'colors' => ['#c8a870'], 'image' => 'sofa5.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-SOF-005'],
            ['cat' => 'sofas', 'name' => 'DS-600 Endless Sofa', 'price' => 5500, 'old_price' => null, 'rating' => 5.0, 'badge' => 'HOT', 'badge_type' => 'hot', 'brand' => 'De Sede', 'material' => 'Leather', 'color' => 'Gray', 'colors' => ['#7d7d7d', '#e8e0d4'], 'image' => 'sofa7.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-SOF-006'],

            // Armchairs
            ['cat' => 'armchairs', 'name' => 'Eames Lounge Chair & Ottoman', 'price' => 4500, 'old_price' => null, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'Vitra', 'material' => 'Leather', 'color' => 'Jet', 'colors' => ['#1c1c1c', '#c8a870'], 'image' => 'armchair1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-ARM-001'],
            ['cat' => 'armchairs', 'name' => 'Egg Lounge Chair', 'price' => 3800, 'old_price' => null, 'rating' => 5.0, 'badge' => null, 'badge_type' => null, 'brand' => 'Fritz Hansen', 'material' => 'Fabric', 'color' => 'Gray', 'colors' => ['#888888', '#1c1c1c', '#e8e0d4'], 'image' => 'armchair2.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-ARM-002'],
            ['cat' => 'armchairs', 'name' => 'Panton Organic Chair', 'price' => 620, 'old_price' => null, 'rating' => 4.5, 'badge' => null, 'badge_type' => null, 'brand' => 'Vitra', 'material' => 'Plastic', 'color' => 'Bone', 'colors' => ['#c0622a', '#1c1c1c', '#e8e0d4'], 'image' => 'armchair3.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-ARM-003'],
            ['cat' => 'armchairs', 'name' => 'Womb Accent Chair', 'price' => 2900, 'old_price' => 3200, 'rating' => 5.0, 'badge' => '-10%', 'badge_type' => 'sale', 'brand' => 'Knoll', 'material' => 'Fabric', 'color' => 'Green', 'colors' => ['#6fa8a0', '#888888'], 'image' => 'armchair4.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-ARM-004'],

            // Beds
            ['cat' => 'beds', 'name' => 'Angle King Platform Bed', 'price' => 1850, 'old_price' => null, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'Poliform', 'material' => 'Fabric', 'color' => 'Bone', 'colors' => ['#e8e0d4', '#888888'], 'image' => 'bed1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-BED-001'],
            ['cat' => 'beds', 'name' => 'Flou Nathalie Luxury Bed', 'price' => 2400, 'old_price' => null, 'rating' => 5.0, 'badge' => null, 'badge_type' => null, 'brand' => 'Flou', 'material' => 'Leather', 'color' => 'Jet', 'colors' => ['#1c1c1c', '#e8e0d4'], 'image' => 'bed2.jpg', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'WM-BED-002'],
            ['cat' => 'beds', 'name' => 'Porro Fil Minimal Bed', 'price' => 3100, 'old_price' => 3400, 'rating' => 4.5, 'badge' => '-10%', 'badge_type' => 'sale', 'brand' => 'Porro', 'material' => 'Wood', 'color' => 'Gray', 'colors' => ['#888888', '#c8a870'], 'image' => 'bed3.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-BED-003'],

            // Storage
            ['cat' => 'storage', 'name' => 'Fami Industrial Shelf', 'price' => 890, 'old_price' => null, 'rating' => 4.5, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'HAY', 'material' => 'Metal', 'color' => 'American Silver', 'colors' => ['#e8e0d4', '#1c1c1c'], 'image' => 'storage1.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-STR-001'],
            ['cat' => 'storage', 'name' => 'USM Haller Modular Unit', 'price' => 2600, 'old_price' => 2900, 'rating' => 5.0, 'badge' => '-10%', 'badge_type' => 'sale', 'brand' => 'USM', 'material' => 'Metal', 'color' => 'Gray', 'colors' => ['#888888', '#1c1c1c', '#c0622a'], 'image' => 'storage3.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-STR-002'],
            ['cat' => 'storage', 'name' => 'Sideboard Vera Oak', 'price' => 1950, 'old_price' => null, 'rating' => 4.5, 'badge' => 'HOT', 'badge_type' => 'hot', 'brand' => 'Kettal', 'material' => 'Wood', 'color' => 'Bone', 'colors' => ['#c8a870'], 'image' => 'storage7.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-STR-003'],

            // Textiles
            ['cat' => 'textiles', 'name' => 'Wool Geometric Blanket', 'price' => 195, 'old_price' => null, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'HAY', 'material' => 'Wool', 'color' => 'Bone', 'colors' => ['#e8e0d4', '#6fa8a0'], 'image' => 'textile1.webp', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'WM-TXT-001'],
            ['cat' => 'textiles', 'name' => 'Handwoven Kilim Rug', 'price' => 480, 'old_price' => 560, 'rating' => 4.5, 'badge' => '-15%', 'badge_type' => 'sale', 'brand' => 'Loloi', 'material' => 'Wool', 'color' => 'Bone', 'colors' => ['#c0622a', '#888888'], 'image' => 'textile3.jpg', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'WM-TXT-002'],

            // Lighting
            ['cat' => 'lighting', 'name' => 'Pendant Brass Chandelier', 'price' => 380, 'old_price' => 450, 'rating' => 5.0, 'badge' => 'HOT', 'badge_type' => 'hot', 'brand' => 'Flos', 'material' => 'Metal', 'color' => 'American Silver', 'colors' => ['#c8a870', '#1c1c1c'], 'image' => 'light1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-LGT-001'],
            ['cat' => 'lighting', 'name' => 'Arc Modern Floor Lamp', 'price' => 290, 'old_price' => null, 'rating' => 4.5, 'badge' => null, 'badge_type' => null, 'brand' => 'Artemide', 'material' => 'Metal', 'color' => 'Jet', 'colors' => ['#1c1c1c'], 'image' => 'light3.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-LGT-002'],

            // Toys
            ['cat' => 'toys', 'name' => 'Wooden Heritage Train Set', 'price' => 85, 'old_price' => null, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'WoodMart Kids', 'material' => 'Wood', 'color' => 'Bone', 'colors' => ['#c8a870', '#c0622a'], 'image' => 'toy1.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'WM-TOY-001'],

            // Decor
            ['cat' => 'decor', 'name' => 'Terracotta Minimalist Vase', 'price' => 182, 'old_price' => null, 'rating' => 5.0, 'badge' => 'HOT', 'badge_type' => 'hot', 'brand' => 'Muuto', 'material' => 'Ceramic', 'color' => 'Bone', 'colors' => ['#c0622a', '#e8e0d4'], 'image' => 'decor1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'WM-DEC-001'],
            ['cat' => 'decor', 'name' => 'Sculptural Brass Mirror', 'price' => 240, 'old_price' => 280, 'rating' => 4.5, 'badge' => '-15%', 'badge_type' => 'sale', 'brand' => 'Ferm Living', 'material' => 'Metal', 'color' => 'American Silver', 'colors' => ['#c8a870'], 'image' => 'decor3.jpg', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'WM-DEC-002'],
        ];

        foreach ($products as $p) {
            $cat = $categoryMap[$p['cat']] ?? null;
            Product::updateOrCreate(
                ['slug' => Str::slug($p['name'])],
                [
                    'category_id' => $cat?->id,
                    'category_slug' => $p['cat'],
                    'category_name' => $cat?->name ?? ucfirst($p['cat']),
                    'name' => $p['name'],
                    'price' => $p['price'],
                    'old_price' => $p['old_price'],
                    'rating' => $p['rating'],
                    'badge' => $p['badge'],
                    'badge_type' => $p['badge_type'],
                    'brand' => $p['brand'],
                    'material' => $p['material'],
                    'color' => $p['color'],
                    'colors' => $p['colors'],
                    'image' => $p['image'],
                    'description' => "Crafted with exceptional attention to detail, the {$p['name']} brings Scandinavian elegance and enduring comfort to any contemporary space.",
                    'stock' => rand(15, 60),
                    'sku' => $p['sku'],
                    'is_featured' => $p['is_featured'],
                    'is_bestseller' => $p['is_bestseller'],
                    'is_active' => true,
                ]
            );
        }

        // ── 4. Sliders (Hero Banners) ──
        $sliders = [
            [
                'title' => 'Upholstered chair',
                'subtitle' => 'by Esther Howard',
                'price' => '$468',
                'image' => 'wd-furniture-slider-111.jpg.webp',
                'cta_text' => 'Shop Now',
                'link' => '/chairs',
                'status' => 'Active',
                'sort_order' => 1,
            ],
            [
                'title' => 'Sectional fabric sofa',
                'subtitle' => 'by Ramón Esteve',
                'price' => '$3620',
                'image' => 'wd-furniture-slider-112.jpg.webp',
                'cta_text' => 'Shop Now',
                'link' => '/sofas',
                'status' => 'Active',
                'sort_order' => 2,
            ],
            [
                'title' => 'Terracotta vase',
                'subtitle' => 'by Courtney Henry',
                'price' => '$182',
                'image' => 'wd-furniture-slider-113.jpg.webp',
                'cta_text' => 'Shop Now',
                'link' => '/decor',
                'status' => 'Active',
                'sort_order' => 3,
            ],
        ];

        foreach ($sliders as $s) {
            Slider::updateOrCreate(['title' => $s['title']], $s);
        }

        // ── 5. Posts / Articles ──
        $posts = [
            [
                'title' => '10 Tips for a Minimalist Living Room',
                'slug' => '10-tips-for-a-minimalist-living-room',
                'category' => 'Interior Design',
                'excerpt' => 'Discover how to create calm, airy, and functional spaces using neutral tones and natural materials.',
                'content' => 'Full article content on minimalism, textures, subtle lighting, and intentional furniture choices.',
                'status' => 'Published',
                'date_label' => 'Jul 25, 2026',
            ],
            [
                'title' => 'How to Choose the Perfect Sofa',
                'slug' => 'how-to-choose-the-perfect-sofa',
                'category' => 'Buying Guide',
                'excerpt' => 'From modular seating to classic leather, find the ideal centerpiece for your home.',
                'content' => 'A comprehensive guide to fabric durability, cushion density, frame construction, and sizing.',
                'status' => 'Published',
                'date_label' => 'Jul 22, 2026',
            ],
            [
                'title' => 'Summer Collection 2026 Launch',
                'slug' => 'summer-collection-2026-launch',
                'category' => 'News',
                'excerpt' => 'Explore our new outdoor lounge sets and sun-washed wood finishes crafted for warm days.',
                'content' => 'Introducing the Summer 2026 curated catalog with teak wood, weather-resistant textiles, and ceramic accents.',
                'status' => 'Published',
                'date_label' => 'Jul 30, 2026',
            ],
            [
                'title' => 'Wood Types: Oak vs Walnut vs Pine',
                'slug' => 'wood-types-oak-vs-walnut-vs-pine',
                'category' => 'Materials',
                'excerpt' => 'Understand grain patterns, hardness, and aging characteristics to pick the right solid wood.',
                'content' => 'Deep dive into grain structures, moisture tolerance, finishes, and durability.',
                'status' => 'Published',
                'date_label' => 'Jul 18, 2026',
            ],
            [
                'title' => 'Bedroom Makeover on a Budget',
                'slug' => 'bedroom-makeover-on-a-budget',
                'category' => 'Interior Design',
                'excerpt' => 'Simple lighting tweaks, headboard choices, and textile layering that transform your sanctuary.',
                'content' => 'Practical ideas to elevate bedroom aesthetics with linen sheets, soft sconces, and wooden side tables.',
                'status' => 'Published',
                'date_label' => 'Jul 29, 2026',
            ],
        ];

        foreach ($posts as $post) {
            Post::updateOrCreate(['slug' => $post['slug']], $post);
        }

        // ── 6. Coupons ──
        $coupons = [
            ['code' => 'WOODMART15', 'discount_percent' => 15, 'min_spend' => 100, 'is_active' => true],
            ['code' => 'WOODMART20', 'discount_percent' => 20, 'min_spend' => 250, 'is_active' => true],
            ['code' => 'SAVE15',     'discount_percent' => 15, 'min_spend' => 50,  'is_active' => true],
            ['code' => 'SAVE10',     'discount_percent' => 10, 'min_spend' => 0,   'is_active' => true],
        ];

        foreach ($coupons as $c) {
            Coupon::updateOrCreate(['code' => $c['code']], $c);
        }

        // ── 7. Initial Seed Orders ──
        $ordersData = [
            [
                'order_number' => 'ORD-1001',
                'customer_name' => 'Alice Johnson',
                'email' => 'alice@example.com',
                'phone' => '+1 555 123 4567',
                'shipping_address' => '124 Elm Street, Apt 4B',
                'city' => 'San Francisco',
                'state' => 'CA',
                'zip' => '94103',
                'subtotal' => 2890.00,
                'discount' => 0.00,
                'shipping_cost' => 0.00,
                'total' => 2890.00,
                'payment_method' => 'card',
                'payment_status' => 'paid',
                'status' => 'Delivered',
                'items' => [
                    ['product_name' => 'Angle King Platform Bed', 'price' => 1850.00, 'quantity' => 1, 'selected_color' => '#e8e0d4', 'subtotal' => 1850.00],
                    ['product_name' => 'Result Minimalist Chair', 'price' => 279.00, 'quantity' => 2, 'selected_color' => '#c8a870', 'subtotal' => 558.00],
                    ['product_name' => 'Sculptural Brass Mirror', 'price' => 240.00, 'quantity' => 2, 'selected_color' => '#c8a870', 'subtotal' => 480.00],
                ],
            ],
            [
                'order_number' => 'ORD-1002',
                'customer_name' => 'Bob Smith',
                'email' => 'bob@example.com',
                'phone' => '+1 555 987 6543',
                'shipping_address' => '500 Oak Parkway',
                'city' => 'Austin',
                'state' => 'TX',
                'zip' => '78701',
                'subtotal' => 3800.00,
                'discount' => 180.00,
                'shipping_cost' => 0.00,
                'total' => 3620.00,
                'payment_method' => 'card',
                'payment_status' => 'paid',
                'status' => 'Processing',
                'items' => [
                    ['product_name' => 'Camaleonda Modular Sofa', 'price' => 3800.00, 'quantity' => 1, 'selected_color' => '#c8a870', 'subtotal' => 3800.00],
                ],
            ],
            [
                'order_number' => 'ORD-1003',
                'customer_name' => 'Carol Williams',
                'email' => 'carol@example.com',
                'phone' => '+1 555 456 7890',
                'shipping_address' => '88 Ocean View Ave',
                'city' => 'Miami',
                'state' => 'FL',
                'zip' => '33101',
                'subtotal' => 468.00,
                'discount' => 0.00,
                'shipping_cost' => 0.00,
                'total' => 468.00,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'status' => 'Shipped',
                'items' => [
                    ['product_name' => 'Avana Chair', 'price' => 458.00, 'quantity' => 1, 'selected_color' => '#7d7d7d', 'subtotal' => 458.00],
                ],
            ],
            [
                'order_number' => 'ORD-1004',
                'customer_name' => 'David Lee',
                'email' => 'david@example.com',
                'phone' => '+1 555 222 3333',
                'shipping_address' => '321 Maple Avenue',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip' => '60601',
                'subtotal' => 182.00,
                'discount' => 0.00,
                'shipping_cost' => 0.00,
                'total' => 182.00,
                'payment_method' => 'card',
                'payment_status' => 'paid',
                'status' => 'Delivered',
                'items' => [
                    ['product_name' => 'Terracotta Minimalist Vase', 'price' => 182.00, 'quantity' => 1, 'selected_color' => '#c0622a', 'subtotal' => 182.00],
                ],
            ],
            [
                'order_number' => 'ORD-1005',
                'customer_name' => 'Eva Martinez',
                'email' => 'eva@example.com',
                'phone' => '+1 555 888 9999',
                'shipping_address' => '742 Evergreen Terrace',
                'city' => 'Seattle',
                'state' => 'WA',
                'zip' => '98101',
                'subtotal' => 1240.00,
                'discount' => 0.00,
                'shipping_cost' => 0.00,
                'total' => 1240.00,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'status' => 'Pending',
                'items' => [
                    ['product_name' => 'Oak Dining Table', 'price' => 980.00, 'quantity' => 1, 'selected_color' => '#c8a870', 'subtotal' => 980.00],
                    ['product_name' => 'Sculptural Brass Mirror', 'price' => 240.00, 'quantity' => 1, 'selected_color' => '#c8a870', 'subtotal' => 240.00],
                ],
            ],
        ];

        foreach ($ordersData as $oData) {
            $items = $oData['items'];
            unset($oData['items']);

            $order = Order::updateOrCreate(['order_number' => $oData['order_number']], $oData);

            foreach ($items as $item) {
                OrderItem::firstOrCreate(
                    [
                        'order_id' => $order->id,
                        'product_name' => $item['product_name'],
                    ],
                    [
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'selected_color' => $item['selected_color'],
                        'subtotal' => $item['subtotal'],
                    ]
                );
            }
        }
    }
}
