<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Color;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Http\Requests\ProductFilterRequest;

class ProductController extends Controller
{

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

        // 1. Category (resolves children + parent, supports multi-category comma-separated)
        if ($request->filled('category')) {
            $rawCats = explode(',', (string) $request->category);
            $catSlugs = array_values(array_filter(array_map('trim', $rawCats)));
            $allSlugs = [];
            foreach ($catSlugs as $slug) {
                $allSlugs[] = $slug;
                $catRecord  = Category::where('slug', $slug)->first();
                $parentSlug = $catRecord?->parent_category ?? null;
                $subSlugs   = Category::where('parent_category', $slug)->pluck('slug')->toArray();
                $allSlugs   = array_merge($allSlugs, $subSlugs);
                if ($parentSlug) {
                    $allSlugs[] = $parentSlug;
                }
            }
            $allSlugs = array_values(array_unique($allSlugs));

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

        // 5. Price (effective price: sale_price if set and lower, else price)
        $min = $request->input('min', $request->input('minPrice'));
        $max = $request->input('max', $request->input('maxPrice'));
        if (($min !== null && $min !== '') || ($max !== null && $max !== '')) {
            if ($excludeField !== 'price') {
                $effPriceExpr = [
                    '$cond' => [
                        [
                            '$and' => [
                                ['$ne' => ['$sale_price', null]],
                                ['$gt' => ['$sale_price', 0]],
                                ['$lt' => ['$sale_price', '$price']],
                            ]
                        ],
                        '$sale_price',
                        '$price'
                    ]
                ];
                $priceExprs = [];
                if ($min !== null && $min !== '') {
                    $priceExprs[] = ['$gte' => [$effPriceExpr, (float) $min]];
                }
                if ($max !== null && $max !== '') {
                    $priceExprs[] = ['$lte' => [$effPriceExpr, (float) $max]];
                }
                $combinedPrice = count($priceExprs) === 1 ? $priceExprs[0] : ['$and' => $priceExprs];
                $match['$expr'] = isset($match['$expr'])
                    ? ['$and' => [$match['$expr'], $combinedPrice]]
                    : $combinedPrice;
            }
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

        // 8. Stock filter (stock=1)
        if ($request->has('stock')) {
            $val = $request->stock;
            if ($val === '1' || $val === 1 || $val === 'true' || $val === true) {
                $match['stock'] = ['$gt' => 0];
            }
        }

        // 9. Search (q or search, searches name and sku)
        $search = $request->input('q', $request->input('search'));
        if ($search !== null && trim($search) !== '') {
            $escaped = preg_quote(trim($search), '/');
            $searchClauses = [
                ['name' => ['$regex' => $escaped, '$options' => 'i']],
                ['sku'  => ['$regex' => $escaped, '$options' => 'i']],
            ];
            if (isset($match['$or'])) {
                $existingOr = $match['$or'];
                unset($match['$or']);
                $match['$and'] = array_merge($match['$and'] ?? [], [
                    ['$or' => $existingOr],
                    ['$or' => $searchClauses],
                ]);
            } else {
                $match['$or'] = $searchClauses;
            }
        }

        // 10. On Sale
        if ($request->boolean('on_sale')) {
            $match['old_price'] = ['$gt' => 0];
        }

        // 11. Discount (computed from old_price & price)
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

    /**
     * Retrieve cached catalog filters metadata (5 min TTL, invalidated on model events).
     */
    public function getCachedFiltersMetadata(): array
    {
        return Cache::remember('catalog_products_filters', 300, function () {
            $effPriceExpr = [
                '$cond' => [
                    [
                        '$and' => [
                            ['$ne' => ['$sale_price', null]],
                            ['$gt' => ['$sale_price', 0]],
                            ['$lt' => ['$sale_price', '$price']],
                        ]
                    ],
                    '$sale_price',
                    '$price'
                ]
            ];

            // 1. Min / Max effective price over active products
            $stats = Product::raw(function ($col) use ($effPriceExpr) {
                return $col->aggregate([
                    ['$match' => ['is_active' => true]],
                    ['$project' => ['effective_price' => $effPriceExpr]],
                    ['$group' => [
                        '_id' => null,
                        'min' => ['$min' => '$effective_price'],
                        'max' => ['$max' => '$effective_price'],
                    ]],
                ]);
            });

            $statsArr = iterator_to_array($stats);
            $priceMin = !empty($statsArr[0]['min']) ? (float) $statsArr[0]['min'] : 0.0;
            $priceMax = !empty($statsArr[0]['max']) ? (float) $statsArr[0]['max'] : 0.0;

            // 2. Categories with active product counts
            $categories = Category::where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            $topLevel = $categories->filter(function ($c) {
                $p = strtolower(trim((string)($c->parent_category ?? '')));
                return $p === '' || $p === 'none' || $p === 'null';
            })->values();

            $parentsToUse = $topLevel->isNotEmpty() ? $topLevel : $categories;

            $categoryList = [];
            foreach ($parentsToUse as $cat) {
                $catSlug = $cat->slug;
                $childSlugs = $categories->filter(function ($c) use ($catSlug) {
                    $p = strtolower(trim((string)($c->parent_category ?? '')));
                    return $p !== '' && $p === strtolower($catSlug);
                })->pluck('slug')->toArray();

                $allSlugs = array_values(array_unique(array_merge([$catSlug], $childSlugs)));

                $count = Product::where('is_active', true)
                    ->where(function ($q) use ($allSlugs) {
                        $q->whereIn('category_slug', $allSlugs)
                          ->orWhereIn('subcategory_slug', $allSlugs);
                    })->count();

                $categoryList[] = [
                    'name'  => (string) $cat->name,
                    'slug'  => (string) $cat->slug,
                    'count' => (int) $count,
                ];
            }

            return [
                'price_min'  => $priceMin,
                'price_max'  => $priceMax,
                'categories' => $categoryList,
            ];
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  index  — paginated filtered product list
    // ─────────────────────────────────────────────────────────────────────────
    public function index(ProductFilterRequest $request): JsonResponse
    {
        $match = $this->buildMatchPipeline($request);

        $query = Product::with('category')->whereRaw($match);

        // Sorting (strict whitelist)
        switch ($request->input('sort', 'newest')) {
            case 'price_asc':
            case 'price-asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
            case 'price-desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'discount':
                $query->orderBy('created_at', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Pagination: default from config, max from config
        $defaultLimit = config('api.default_per_page', 16);
        $maxLimit = config('api.max_per_page', 100);
        $limit = (int) $request->input('per_page', $request->input('limit', $defaultLimit));
        $limit = max(1, min($limit, $maxLimit));

        $products = $query->paginate($limit);

        return response()->json([
            'status'  => 'success',
            'data'    => ProductResource::collection($products->items()),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
            'filters' => $this->getCachedFiltersMetadata(),
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
        $activeColors = Color::where('status', 'Active')->get();
        if ($activeColors->isEmpty()) {
            (new ColorController())->seedDefaults();
            $activeColors = Color::where('status', 'Active')->get();
        }
        $colorHexMap = [];
        foreach ($activeColors as $c) {
            $colorHexMap[strtolower(trim($c->name))] = $c->hex ?? $c->code ?? null;
        }

        $colorCounts = []; // normalizedLower => ['name' => canonical, 'count' => N, 'hex' => ...]
        foreach ($facets['colors_raw'] ?? [] as $row) {
            $row   = (array) $row;
            $names = $this->decodeArrayField($row['raw'] ?? null);
            $cnt   = (int) ($row['count'] ?? 1);

            foreach ($names as $name) {
                $key = strtolower(trim($name));
                if ($key === '') continue;
                if (!isset($colorCounts[$key])) {
                    $hex = $colorHexMap[$key] ?? null;
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
