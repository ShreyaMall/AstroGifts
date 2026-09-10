<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Post;
use App\Models\Product;
use App\Models\Slider;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Dashboard overview statistics & recent orders
     */
    public function stats(): JsonResponse
    {
        $totalRevenue = Order::where('status', '!=', 'Cancelled')->sum('total');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalUsers = User::count();

        $recentOrders = Order::with('items')
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        $categories = Category::withCount('products')->get();
        $topSellingProducts = Product::where('is_bestseller', true)->take(5)->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    [
                        'label' => 'Total Revenue',
                        'value' => '₹' . number_format($totalRevenue, 2),
                        'raw_value' => $totalRevenue,
                        'delta' => '+12.4%',
                        'icon' => '💰',
                        'color' => '#d96b27',
                    ],
                    [
                        'label' => 'Total Orders',
                        'value' => number_format($totalOrders),
                        'raw_value' => $totalOrders,
                        'delta' => '+8.1%',
                        'icon' => '📦',
                        'color' => '#2563eb',
                    ],
                    [
                        'label' => 'Total Products',
                        'value' => number_format($totalProducts),
                        'raw_value' => $totalProducts,
                        'delta' => '+3.5%',
                        'icon' => '🪑',
                        'color' => '#16a34a',
                    ],
                    [
                        'label' => 'Total Users',
                        'value' => number_format($totalUsers),
                        'raw_value' => $totalUsers,
                        'delta' => '+21.3%',
                        'icon' => '👥',
                        'color' => '#7c3aed',
                    ],
                ],
                'recent_orders' => $recentOrders,
                'categories' => $categories,
                'top_products' => $topSellingProducts,
            ],
        ]);
    }

    /**
     * All orders with filtering
     */
    public function orders(Request $request): JsonResponse
    {
        $query = Order::with('items')->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $orders = $query->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:Pending,Processing,Shipped,Delivered,Cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;

        if ($request->status === 'Delivered') {
            $order->payment_status = 'paid';
        }

        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Order {$order->order_number} status updated to {$order->status}",
            'data' => $order,
        ]);
    }

    /**
     * Product inventory list
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::with('category')->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%");
        }

        $products = $query->paginate(30);

        return response()->json([
            'status' => 'success',
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Add new product
     */
    public function storeProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_slug' => 'required|string',
            'price' => 'required|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string',
            'material' => 'nullable|string',
            'color' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $category = Category::where('slug', $validated['category_slug'])->first();

        $product = Product::create([
            'category_id' => $category?->id,
            'category_slug' => $validated['category_slug'],
            'category_name' => $category?->name ?? ucfirst($validated['category_slug']),
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(4),
            'price' => $validated['price'],
            'old_price' => $validated['old_price'] ?? null,
            'brand' => $validated['brand'] ?? 'WoodMart',
            'material' => $validated['material'] ?? 'Wood',
            'color' => $validated['color'] ?? 'Natural',
            'colors' => ['#1c1c1c', '#c8a870'],
            'stock' => $validated['stock'] ?? 50,
            'sku' => 'WM-' . strtoupper(Str::random(6)),
            'image' => $validated['image'] ?? 'chair1.jpg',
            'description' => $validated['description'] ?? 'Premium furniture item.',
            'is_active' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => $product,
        ], 201);
    }

    /**
     * Update stock / product info
     */
    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'price' => 'nullable|numeric',
            'old_price' => 'nullable|numeric',
            'stock' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'is_bestseller' => 'nullable|boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => $product,
        ]);
    }

    /**
     * Delete product
     */
    public function deleteProduct(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Get categories list for admin
     */
    public function categories(): JsonResponse
    {
        $categories = Category::withCount('products')->get();
        return response()->json(['status' => 'success', 'data' => $categories]);
    }

    /**
     * Get sliders list for admin
     */
    public function sliders(): JsonResponse
    {
        $sliders = Slider::orderBy('sort_order', 'asc')->get();
        return response()->json(['status' => 'success', 'data' => $sliders]);
    }

    /**
     * Get posts list for admin
     */
    public function posts(): JsonResponse
    {
        $posts = Post::orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $posts]);
    }

    /**
     * Get all users for admin dashboard
     */
    public function users(): JsonResponse
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $users]);
    }
}
