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
     * Seed the application's database with AstroGifts, Toys & Astrology Catalog.
     */
    public function run(): void
    {
        // ── 1. Users ──
        $admin = User::firstOrCreate(
            ['email' => 'admin@astrogifts.com'],
            [
                'name' => 'AstroGifts Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        $customer = User::firstOrCreate(
            ['email' => 'user@astrogifts.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('user123'),
                'role' => 'customer',
            ]
        );

        // ── 2. Categories ──
        $giftSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';
        $toysSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>';
        $starSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        $flowerSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 0-4 4c0 2 2 4 4 6 2-2 4-4 4-6a4 4 0 0 0-4-4z"/><path d="M12 22v-8"/><path d="M12 14c-4 0-6-2-6-4s2-4 6-4"/><path d="M12 14c4 0 6-2 6-4s-2-4-6-4"/></svg>';
        $decorSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10"/><path d="M12 12l5-5"/><path d="M12 12l-5-5"/><rect x="8" y="12" width="8" height="10" rx="2"/></svg>';

        $categoriesData = [
            ['name' => 'Gifts',     'slug' => 'gifts',     'icon' => $giftSvg,   'sort_order' => 1, 'is_active' => true],
            ['name' => 'Toys',      'slug' => 'toys',      'icon' => $toysSvg,   'sort_order' => 2, 'is_active' => true],
            ['name' => 'Astrology', 'slug' => 'astrology', 'icon' => $starSvg,   'sort_order' => 3, 'is_active' => true],
            ['name' => 'Flowers',   'slug' => 'flowers',   'icon' => $flowerSvg, 'sort_order' => 4, 'is_active' => true],
            ['name' => 'Decor',     'slug' => 'decor',     'icon' => $decorSvg,  'sort_order' => 5, 'is_active' => true],
            
            // Subcategories
            ['name' => 'Diwali Gifts',      'slug' => 'diwali-gifts',      'icon' => $giftSvg, 'sort_order' => 6, 'is_active' => true, 'parent_category' => 'gifts'],
            ['name' => 'Birthday Gifts',    'slug' => 'birthday-gifts',    'icon' => $giftSvg, 'sort_order' => 7, 'is_active' => true, 'parent_category' => 'gifts'],
            ['name' => 'Anniversary Gifts', 'slug' => 'anniversary-gifts', 'icon' => $giftSvg, 'sort_order' => 8, 'is_active' => true, 'parent_category' => 'gifts'],
            
            ['name' => 'Soft Toys',         'slug' => 'soft-toys',         'icon' => $toysSvg, 'sort_order' => 9, 'is_active' => true, 'parent_category' => 'toys'],
            ['name' => 'Baby Toys',         'slug' => 'baby-toys',         'icon' => $toysSvg, 'sort_order' => 10, 'is_active' => true, 'parent_category' => 'toys'],
            ['name' => 'Board Games',       'slug' => 'board-games',       'icon' => $toysSvg, 'sort_order' => 11, 'is_active' => true, 'parent_category' => 'toys'],
            
            ['name' => 'Rings',                'slug' => 'rings',              'icon' => $starSvg, 'sort_order' => 12, 'is_active' => true, 'parent_category' => 'astrology'],
            ['name' => 'Pendants',             'slug' => 'pendants',           'icon' => $starSvg, 'sort_order' => 13, 'is_active' => true, 'parent_category' => 'astrology'],
            ['name' => 'Bracelets',            'slug' => 'bracelets',          'icon' => $starSvg, 'sort_order' => 14, 'is_active' => true, 'parent_category' => 'astrology'],
            ['name' => 'Gemstones & Crystals', 'slug' => 'gemstones-crystals', 'icon' => $starSvg, 'sort_order' => 15, 'is_active' => true, 'parent_category' => 'astrology'],
        ];

        $categoryMap = [];
        foreach ($categoriesData as $c) {
            $cat = Category::updateOrCreate(['slug' => $c['slug']], $c);
            $categoryMap[$c['slug']] = $cat;
        }

        // ── 3. Products Catalog (Gifts, Toys & Astrology ONLY) ──
        $products = [
            // GIFTS
            ['cat' => 'gifts', 'name' => 'Luxury Birthday Gift Hamper', 'price' => 1499, 'old_price' => 1899, 'rating' => 5.0, 'badge' => 'BESTSELLER', 'badge_type' => 'hot', 'brand' => 'AstroGifts', 'material' => 'Curated Box', 'color' => 'Gold', 'colors' => ['#d4af37', '#2c1510'], 'image' => 'gift image.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-GFT-001'],
            ['cat' => 'gifts', 'name' => 'Personalized Couple Anniversary Box', 'price' => 1299, 'old_price' => 1599, 'rating' => 4.9, 'badge' => '-20%', 'badge_type' => 'sale', 'brand' => 'AstroGifts', 'material' => 'Custom Wood', 'color' => 'Rose', 'colors' => ['#e07b39', '#ffffff'], 'image' => 'gifts.png', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-GFT-002'],
            ['cat' => 'gifts', 'name' => 'Diwali Festive Celebration Hamper', 'price' => 1999, 'old_price' => 2499, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'AstroGifts', 'material' => 'Brass & Sweets', 'color' => 'Gold', 'colors' => ['#ffd700'], 'image' => 'gift image.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-GFT-003'],
            ['cat' => 'gifts', 'name' => 'Premium Chocolate & Dry Fruit Gift Box', 'price' => 899, 'old_price' => 1199, 'rating' => 4.8, 'badge' => 'HOT', 'badge_type' => 'hot', 'brand' => 'AstroGifts', 'material' => 'Velvet Box', 'color' => 'Maroon', 'colors' => ['#800020'], 'image' => 'gifts.png', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'AG-GFT-004'],
            ['cat' => 'gifts', 'name' => 'Custom Photo Frame & LED Mug Combo', 'price' => 699, 'old_price' => 899, 'rating' => 4.7, 'badge' => 'POPULAR', 'badge_type' => 'new', 'brand' => 'AstroGifts', 'material' => 'Glass & Ceramic', 'color' => 'White', 'colors' => ['#ffffff'], 'image' => 'gift image.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'AG-GFT-005'],
            ['cat' => 'gifts', 'name' => 'Golden Rose & Candle Light Gift Set', 'price' => 499, 'old_price' => 699, 'rating' => 4.9, 'badge' => '-28%', 'badge_type' => 'sale', 'brand' => 'AstroGifts', 'material' => 'Gold Foil', 'color' => 'Gold', 'colors' => ['#ffd700'], 'image' => 'gifts.png', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'AG-GFT-006'],

            // TOYS
            ['cat' => 'toys', 'name' => 'Cute Giant Teddy Bear (Soft Toy)', 'price' => 899, 'old_price' => 1199, 'rating' => 4.8, 'badge' => 'HOT', 'badge_type' => 'hot', 'brand' => 'AstroToys', 'material' => 'Plush Velvet', 'color' => 'Brown', 'colors' => ['#8b4513', '#ffffff'], 'image' => 'toy1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-TOY-001'],
            ['cat' => 'toys', 'name' => 'Wooden Heritage Train Set', 'price' => 699, 'old_price' => 899, 'rating' => 5.0, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'AstroToys', 'material' => 'Natural Wood', 'color' => 'Multicolor', 'colors' => ['#c8a870', '#c0622a'], 'image' => 'toy2.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-TOY-002'],
            ['cat' => 'toys', 'name' => 'Interactive Kids Board Game', 'price' => 549, 'old_price' => 749, 'rating' => 4.7, 'badge' => '-25%', 'badge_type' => 'sale', 'brand' => 'AstroToys', 'material' => 'Cardboard', 'color' => 'Blue', 'colors' => ['#1e90ff'], 'image' => 'toy3.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-TOY-003'],
            ['cat' => 'toys', 'name' => 'Plush Bunny Rabbit Soft Toy', 'price' => 449, 'old_price' => 599, 'rating' => 4.9, 'badge' => 'POPULAR', 'badge_type' => 'hot', 'brand' => 'AstroToys', 'material' => 'Cotton Plush', 'color' => 'Pink', 'colors' => ['#ffc0cb'], 'image' => 'toy4.jpg', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'AG-TOY-004'],
            ['cat' => 'toys', 'name' => 'Educational Puzzle & Building Blocks', 'price' => 799, 'old_price' => 999, 'rating' => 4.8, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'AstroToys', 'material' => 'Non-Toxic ABS', 'color' => 'Multicolor', 'colors' => ['#ff0000', '#00ff00', '#0000ff'], 'image' => 'toy5.jpg', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'AG-TOY-005'],

            // ASTROLOGY & GEMSTONES
            ['cat' => 'astrology', 'name' => 'Natural Rose Quartz Healing Crystal', 'price' => 799, 'old_price' => 999, 'rating' => 5.0, 'badge' => 'SACRED', 'badge_type' => 'hot', 'brand' => 'AstroSacred', 'material' => 'Natural Crystal', 'color' => 'Pink', 'colors' => ['#ffc0cb'], 'image' => 'Rose_Quartz.webp', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-AST-001'],
            ['cat' => 'astrology', 'name' => 'Certified Yellow Sapphire Gemstone Ring', 'price' => 2499, 'old_price' => 2999, 'rating' => 4.9, 'badge' => 'CERTIFIED', 'badge_type' => 'new', 'brand' => 'AstroSacred', 'material' => 'Silver & Gem', 'color' => 'Yellow', 'colors' => ['#ffd700'], 'image' => 'astro.png', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-AST-002'],
            ['cat' => 'astrology', 'name' => 'Zodiac Signs Protection Pendant', 'price' => 999, 'old_price' => 1299, 'rating' => 4.8, 'badge' => '-23%', 'badge_type' => 'sale', 'brand' => 'AstroSacred', 'material' => 'Brass Gold', 'color' => 'Gold', 'colors' => ['#d4af37'], 'image' => 'astri image.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-AST-003'],
            ['cat' => 'astrology', 'name' => 'Natural Amethyst Crystal Cluster', 'price' => 1199, 'old_price' => 1499, 'rating' => 5.0, 'badge' => 'HEALING', 'badge_type' => 'hot', 'brand' => 'AstroSacred', 'material' => 'Amethyst Stone', 'color' => 'Purple', 'colors' => ['#800080'], 'image' => 'Amethyst.webp', 'is_featured' => false, 'is_bestseller' => true, 'sku' => 'AG-AST-004'],
            ['cat' => 'astrology', 'name' => '7 Chakra Gemstone Bracelet', 'price' => 649, 'old_price' => 849, 'rating' => 4.9, 'badge' => 'ENERGY', 'badge_type' => 'new', 'brand' => 'AstroSacred', 'material' => 'Natural Beads', 'color' => 'Multicolor', 'colors' => ['#ff0000', '#0000ff', '#800080'], 'image' => 'Tiger_Eye.webp', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'AG-AST-005'],
            ['cat' => 'astrology', 'name' => 'Pyrite Money Magnet Stone Cluster', 'price' => 599, 'old_price' => 799, 'rating' => 4.8, 'badge' => 'WEALTH', 'badge_type' => 'hot', 'brand' => 'AstroSacred', 'material' => 'Pyrite Stone', 'color' => 'Gold-Brass', 'colors' => ['#d4af37'], 'image' => 'Pyrite.webp', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'AG-AST-006'],
            ['cat' => 'astrology', 'name' => 'Lapis Lazuli Third Eye Crystal', 'price' => 899, 'old_price' => 1099, 'rating' => 4.9, 'badge' => 'SACRED', 'badge_type' => 'hot', 'brand' => 'AstroSacred', 'material' => 'Lapis Stone', 'color' => 'Deep Blue', 'colors' => ['#00008b'], 'image' => 'Lapis_Lazuli.webp', 'is_featured' => true, 'is_bestseller' => false, 'sku' => 'AG-AST-007'],

            // FLOWERS
            ['cat' => 'flowers', 'name' => 'Fresh Red Roses Premium Bouquet', 'price' => 599, 'old_price' => 799, 'rating' => 5.0, 'badge' => 'FRESH', 'badge_type' => 'hot', 'brand' => 'AstroFlora', 'material' => 'Fresh Flowers', 'color' => 'Red', 'colors' => ['#ff0000'], 'image' => 'flowers.png', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-FLW-001'],
            ['cat' => 'flowers', 'name' => 'Mixed Carnations & Lilies Bouquet', 'price' => 749, 'old_price' => 899, 'rating' => 4.8, 'badge' => 'NEW', 'badge_type' => 'new', 'brand' => 'AstroFlora', 'material' => 'Fresh Lilies', 'color' => 'Pink & White', 'colors' => ['#ffc0cb', '#ffffff'], 'image' => 'flowers.png', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'AG-FLW-002'],

            // DECOR
            ['cat' => 'decor', 'name' => 'Terracotta Minimalist Vase', 'price' => 499, 'old_price' => 649, 'rating' => 5.0, 'badge' => 'HOT', 'badge_type' => 'hot', 'brand' => 'AstroDecor', 'material' => 'Ceramic', 'color' => 'Terracotta', 'colors' => ['#c0622a'], 'image' => 'decor1.jpg', 'is_featured' => true, 'is_bestseller' => true, 'sku' => 'AG-DEC-001'],
            ['cat' => 'decor', 'name' => 'Brass Diya & Tea Light Holder Set', 'price' => 699, 'old_price' => 899, 'rating' => 4.9, 'badge' => 'FESTIVE', 'badge_type' => 'new', 'brand' => 'AstroDecor', 'material' => 'Pure Brass', 'color' => 'Gold', 'colors' => ['#ffd700'], 'image' => 'decor2.jpg', 'is_featured' => false, 'is_bestseller' => false, 'sku' => 'AG-DEC-002'],
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
                    'sizes' => ['Standard'],
                    'dimensions' => "Standard Pack",
                    'features' => [
                        'Premium quality materials & craftsmanship',
                        'Beautifully packed for instant gifting',
                        '100% authentic and certified items',
                        'Express nationwide shipping'
                    ],
                    'faqs' => [
                        ['question' => 'Is gift wrapping available?', 'answer' => 'Yes, complimentary luxury gift wrapping is included with every order.'],
                        ['question' => 'How long does delivery take?', 'answer' => 'Orders are dispatched within 24 hours and delivered in 2-4 business days.'],
                        ['question' => 'What is the return policy?', 'answer' => 'We offer a hassle-free 7-day return and replacement guarantee.']
                    ],
                    'image' => '/' . ltrim($p['image'], '/'),
                    'description' => "Specially created by AstroGifts, the {$p['name']} brings joy, elegance and positive energy to your life.",
                    'stock' => rand(25, 100),
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
                'title' => 'Exclusive Gift Sets & Hampers',
                'subtitle' => 'by AstroGifts Studio',
                'price' => '₹499',
                'image' => 'hero slider1.png',
                'cta_text' => 'Shop Gifts',
                'link' => '/category/gifts',
                'badge_text' => 'Discover Premium Gifts',
                'badge_category' => 'gifts',
                'status' => 'Active',
                'sort_order' => 1,
            ],
            [
                'title' => 'Interactive Toys & Educational Games',
                'subtitle' => 'by AstroGifts Kids',
                'price' => '₹299',
                'image' => 'hero slider 3.png',
                'cta_text' => 'Shop Toys',
                'link' => '/category/toys',
                'badge_text' => 'Explore Fun Toys',
                'badge_category' => 'toys',
                'status' => 'Active',
                'sort_order' => 2,
            ],
            [
                'title' => 'Natural Gemstones & Healing Crystals',
                'subtitle' => 'by AstroGifts Astro',
                'price' => '₹799',
                'image' => 'hero slider 4.png',
                'cta_text' => 'Shop Astrology',
                'link' => '/category/astrology',
                'badge_text' => 'Sacred Astrology',
                'badge_category' => 'astrology',
                'status' => 'Active',
                'sort_order' => 3,
            ],
        ];

        foreach ($sliders as $s) {
            $s['image'] = '/' . ltrim($s['image'], '/');
            Slider::updateOrCreate(['title' => $s['title']], $s);
        }

        // ── 5. Posts / Articles ──
        $posts = [
            [
                'title' => 'Choosing Safe & Educational Toys for Kids',
                'slug' => 'choosing-safe-and-educational-toys-for-kids',
                'category' => 'Toys Guide',
                'excerpt' => 'Explore wooden toys, soft plushies, and cognitive board games designed for growing minds.',
                'content' => 'Tips on selecting non-toxic, age-appropriate toys that foster creativity and problem-solving skills.',
                'status' => 'Published',
                'date_label' => 'Sep 22, 2026',
                'image' => '/article_toys.png',
            ],
            [
                'title' => 'Healing Power of Gemstones & Crystals',
                'slug' => 'healing-power-of-gemstones-and-crystals',
                'category' => 'Astrology',
                'excerpt' => 'Learn how Rose Quartz, Amethyst, and Pyrite bring positive energy, wealth, and peace into your home.',
                'content' => 'A comprehensive guide to crystal chakra balancing, wearing birthstones, and cleansing energy.',
                'status' => 'Published',
                'date_label' => 'Sep 20, 2026',
                'image' => '/article_astrology.png',
            ],
            [
                'title' => 'Top 10 Gifting Ideas for Birthdays & Anniversaries',
                'slug' => 'top-10-gifting-ideas-for-birthdays-and-anniversaries',
                'category' => 'Gifting Guide',
                'excerpt' => 'Discover how to choose meaningful, personalized gifts that make every celebration unforgettable.',
                'content' => 'Full article on luxury hampers, custom gift boxes, photo frames, and heartfelt surprises.',
                'status' => 'Published',
                'date_label' => 'Sep 15, 2026',
                'image' => '/article_gifting.png',
            ],
            [
                'title' => 'Wood Types: Oak vs Walnut vs Pine',
                'slug' => 'fresh-flower-arrangement-and-decor-tips',
                'category' => 'Materials',
                'excerpt' => 'Understand grain patterns, hardness, and aging characteristics to pick the right solid wood.',
                'content' => 'Complete guide on selecting handcrafted wooden blocks, oak vs walnut finishes, and long-lasting furniture.',
                'status' => 'Published',
                'date_label' => 'Jul 18, 2026',
                'image' => '/article_wood.png',
            ],
        ];

        foreach ($posts as $post) {
            Post::updateOrCreate(['slug' => $post['slug']], $post);
        }

        // ── 6. Coupons ──
        $coupons = [
            ['code' => 'ASTROGIFTS15', 'discount_percent' => 15, 'min_spend' => 100, 'is_active' => true],
            ['code' => 'ASTROGIFTS20', 'discount_percent' => 20, 'min_spend' => 250, 'is_active' => true],
            ['code' => 'SAVE15',     'discount_percent' => 15, 'min_spend' => 50,  'is_active' => true],
            ['code' => 'SAVE10',     'discount_percent' => 10, 'min_spend' => 0,   'is_active' => true],
        ];

        foreach ($coupons as $c) {
            Coupon::updateOrCreate(['code' => $c['code']], $c);
        }
    }
}
