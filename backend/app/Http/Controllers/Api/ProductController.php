<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * List products with flexible filtering and sorting
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::where('is_active', true);

        // Filter by category slug
        if ($request->filled('category')) {
            $query->where('category_slug', $request->category);
        }

        // Filter by brand
        if ($request->filled('brand')) {
            $brands = is_array($request->brand) ? $request->brand : explode(',', $request->brand);
            $query->whereIn('brand', $brands);
        }

        // Filter by material
        if ($request->filled('material')) {
            $materials = is_array($request->material) ? $request->material : explode(',', $request->material);
            $query->whereIn('material', $materials);
        }

        // Filter by color
        if ($request->filled('color')) {
            $colors = is_array($request->color) ? $request->color : explode(',', $request->color);
            $query->whereIn('color', $colors);
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        // Filter by search keyword
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('category_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by sale items
        if ($request->boolean('on_sale')) {
            $query->whereNotNull('old_price')->where('old_price', '>', 'price');
        }

        // Sorting
        $sort = $request->get('sort', 'default');
        switch ($sort) {
            case 'price-asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price-desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'name-asc':
                $query->orderBy('name', 'asc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('id', 'asc');
                break;
        }

        $perPage = $request->get('per_page', 50);
        $products = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Bestseller products for the homepage
     */
    public function bestsellers(): JsonResponse
    {
        $products = Product::where('is_active', true)
            ->where('is_bestseller', true)
            ->take(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    /**
     * Featured products
     */
    public function featured(): JsonResponse
    {
        $products = Product::where('is_active', true)
            ->where('is_featured', true)
            ->take(12)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    /**
     * Single product details
     */
    public function show(string $identifier): JsonResponse
    {
        $product = Product::where('is_active', true)
            ->where(function ($q) use ($identifier) {
                $q->where('id', $identifier)
                  ->orWhere('slug', $identifier);
            })
            ->first();

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }
}
