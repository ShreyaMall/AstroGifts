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
use Illuminate\Support\Facades\Mail;
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
            ->take(20)
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
    public function updateOrderStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status'          => 'required|string|in:Pending,Processing,Shipped,Delivered,Return Requested,Return Approved,Return Rejected,Exchange Requested,Exchange Approved,Refunded,Cancelled',
            'tracking_number' => 'nullable|string',
            'courier_name'    => 'nullable|string',
            'tracking_url'    => 'nullable|string',
            'refund_amount'   => 'nullable|numeric|min:0',
        ]);

        $order = Order::find($id) 
            ?? Order::where('_id', $id)->first() 
            ?? Order::where('order_number', $id)->firstOrFail();

        $oldStatus = $order->status;
        $order->status = $validated['status'];

        if (isset($validated['tracking_number'])) {
            $order->tracking_number = $validated['tracking_number'];
        }
        if (isset($validated['courier_name'])) {
            $order->courier_name = $validated['courier_name'];
        }
        if (isset($validated['tracking_url'])) {
            $order->tracking_url = $validated['tracking_url'];
        }

        if ($validated['status'] === 'Delivered') {
            $order->payment_status = 'paid';
        }

        if ($validated['status'] === 'Return Approved') {
            $order->return_status = 'Approved';
        } elseif ($validated['status'] === 'Return Rejected') {
            $order->return_status = 'Rejected';
        } elseif ($validated['status'] === 'Exchange Approved') {
            $order->return_status = 'Exchange Approved';
        }

        if ($validated['status'] === 'Refunded') {
            $refAmt = !empty($validated['refund_amount']) ? (float)$validated['refund_amount'] : (float)$order->total;
            $order->refund_amount = $refAmt;
            $order->refunded_at = now();
            $order->payment_status = 'refunded';
        }

        if (in_array($validated['status'], ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])) {
            $order->return_type = null;
            $order->return_reason = null;
            $order->return_notes = null;
            $order->return_status = null;
            $order->return_bank_details = null;
        }

        $order->save();
        $order->load('items');

        // If order was cancelled, restore product stock
        if ($validated['status'] === 'Cancelled' && $oldStatus !== 'Cancelled') {
            try {
                foreach ($order->items as $oItem) {
                    $prod = null;
                    if (!empty($oItem->product_id)) {
                        $prod = Product::find($oItem->product_id) ?? Product::where('_id', $oItem->product_id)->first();
                    }
                    if (!$prod && !empty($oItem->product_name)) {
                        $prod = Product::where('name', $oItem->product_name)->first();
                    }
                    if ($prod) {
                        $prod->stock = (int)($prod->stock ?? 0) + (int)($oItem->quantity ?? 1);
                        $prod->in_stock = true;
                        $prod->save();
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Stock restoration failed: ' . $e->getMessage());
            }
        }

        // Automated status emails to Customer
        try {
            dispatch(function () use ($validated, $order) {
                if ($validated['status'] === 'Shipped' && !empty($order->email)) {
                    Mail::to($order->email)->send(new \App\Mail\OrderShippedMail($order));
                } elseif ($validated['status'] === 'Delivered' && !empty($order->email)) {
                    Mail::to($order->email)->send(new \App\Mail\OrderDeliveredMail($order));
                } elseif (in_array($validated['status'], ['Return Approved', 'Return Rejected', 'Exchange Approved']) && !empty($order->email)) {
                    Mail::to($order->email)->send(new \App\Mail\ReturnStatusCustomerMail($order));
                } elseif ($validated['status'] === 'Refunded' && !empty($order->email)) {
                    $refAmt = !empty($validated['refund_amount']) ? (float)$validated['refund_amount'] : (float)$order->total;
                    Mail::to($order->email)->send(new \App\Mail\RefundConfirmationMail($order, (float)$refAmt));
                }
            })->afterResponse();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Status change email failed: ' . $e->getMessage());
        }

        return response()->json([
            'status'  => 'success',
            'message' => "Order {$order->order_number} status updated to {$order->status}",
            'data'    => $order,
        ]);
    }

    /**
     * Product inventory list
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::with('category')->orderBy('id', 'asc');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%");
        }

        $products = $query->paginate($request->get('limit', 200));

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
    /**
     * Add new product
     */
    public function storeProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'category_slug'  => 'nullable|string',
            'category'       => 'nullable|string',
            'category_name'  => 'nullable|string',
            'category_id'    => 'nullable',
            'price'          => 'required|numeric|min:0',
            'old_price'      => 'nullable|numeric|min:0',
            'brand'          => 'nullable|string',
            'material'       => 'nullable|string',
            'color'          => 'nullable|string',
            'colors'         => 'nullable|array',
            'stock_by_color' => 'nullable|array',
            'stock'          => 'nullable|integer|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'image'          => 'nullable|string',
            'image_url'      => 'nullable|string',
            'images'         => 'nullable|array',
            'description'    => 'nullable|string',
            'sku'            => 'nullable|string',
            'is_active'      => 'nullable|boolean',
            'status'         => 'nullable|string',
            'size'           => 'nullable|string',
            'dimensions'     => 'nullable|string',
            'weight'         => 'nullable|string',
            'trust_badges'   => 'nullable|array',
        ]);

        $catName = $validated['category_name'] ?? $validated['category'] ?? 'Chairs';
        $catSlug = $validated['category_slug'] ?? Str::slug($catName);

        $category = Category::where('slug', $catSlug)
            ->orWhere('name', $catName)
            ->first();

        $image = $validated['image'] ?? $validated['image_url'] ?? 'chair1.jpg';
        $stock = $validated['stock'] ?? $validated['stock_quantity'] ?? 50;
        $sku   = !empty($validated['sku']) ? $validated['sku'] : ('WM-' . strtoupper(Str::random(6)));
        $status = $validated['status'] ?? (isset($validated['is_active']) && !$validated['is_active'] ? 'Inactive' : 'Active');

        $stock_by_color = $validated['stock_by_color'] ?? null;
        if (is_array($stock_by_color) && count($stock_by_color) > 0) {
            $stock = array_sum(array_values($stock_by_color));
        }

        $product = Product::create([
            'category_id'    => $category?->id ?? $category?->_id ?? null,
            'category_slug'  => $catSlug,
            'category_name'  => $category?->name ?? $catName,
            'name'           => $validated['name'],
            'slug'           => Str::slug($validated['name']) . '-' . Str::random(4),
            'price'          => (float) $validated['price'],
            'old_price'      => isset($validated['old_price']) && $validated['old_price'] !== '' ? (float) $validated['old_price'] : null,
            'brand'          => $validated['brand'] ?? 'AstroGifts',
            'material'       => $validated['material'] ?? 'Wood',
            'color'          => $validated['color'] ?? 'Natural',
            'colors'         => $validated['colors'] ?? ['#1c1c1c', '#c8a870'],
            'stock_by_color' => $stock_by_color,
            'size'           => $validated['size'] ?? null,
            'dimensions'     => $validated['dimensions'] ?? null,
            'weight'         => $validated['weight'] ?? null,
            'stock'          => (int) $stock,
            'sku'            => $sku,
            'image'          => $image,
            'images'         => $validated['images'] ?? [],
            'description'    => $validated['description'] ?? 'Premium furniture item.',
            'trust_badges'   => $validated['trust_badges'] ?? null,
            'is_active'      => $status === 'Active',
            'status'         => $status,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Product created successfully',
            'data'    => $product,
        ], 201);
    }

    /**
     * Update stock / product info
     */
    public function updateProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id) ?? Product::where('_id', $id)->firstOrFail();

        $validated = $request->validate([
            'name'           => 'nullable|string|max:255',
            'category'       => 'nullable|string',
            'category_slug'  => 'nullable|string',
            'category_name'  => 'nullable|string',
            'price'          => 'nullable|numeric',
            'old_price'      => 'nullable|numeric',
            'stock'          => 'nullable|integer',
            'stock_quantity' => 'nullable|integer',
            'is_active'      => 'nullable|boolean',
            'status'         => 'nullable|string',
            'is_featured'    => 'nullable|boolean',
            'is_bestseller'  => 'nullable|boolean',
            'material'       => 'nullable|string',
            'color'          => 'nullable|string',
            'colors'         => 'nullable|array',
            'stock_by_color' => 'nullable|array',
            'size'           => 'nullable|string',
            'dimensions'     => 'nullable|string',
            'weight'         => 'nullable|string',
            'brand'          => 'nullable|string',
            'sku'            => 'nullable|string',
            'description'    => 'nullable|string',
            'image'          => 'nullable|string',
            'image_url'      => 'nullable|string',
            'images'         => 'nullable|array',
            'trust_badges'   => 'nullable|array',
        ]);

        if (isset($validated['status'])) {
            if ($validated['status'] === 'Active') {
                $validated['is_active'] = true;
            } elseif ($validated['status'] === 'Inactive') {
                $validated['is_active'] = false;
            }
        }

        if (isset($validated['stock_quantity'])) {
            $validated['stock'] = $validated['stock_quantity'];
            unset($validated['stock_quantity']);
        }
        if (isset($validated['image_url'])) {
            $validated['image'] = $validated['image_url'];
            unset($validated['image_url']);
        }
        if (isset($validated['category']) && !isset($validated['category_name'])) {
            $validated['category_name'] = $validated['category'];
            $validated['category_slug'] = Str::slug($validated['category']);
            unset($validated['category']);
        }

        if (isset($validated['stock_by_color']) && is_array($validated['stock_by_color']) && count($validated['stock_by_color']) > 0) {
            $validated['stock'] = array_sum(array_values($validated['stock_by_color']));
        }

        $product->update(array_filter($validated, fn($v) => !is_null($v)));

        return response()->json([
            'status'  => 'success',
            'message' => 'Product updated successfully',
            'data'    => $product,
        ]);
    }

    /**
     * Delete product
     */
    public function deleteProduct(string $id): JsonResponse
    {
        $product = Product::find($id) ?? Product::where('_id', $id)->first();
        if ($product) {
            $product->delete();
        }

        return response()->json([
            'status'  => 'success',
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
     * Store a newly created category
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'slug'            => 'nullable|string|max:255',
            'parentCategory'  => 'nullable|string|max:255',
            'parent_category' => 'nullable|string|max:255',
            'description'     => 'nullable|string',
            'image'           => 'nullable|string',
            'status'          => 'nullable|string',
            'is_active'       => 'nullable|boolean',
            'showInMenu'      => 'nullable|string',
            'show_in_menu'    => 'nullable|boolean',
        ]);

        $slug = $request->slug ? \Illuminate\Support\Str::slug($request->slug) : \Illuminate\Support\Str::slug($request->name);

        $isActive = true;
        if ($request->has('is_active')) {
            $isActive = (bool) $request->is_active;
        } elseif ($request->has('status')) {
            $isActive = strtolower($request->status) === 'active';
        }

        $showInMenu = true;
        if ($request->has('show_in_menu')) {
            $showInMenu = (bool) $request->show_in_menu;
        } elseif ($request->has('showInMenu')) {
            $showInMenu = strtolower($request->showInMenu) === 'yes';
        }

        $category = Category::create([
            'name'            => $request->name,
            'slug'            => $slug,
            'parent_category' => $request->parent_category ?? $request->parentCategory ?? null,
            'description'     => $request->description ?? '',
            'image'           => $request->image ?? '',
            'icon'            => $request->icon ?? '',
            'is_active'       => $isActive,
            'status'          => $isActive ? 'Active' : 'Inactive',
            'show_in_menu'    => $showInMenu,
            'sort_order'      => Category::count() + 1,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category created successfully',
            'data'    => $category,
        ], 201);
    }

    /**
     * Update an existing category
     */
    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            $category = Category::where('_id', $id)->first();
        }
        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Category not found',
            ], 404);
        }

        $data = [];
        if ($request->filled('name')) {
            $data['name'] = $request->name;
            if (!$request->filled('slug')) {
                $data['slug'] = \Illuminate\Support\Str::slug($request->name);
            }
        }
        if ($request->filled('slug')) {
            $data['slug'] = \Illuminate\Support\Str::slug($request->slug);
        }
        if ($request->has('description')) {
            $data['description'] = $request->description;
        }
        if ($request->has('image')) {
            $data['image'] = $request->image;
        }
        if ($request->has('parent_category')) {
            $data['parent_category'] = $request->parent_category;
        } elseif ($request->has('parentCategory')) {
            $data['parent_category'] = $request->parentCategory;
        }
        if ($request->has('is_active')) {
            $data['is_active'] = (bool) $request->is_active;
            $data['status'] = $data['is_active'] ? 'Active' : 'Inactive';
        }
        if ($request->has('status')) {
            $data['status'] = $request->status;
            $data['is_active'] = strtolower($request->status) === 'active';
        }

        $category->update($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category updated successfully',
            'data'    => $category,
        ]);
    }

    /**
     * Delete a category
     */
    public function deleteCategory(string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            $category = Category::where('_id', $id)->first();
        }
        if ($category) {
            $category->delete();
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Category deleted successfully',
        ]);
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
     * Create a new slider
     */
    public function storeSlider(Request $request): JsonResponse
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'price'       => 'nullable|string|max:50',
            'image'       => 'nullable|string',
            'cta_text'    => 'nullable|string|max:100',
            'link'        => 'nullable|string|max:500',
            'badge_text'  => 'nullable|string|max:255',
            'badge_category' => 'nullable|string|max:100',
            'designer'    => 'nullable|string|max:255',
            'status'      => 'nullable|string|in:Active,Inactive',
            'sort_order'  => 'nullable|integer',
        ]);

        $slider = Slider::create([
            'title'          => $request->title,
            'subtitle'       => $request->subtitle ?? '',
            'price'          => $request->price ?? '',
            'image'          => $request->image ?? '',
            'cta_text'       => $request->cta_text ?? 'Shop Now',
            'link'           => $request->link ?? '/category/wooden-furniture',
            'badge_text'     => $request->badge_text ?? 'Discover more products',
            'badge_category' => $request->badge_category ?? '',
            'designer'       => $request->designer ?? '',
            'status'         => $request->status ?? 'Active',
            'sort_order'     => $request->sort_order ?? (Slider::count() + 1),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Slider created successfully',
            'data'    => $slider,
        ], 201);
    }

    /**
     * Update an existing slider
     */
    public function updateSlider(Request $request, string $id): JsonResponse
    {
        $slider = Slider::findOrFail($id);

        $slider->update(array_filter([
            'title'          => $request->title,
            'subtitle'       => $request->subtitle,
            'price'          => $request->price,
            'image'          => $request->image,
            'cta_text'       => $request->cta_text,
            'link'           => $request->link,
            'badge_text'     => $request->badge_text,
            'badge_category' => $request->badge_category,
            'designer'       => $request->designer,
            'status'         => $request->status,
            'sort_order'     => $request->sort_order,
        ], fn($v) => !is_null($v)));

        return response()->json([
            'status'  => 'success',
            'message' => 'Slider updated successfully',
            'data'    => $slider,
        ]);
    }

    /**
     * Delete a slider
     */
    public function deleteSlider(string $id): JsonResponse
    {
        $slider = Slider::findOrFail($id);
        $slider->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Slider deleted successfully',
        ]);
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
        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    /**
     * Upload Image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,jpg,png,gif,webp,svg,avif|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('uploads', 'public');

            return response()->json([
                'status' => 'success',
                'url'    => asset('storage/' . $path),
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'No image file uploaded'], 400);
    }
}
