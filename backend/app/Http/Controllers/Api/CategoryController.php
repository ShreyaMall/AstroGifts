<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Main (parent) categories — used by Header nav
     * Only returns top-level categories (parent_category = null)
     */
    public function index(): JsonResponse
    {
        $all = Category::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        // Main categories (parent_category is null, empty, or 'None')
        $parents = $all->filter(function ($c) {
            $p = strtolower(trim((string)($c->parent_category ?? '')));
            return $p === '' || $p === 'none' || $p === 'null';
        })->values();

        // Attach subcategories to each parent
        $result = $parents->map(function ($parent) use ($all) {
            $parentSlug = strtolower(trim((string)($parent->slug ?? '')));
            $parentName = strtolower(trim((string)($parent->name ?? '')));

            $subs = $all->filter(function ($c) use ($parentSlug, $parentName) {
                $p = strtolower(trim((string)($c->parent_category ?? '')));
                return $p !== '' && $p !== 'none' && $p !== 'null' && ($p === $parentSlug || $p === $parentName);
            })->values();

            $data = $parent->toArray();
            $data['subcategories'] = $subs->toArray();
            return $data;
        });

        return response()->json([
            'status' => 'success',
            'data'   => $result,
        ]);
    }

    /**
     * All categories flat — used by Admin & dropdowns
     */
    public function all(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $categories,
        ]);
    }

    /**
     * Show single category with its products
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$category) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Category not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $category,
        ]);
    }
}
