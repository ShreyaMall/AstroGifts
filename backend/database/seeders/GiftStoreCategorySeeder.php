<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class GiftStoreCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Delete all old furniture categories
        Category::truncate();
        $this->command->info('Old categories removed.');

        // ── SVG Icons ──
        $giftSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';

        $toysSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';

        $starSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

        $diwaliSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6"/><path d="M12 2v6"/><path d="M15 2v6"/><path d="M5 8h14"/><path d="M7 8v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8"/></svg>';

        $bdaySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/></svg>';

        $heartSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

        $softSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>';

        $babySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>';

        $boardSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>';

        $ringSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>';

        $pendantSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6"/><path d="M8 8l4 4 4-4"/><circle cx="12" cy="17" r="4"/></svg>';

        $braceSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 18 0"/><path d="M3 12a9 9 0 0 1 18 0"/></svg>';

        $gemsSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="2" x2="12" y2="22"/><path d="M2 8.5h20"/></svg>';

        $categories = [
            // ══ MAIN: Gifts ══
            [
                'name'             => 'Gifts',
                'slug'             => 'gifts',
                'icon'             => $giftSvg,
                'description'      => 'Curated gifts for every special occasion',
                'parent_category'  => null,
                'sort_order'       => 1,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Diwali Gifts',
                'slug'             => 'diwali-gifts',
                'icon'             => $diwaliSvg,
                'description'      => 'Festive Diwali hampers, diyas and celebration gifts',
                'parent_category'  => 'gifts',
                'sort_order'       => 1,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Birthday Gifts',
                'slug'             => 'birthday-gifts',
                'icon'             => $bdaySvg,
                'description'      => 'Make every birthday unforgettable',
                'parent_category'  => 'gifts',
                'sort_order'       => 2,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Anniversary Gifts',
                'slug'             => 'anniversary-gifts',
                'icon'             => $heartSvg,
                'description'      => 'Celebrate love and togetherness',
                'parent_category'  => 'gifts',
                'sort_order'       => 3,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],

            // ══ MAIN: Toys ══
            [
                'name'             => 'Toys',
                'slug'             => 'toys',
                'icon'             => $toysSvg,
                'description'      => 'Fun and educational toys for all ages',
                'parent_category'  => null,
                'sort_order'       => 2,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Soft Toys',
                'slug'             => 'soft-toys',
                'icon'             => $softSvg,
                'description'      => 'Cuddly stuffed animals and plush toys',
                'parent_category'  => 'toys',
                'sort_order'       => 1,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Baby Toys',
                'slug'             => 'baby-toys',
                'icon'             => $babySvg,
                'description'      => 'Safe and colourful toys for babies and toddlers',
                'parent_category'  => 'toys',
                'sort_order'       => 2,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Board Games',
                'slug'             => 'board-games',
                'icon'             => $boardSvg,
                'description'      => 'Family board games, card games and puzzles',
                'parent_category'  => 'toys',
                'sort_order'       => 3,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],

            // ══ MAIN: Astrology ══
            [
                'name'             => 'Astrology',
                'slug'             => 'astrology',
                'icon'             => $starSvg,
                'description'      => 'Healing crystals, gemstones and astrology jewellery',
                'parent_category'  => null,
                'sort_order'       => 3,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Rings',
                'slug'             => 'rings',
                'icon'             => $ringSvg,
                'description'      => 'Astrological and gemstone rings for every planet',
                'parent_category'  => 'astrology',
                'sort_order'       => 1,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Pendants',
                'slug'             => 'pendants',
                'icon'             => $pendantSvg,
                'description'      => 'Spiritual pendants and sacred geometry necklaces',
                'parent_category'  => 'astrology',
                'sort_order'       => 2,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Bracelets',
                'slug'             => 'bracelets',
                'icon'             => $braceSvg,
                'description'      => 'Crystal healing and rudraksha bracelets',
                'parent_category'  => 'astrology',
                'sort_order'       => 3,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
            [
                'name'             => 'Gemstones & Crystals',
                'slug'             => 'gemstones-crystals',
                'icon'             => $gemsSvg,
                'description'      => 'Natural healing gemstones and raw crystals',
                'parent_category'  => 'astrology',
                'sort_order'       => 4,
                'is_active'        => true,
                'show_in_menu'     => true,
                'status'           => 'Active',
            ],
        ];

        foreach ($categories as $catData) {
            Category::create($catData);
            $label = $catData['parent_category']
                ? "   ↳ {$catData['name']} (sub of: {$catData['parent_category']})"
                : "✓  {$catData['name']} [MAIN]";
            $this->command->line($label);
        }

        $this->command->info("\nDone! " . count($categories) . " categories created successfully.");
    }
}

