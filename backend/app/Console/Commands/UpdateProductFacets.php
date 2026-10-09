<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Category;

class UpdateProductFacets extends Command
{
    protected $signature = 'products:update-facets {--dry-run : Only show what would be updated}';

    protected $description = 'Add subcategory_slug/subcategory_name and occasions to products. NEVER modifies category_id/category_slug/category_name.';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info("--- DRY RUN MODE: No database changes will be made ---\n");
        }

        // 1. Indexes
        $this->info("1. MongoDB Indexes...");
        if (!$dryRun) {
            Product::raw(function ($collection) {
                $collection->createIndex(['category_slug'    => 1]);
                $collection->createIndex(['subcategory_slug' => 1]);
                $collection->createIndex(['brand'            => 1]);
                $collection->createIndex(['colors'           => 1]);
                $collection->createIndex(['price'            => 1]);
                $collection->createIndex(['rating'           => -1]);
                $collection->createIndex(['created_at'       => -1]);
                return true;
            });
            $this->info("   Indexes created.\n");
        } else {
            $this->info("   [Dry Run] Would create indexes on: category_slug, subcategory_slug, brand, colors, price, rating, created_at\n");
        }

        // 2. Build a full in-memory category map once (slug => Category)
        $this->info("2. Processing Products...\n");
        $categoryMap = Category::all()->keyBy('slug');

        $products     = Product::all();
        $updatedCount = 0;

        foreach ($products as $product) {
            $updates = [];

            // ── 2A. subcategory_slug / subcategory_name ────────────────────────────
            // Only add when missing. NEVER touch category_slug / category_name / category_id.
            if (empty($product->subcategory_slug)) {
                $cat = $categoryMap->get($product->category_slug);
                // Only set if this category is itself a child (has a parent)
                if ($cat && !empty($cat->parent_category)) {
                    $updates['subcategory_slug'] = $cat->slug;       // e.g. "diwali-gifts"
                    $updates['subcategory_name'] = $cat->name;       // e.g. "Diwali Gifts"
                    // Note: category_slug / category_id / category_name are NOT touched.
                }
            }

            // ── 2B. occasions (only add the empty array if the field is missing) ──
            if ($product->occasions === null) {
                $updates['occasions'] = [];
            }

            // ── Apply ─────────────────────────────────────────────────────────────
            if (!empty($updates)) {
                if ($dryRun) {
                    $this->line("   Product: \"{$product->name}\"  (ID: {$product->_id})");
                    $this->line("   category_slug kept as-is: \"{$product->category_slug}\"");
                    foreach ($updates as $k => $v) {
                        $valStr = is_array($v) ? json_encode($v) : $v;
                        $this->line("   + ADD  {$k}: {$valStr}");
                    }
                    $this->line("");
                } else {
                    $product->update($updates);
                }
                $updatedCount++;
            }
        }

        if ($dryRun) {
            $this->info("--- DRY RUN COMPLETE ---");
            $this->info("Products that would be updated: {$updatedCount}  (only new fields added)");
            $this->info("Run without --dry-run to apply.");
        } else {
            $this->info("--- DONE ---");
            $this->info("Products updated: {$updatedCount}");
        }
    }
}
