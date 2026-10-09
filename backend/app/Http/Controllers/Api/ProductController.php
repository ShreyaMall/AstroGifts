<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\ProductFilterRequest;

class ProductController extends Controller
{
    /**
     * Hex map for known color names (case-insensitive lookup).
     */
    private const COLOR_HEX_MAP = [
        'red'        => '#FF0000',
        'blue'       => '#0000FF',
        'brown'      => '#8B4513',
        'black'      => '#000000',
        'white'      => '#FFFFFF',
        'green'      => '#008000',
        'gold'       => '#FFD700',
        'silver'     => '#C0C0C0',
        'pink'       => '#FFC0CB',
        'purple'     => '#800080',
        'yellow'     => '#FFFF00',
        'grey'       => '#808080',
        'gray'       => '#808080',
        'orange'     => '#FFA500',
        'navy'       => '#000080',
        'beige'      => '#F5F5DC',
        'maroon'     => '#800000',
        'cream'      => '#FFFDD0',
        'off-white'  => '#FAF9F6',
    ];

    /**
     * Decode the colors/occasions field which may be stored as a JSON string
     * or already as an array. Returns a flat array of trimmed non-empty strings.
     */
    private function decodeArrayField(mixed $value): array
    {
        if (is_null($value)) {
            return [];
        }
        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value), fn($v) => $v !== ''));
        }
        if (is_string($value)) {
            $trimmed = trim($value);
            // Try JSON decode first
            $decoded = json_decode($trimmed, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded), fn($v) => $v !== ''));
            }
            // Non-JSON non-empty string → treat as single value
            if ($trimmed !== '' && $trimmed !== '[]' && $trimmed !== 'null') {
                return [$trimmed];
            }
        }
        return [];
    }

    /**
     * Build regex conditions for a JSON-string array field (colors / occasions).
     * Each requested value becomes a regex that matches the name inside the JSON string,
     * but also works if the field is a real array (MongoDB $in on array field works natively).
     */
    private function buildStringArrayCondition(array $values): array
    {
        // Build $or: either the field IS an array containing the value (real array stored),
        // OR the field is a string that contains the value (JSON-string stored).
        $orClauses = [];
        foreach ($values as $v) {
            $escaped = preg_quote(trim($v), '/');
            $orClauses[] = ['colors' => ['$regex' => $escaped, '$options' => 'i']];
        }
        // Also handle real array storage
        $orClauses[] = ['colors' => ['$in' => $values]];
        return ['$or' => $orClauses];
    }

    /**
     * Helper to build the $match stage for product filtering.
     * Pass $excludeField to build the "all-except-self" match for facet counting.
     */
    private function buildMatchPipeline(ProductFilterRequest $request, ?string $excludeField = null): array
    {
        $match = ['is_active' => true];

        // 1. Category (resolves children + parent so /category/gifts and /category/diwali-gifts both work)
        if ($request->filled('category')) {
            $catSlug    = $request->category;
            $catRecord  = Category::where('slug', $catSlug)->first();
            $parentSlug = $catRecord?->parent_category ?? null;
            $subSlugs   = Category::where('parent_category', $catSlug)->pluck('slug')->toArray();

            $allSlugs = array_values(array_unique(array_merge([$catSlug], $subSlugs)));
            if ($parentSlug) {
                $allSlugs[] = $parentSlug;
                $allSlugs   = array_values(array_unique($allSlugs));
            }

            // Match: category_slug OR subcategory_slug in the resolved slug list
            $match['$or'] = [
                ['category_slug'    => ['$in' => $allSlugs]],
                ['subcategory_slug' => ['$in' => $allSlugs]],
            ];
        }

        // 2. Subcategory (explicit URL param)
        if ($request->filled('subcategory') && $excludeField !== 'subcategory') {
            $subs = is_array($request->subcategory)
                ? $request->subcategory
                : explode(',', $request->subcategory);
            $match['subcategory_slug'] = ['$in' => $subs];
        }

        // 3. Brand
        if ($request->filled('brand') && $excludeField !== 'brand') {
            $brands = is_array($request->brand) ? $request->brand : explode(',', $request->brand);
            $match['brand'] = ['$in' => $brands];
        }

        // 4. Color — colors may be stored as a JSON string "[\"Black\"]" or a real array.
        //    Use regex so both formats match.
        if ($request->filled('color') && $excludeField !== 'color') {
            $colors = is_array($request->color)
                ? $request->color
                : array_map('trim', explode(',', $request->color));

            $colorClauses = [];
            foreach ($colors as $c) {
                $escaped = preg_quote($c, '/');
                // Matches JSON-string storage AND real-array storage
                $colorClauses[] = ['colors' => ['$regex' => $escaped, '$options' => 'i']];
            }
            if (count($colorClauses) === 1) {
                $match = array_merge($match, $colorClauses[0]);
            } else {
                $match['$or'] = array_merge($match['$or'] ?? [], $colorClauses);
            }
        }

        // 5. Price
        if (($request->filled('minPrice') || $request->filled('maxPrice')) && $excludeField !== 'price') {
            $match['price'] = [];
            if ($request->filled('minPrice')) $match['price']['$gte'] = (float) $request->minPrice;
            if ($request->filled('maxPrice')) $match['price']['$lte'] = (float) $request->maxPrice;
        }

        // 6. Rating
        if ($request->filled('rating') && $excludeField !== 'rating') {
            $match['rating'] = ['$gte' => (float) $request->rating];
        }

        // 7. Occasion — same JSON-string-or-array problem as colors
        if ($request->filled('occasion') && $excludeField !== 'occasion') {
            $occasions = is_array($request->occasion)
                ? $request->occasion
                : array_map('trim', explode(',', $request->occasion));

            $occClauses = [];
            foreach ($occasions as $o) {
                $escaped = preg_quote($o, '/');
                $occClauses[] = ['occasions' => ['$regex' => $escaped, '$options' => 'i']];
            }
            if (count($occClauses) === 1) {
                $match = array_merge($match, $occClauses[0]);
            } else {
                $existing = $match['$or'] ?? [];
                $match['$or'] = array_merge($existing, $occClauses);
            }
        }

        // 8. Search
        if ($request->filled('search')) {
            $match['name'] = ['$regex' => $request->search, '$options' => 'i'];
        }

        // 9. On Sale
        if ($request->boolean('on_sale')) {
            $match['old_price'] = ['$gt' => 0];
        }

        // 10. Discount (computed from old_price & price)
        if ($request->filled('discount') && $excludeField !== 'discount') {
            $multiplier   = 1 - ((float) $request->discount / 100);
            $discountExpr = [
                '$and' => [
                    ['$gt'  => ['$old_price', 0]],
                    ['$lte' => ['$price', ['$multiply' => ['$old_price', $multiplier]]]],
                ],
            ];
            $match['$expr'] = isset($match['$expr'])
                ? ['$and' => [$match['$expr'], $discountExpr]]
                : $discountExpr;
        }

        return $match;
    }

    /**
     * Decode a raw "colors" or "occasions" value that the MongoDB driver returns.
     * It might be a BSON string, BSON array, PHP array, or null.
     */
    private function decodeRawField(mixed $raw): array
    {
        return $this->decodeArrayField($raw);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  index  — paginated filtered product list
    // ─────────────────────────────────────────────────────────────────────────
    public function index(ProductFilterRequest $request): JsonResponse
    {
        $match = $this->buildMatchPipeline($request);

        $query = Product::whereRaw($match);

        // Sorting
        switch ($request->get('sort', 'default')) {
            case 'price-asc':  $query->orderBy('price', 'asc');      break;
            case 'price-desc': $query->orderBy('price', 'desc');     break;
            case 'rating':     $query->orderBy('rating', 'desc');    break;
            case 'newest':     $query->orderBy('created_at', 'desc'); break;
            case 'discount':   $query->orderBy('created_at', 'desc'); break;
            default:           $query->orderBy('id', 'asc');         break;
        }

        $limit    = min((int) $request->get('limit', $request->get('per_page', 50)), 50);
        $products = $query->paginate($limit);
        $items    = $products->items();

        // Append computed_discount to each item
        foreach ($items as $item) {
            $item->computed_discount = ($item->old_price && $item->old_price > $item->price)
                ? round((($item->old_price - $item->price) / $item->old_price) * 100)
                : 0;
        }

        return response()->json([
            'status' => 'success',
            'data'   => $items,
            'meta'   => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  facets  — dynamic filter options via MongoDB aggregation
    // ─────────────────────────────────────────────────────────────────────────
    public function facets(ProductFilterRequest $request): JsonResponse
    {
        $matchCat      = $this->buildMatchPipeline($request, 'subcategory');
        $matchBrand    = $this->buildMatchPipeline($request, 'brand');
        $matchColor    = $this->buildMatchPipeline($request, 'color');
        $matchPrice    = $this->buildMatchPipeline($request, 'price');
        $matchDiscount = $this->buildMatchPipeline($request, 'discount');
        $matchOccasion = $this->buildMatchPipeline($request, 'occasion');

        // ── MongoDB aggregation ───────────────────────────────────────────────
        // Colors & occasions are stored as JSON STRINGS ("[\"Black\"]"), so we
        // cannot use $unwind inside MongoDB — we group by the raw field value
        // and decode/expand in PHP afterwards.
        $pipeline = [
            ['$facet' => [

                // Categories: prefer subcategory_slug/name (the leaf), fall back to category_slug/name
                'categories' => [
                    ['$match' => $matchCat],
                    ['$group' => [
                        '_id' => [
                            'slug' => ['$ifNull' => ['$subcategory_slug', '$category_slug']],
                            'name' => ['$ifNull' => ['$subcategory_name', '$category_name']],
                        ],
                        'count' => ['$sum' => 1],
                    ]],
                    ['$match' => ['_id.slug' => ['$ne' => null]]],
                    ['$project' => ['_id' => 0, 'slug' => '$_id.slug', 'name' => '$_id.name', 'count' => 1]],
                    ['$sort' => ['count' => -1]],
                ],

                // Brands: simple group
                'brands' => [
                    ['$match' => $matchBrand],
                    ['$match' => ['brand' => ['$nin' => [null, '']]]],
                    ['$group' => ['_id' => '$brand', 'count' => ['$sum' => 1]]],
                    ['$project' => ['_id' => 0, 'name' => '$_id', 'count' => 1]],
                    ['$sort' => ['count' => -1]],
                ],

                // Colors: group by raw field → PHP will decode JSON strings
                'colors_raw' => [
                    ['$match' => $matchColor],
                    ['$match' => ['colors' => ['$nin' => [null, '', '[]', 'null']]]],
                    ['$group' => ['_id' => '$colors', 'count' => ['$sum' => 1]]],
                    ['$project' => ['_id' => 0, 'raw' => '$_id', 'count' => 1]],
                ],

                // Occasions: group by raw field → PHP will decode JSON strings
                'occasions_raw' => [
                    ['$match' => $matchOccasion],
                    ['$match' => ['occasions' => ['$nin' => [null, '', '[]', 'null']]]],
                    ['$group' => ['_id' => '$occasions', 'count' => ['$sum' => 1]]],
                    ['$project' => ['_id' => 0, 'raw' => '$_id', 'count' => 1]],
                ],

                // Price stats
                'price_stats' => [
                    ['$match' => $matchPrice],
                    ['$group' => ['_id' => null, 'min' => ['$min' => '$price'], 'max' => ['$max' => '$price']]],
                    ['$project' => ['_id' => 0, 'min' => 1, 'max' => 1]],
                ],

                // Discount buckets
                'discounts' => [
                    ['$match' => $matchDiscount],
                    ['$project' => [
                        'discount' => [
                            '$cond' => [
                                ['$and' => [
                                    ['$gt' => ['$old_price', 0]],
                                    ['$gt' => ['$old_price', '$price']],
                                ]],
                                ['$multiply' => [
                                    ['$divide' => [['$subtract' => ['$old_price', '$price']], '$old_price']],
                                    100,
                                ]],
                                0,
                            ],
                        ],
                    ]],
                    ['$group' => [
                        '_id' => null,
                        '10'  => ['$sum' => ['$cond' => [['$gte' => ['$discount', 10]], 1, 0]]],
                        '20'  => ['$sum' => ['$cond' => [['$gte' => ['$discount', 20]], 1, 0]]],
                        '30'  => ['$sum' => ['$cond' => [['$gte' => ['$discount', 30]], 1, 0]]],
                        '40'  => ['$sum' => ['$cond' => [['$gte' => ['$discount', 40]], 1, 0]]],
                        '50'  => ['$sum' => ['$cond' => [['$gte' => ['$discount', 50]], 1, 0]]],
                        '60'  => ['$sum' => ['$cond' => [['$gte' => ['$discount', 60]], 1, 0]]],
                        '70'  => ['$sum' => ['$cond' => [['$gte' => ['$discount', 70]], 1, 0]]],
                    ]],
                    ['$project' => ['_id' => 0]],
                ],
            ]],
        ];

        $results = Product::raw(fn($col) => $col->aggregate($pipeline));
        $raw     = iterator_to_array($results);
        $facets  = $raw[0] ?? [];

        // ── Post-process: colors (JSON-string → individual names + hex) ───────
        $colorCounts = []; // normalizedLower => ['name' => canonical, 'count' => N, 'hex' => ...]
        foreach ($facets['colors_raw'] ?? [] as $row) {
            $row   = (array) $row;
            $names = $this->decodeArrayField($row['raw'] ?? null);
            $cnt   = (int) ($row['count'] ?? 1);

            foreach ($names as $name) {
                $key = strtolower(trim($name));
                if ($key === '') continue;
                if (!isset($colorCounts[$key])) {
                    $hex = self::COLOR_HEX_MAP[$key] ?? null;
                    $colorCounts[$key] = ['name' => trim($name), 'hex' => $hex, 'count' => 0];
                }
                $colorCounts[$key]['count'] += $cnt;
            }
        }
        usort($colorCounts, fn($a, $b) => $b['count'] - $a['count']);
        $facets['colors'] = array_values($colorCounts);
        unset($facets['colors_raw']);

        // ── Post-process: occasions (JSON-string → individual names) ──────────
        $occCounts = []; // normalizedLower => ['name' => ..., 'count' => N]
        foreach ($facets['occasions_raw'] ?? [] as $row) {
            $row   = (array) $row;
            $names = $this->decodeArrayField($row['raw'] ?? null);
            $cnt   = (int) ($row['count'] ?? 1);

            foreach ($names as $name) {
                $key = strtolower(trim($name));
                if ($key === '') continue;
                if (!isset($occCounts[$key])) {
                    $occCounts[$key] = ['name' => trim($name), 'count' => 0];
                }
                $occCounts[$key]['count'] += $cnt;
            }
        }
        usort($occCounts, fn($a, $b) => $b['count'] - $a['count']);
        $facets['occasions'] = array_values($occCounts);
        unset($facets['occasions_raw']);

        // ── Post-process: discount buckets ────────────────────────────────────
        $discountFormatted = [];
        if (!empty($facets['discounts'][0])) {
            $d = (array) $facets['discounts'][0];
            foreach ([70, 60, 50, 40, 30, 20, 10] as $pct) {
                $c = (int) ($d[(string) $pct] ?? 0);
                if ($c > 0) {
                    $discountFormatted[] = ['name' => "{$pct}% and above", 'value' => $pct, 'count' => $c];
                }
            }
        }
        $facets['discounts'] = $discountFormatted;

        // ── Fallback for price_stats ──────────────────────────────────────────
        if (empty($facets['price_stats'])) {
            $facets['price_stats'] = [['min' => 0, 'max' => 0]];
        }

        return response()->json([
            'status' => 'success',
            'facets' => $facets,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Existing endpoints — unchanged
    // ─────────────────────────────────────────────────────────────────────────

    public function bestsellers(): JsonResponse
    {
        $products = Product::where('is_active', true)
            ->where('is_bestseller', true)
            ->take(12)
            ->get();

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function featured(): JsonResponse
    {
        $products = Product::where('is_active', true)
            ->where('is_featured', true)
            ->take(12)
            ->get();

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function show(string $identifier): JsonResponse
    {
        $product = Product::find($identifier)
            ?? Product::where('_id', $identifier)->first()
            ?? Product::where('id', $identifier)->first()
            ?? Product::where('slug', $identifier)->first();

        if (!$product) {
            $product = Product::where('name', 'like', "%{$identifier}%")->first();
        }

        if (!$product) {
            return response()->json(['status' => 'error', 'message' => 'Product not found'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $product]);
    }
}
