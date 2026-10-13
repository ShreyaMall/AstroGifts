<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class ProductCatalogTest extends TestCase
{
    /**
     * Test GET /api/products returns 200, default pagination (16), data and filters block.
     */
    public function test_can_get_products_with_no_params_and_default_filters(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'price',
                        'sale_price',
                        'image',
                        'in_stock',
                        'category' => [
                            'name',
                            'slug',
                        ],
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
                'filters' => [
                    'price_min',
                    'price_max',
                    'categories' => [
                        '*' => [
                            'name',
                            'slug',
                            'count',
                        ]
                    ]
                ]
            ]);

        $this->assertEquals('success', $response->json('status'));
        $this->assertLessThanOrEqual(16, count($response->json('data')));
        $this->assertGreaterThan(0, $response->json('meta.total'));
    }

    /**
     * Test filtering by a single category slug.
     */
    public function test_filter_by_single_category(): void
    {
        $response = $this->getJson('/api/products?category=toys');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);

        // Every returned item should belong to toys or its subcategories
        $toyCategories = ['toys', 'soft-toys', 'board-games', 'baby-toys'];
        foreach ($data as $item) {
            $catSlug = $item['category_slug'] ?? $item['category']['slug'] ?? '';
            $subSlug = $item['subcategory_slug'] ?? '';
            $this->assertTrue(
                in_array($catSlug, $toyCategories) || in_array($subSlug, $toyCategories),
                "Expected item {$item['name']} to belong to toys hierarchy"
            );
        }
    }

    /**
     * Test filtering by multiple categories (comma-separated).
     */
    public function test_filter_by_multiple_categories(): void
    {
        $response = $this->getJson('/api/products?category=toys,flowers');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);

        $allowedSlugs = ['toys', 'soft-toys', 'board-games', 'baby-toys', 'flowers'];
        foreach ($data as $item) {
            $catSlug = $item['category_slug'] ?? $item['category']['slug'] ?? '';
            $subSlug = $item['subcategory_slug'] ?? '';
            $this->assertTrue(
                in_array($catSlug, $allowedSlugs) || in_array($subSlug, $allowedSlugs),
                "Expected item {$item['name']} to belong to toys or flowers"
            );
        }
    }

    /**
     * Test filtering by price range (min, max).
     */
    public function test_filter_by_price_range(): void
    {
        $response = $this->getJson('/api/products?min=200&max=500');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);

        foreach ($data as $item) {
            $effectivePrice = ($item['sale_price'] !== null && $item['sale_price'] < $item['price'])
                ? $item['sale_price']
                : $item['price'];

            $this->assertGreaterThanOrEqual(200, $effectivePrice);
            $this->assertLessThanOrEqual(500, $effectivePrice);
        }
    }

    /**
     * Test filtering by in-stock products (stock=1).
     */
    public function test_filter_by_in_stock(): void
    {
        $response = $this->getJson('/api/products?stock=1');

        $response->assertStatus(200);
        $data = $response->json('data');

        foreach ($data as $item) {
            $this->assertTrue($item['in_stock']);
            $this->assertGreaterThan(0, $item['stock']);
        }
    }

    /**
     * Test searching by query (q) across name and sku.
     */
    public function test_search_by_name_and_sku(): void
    {
        $product = Product::where('is_active', true)->first();
        $this->assertNotNull($product);

        $searchTerm = substr($product->name, 0, 5);
        $response = $this->getJson('/api/products?q=' . urlencode($searchTerm));

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);

        $names = array_column($data, 'name');
        $this->assertContains($product->name, $names);
    }

    /**
     * Test sorting whitelist: newest, price_asc, price_desc, name_asc.
     */
    public function test_each_sort_option(): void
    {
        // 1. Price Ascending
        $resAsc = $this->getJson('/api/products?sort=price_asc&per_page=48');
        $resAsc->assertStatus(200);
        $dataAsc = $resAsc->json('data');
        $pricesAsc = array_column($dataAsc, 'price');
        $sortedAsc = $pricesAsc;
        sort($sortedAsc, SORT_NUMERIC);
        $this->assertEquals($sortedAsc, $pricesAsc, 'Products should be sorted by price ascending');

        // 2. Price Descending
        $resDesc = $this->getJson('/api/products?sort=price_desc&per_page=48');
        $resDesc->assertStatus(200);
        $dataDesc = $resDesc->json('data');
        $pricesDesc = array_column($dataDesc, 'price');
        $sortedDesc = $pricesDesc;
        rsort($sortedDesc, SORT_NUMERIC);
        $this->assertEquals($sortedDesc, $pricesDesc, 'Products should be sorted by price descending');

        // 3. Name Ascending
        $resName = $this->getJson('/api/products?sort=name_asc&per_page=48');
        $resName->assertStatus(200);
        $dataName = $resName->json('data');
        $names = array_column($dataName, 'name');
        $sortedNames = $names;
        natcasesort($sortedNames);
        $this->assertEquals(array_values($sortedNames), array_values($names), 'Products should be sorted by name A-Z');

        // 4. Newest (default)
        $resNewest = $this->getJson('/api/products?sort=newest');
        $resNewest->assertStatus(200);
    }

    /**
     * Test pagination parameters (page, per_page cap at 48).
     */
    public function test_pagination_and_meta(): void
    {
        $response = $this->getJson('/api/products?page=1&per_page=5');

        $response->assertStatus(200);
        $meta = $response->json('meta');
        $this->assertEquals(1, $meta['current_page']);
        $this->assertEquals(5, $meta['per_page']);
        $this->assertCount(5, $response->json('data'));
    }

    /**
     * Test invalid parameters return 422 Unprocessable Entity.
     */
    public function test_invalid_parameters_return_422(): void
    {
        // Invalid sort not in whitelist
        $this->getJson('/api/products?sort=invalid_column')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sort']);

        // min > max
        $this->getJson('/api/products?min=500&max=200')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['min', 'max']);

        // per_page exceeds cap from config (default 100)
        $maxPerPage = config('api.max_per_page', 100);
        $this->getJson('/api/products?per_page=' . ($maxPerPage + 1))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['per_page']);

        // non-numeric min
        $this->getJson('/api/products?min=abc')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['min']);
    }

    /**
     * Test inactive products are never returned.
     */
    public function test_inactive_products_are_hidden(): void
    {
        // Create a temporary inactive product
        $inactive = Product::create([
            'name' => 'Inactive Secret Test Product',
            'slug' => 'inactive-secret-test-product',
            'price' => 199.0,
            'is_active' => false,
            'status' => 'Draft',
            'category_slug' => 'gifts',
        ]);

        try {
            $response = $this->getJson('/api/products?q=Inactive+Secret');
            $response->assertStatus(200);

            $ids = array_column($response->json('data'), 'slug');
            $this->assertNotContains('inactive-secret-test-product', $ids);
        } finally {
            $inactive->delete();
        }
    }

    /**
     * Test filters block is cached and invalidated when a category or product changes.
     */
    public function test_filters_cache_and_observer_invalidation(): void
    {
        Cache::forget('catalog_products_filters');

        // First call populates cache
        $res1 = $this->getJson('/api/products');
        $res1->assertStatus(200);
        $this->assertTrue(Cache::has('catalog_products_filters'));

        // Creating a new product triggers observer to forget cache
        $newProduct = Product::create([
            'name' => 'Temporary Observer Test Item',
            'slug' => 'temp-observer-test-item',
            'price' => 99.0,
            'is_active' => true,
            'status' => 'Active',
            'category_slug' => 'gifts',
        ]);

        try {
            $this->assertFalse(Cache::has('catalog_products_filters'), 'Cache should be invalidated after product creation');
        } finally {
            $newProduct->delete();
        }
    }
}
