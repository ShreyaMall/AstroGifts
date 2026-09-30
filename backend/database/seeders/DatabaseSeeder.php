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
        // ── Clear Old Category Data ──
        Category::query()->delete();

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

        // ── 3. Products Catalog (Empty for custom user products) ──
        Product::query()->delete();
        $products = [];

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
                'image' => 'gifts.png',
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
                'image' => 'hero slider1.png',
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
        Post::query()->delete();

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
                'title' => 'Spiritual Home Decor & Fresh Flower Bouquets',
                'slug' => 'spiritual-home-decor-and-fresh-flower-bouquets',
                'category' => 'Home & Decor',
                'excerpt' => 'Elevate your living space with handcrafted brass idols, aromatic candles, and fresh floral decor.',
                'content' => 'Complete guide on arranging fresh flowers, placing feng shui home decor, and creating a peaceful ambiance.',
                'status' => 'Published',
                'date_label' => 'Sep 10, 2026',
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
