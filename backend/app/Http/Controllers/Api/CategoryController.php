<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * List all active categories with product counts
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
     * Show single category with its products
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->with('products')
            ->first();

        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Category not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $category,
        ]);
    }
}
