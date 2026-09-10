<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Customer order list
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;

        $orders = Order::with('items')
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ]);
    }

    /**
     * Place a new order from Checkout
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'shipping_address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'payment_method' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selected_color' => 'nullable|string',
            'items.*.image' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Calculate subtotal from items
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += ($item['price'] * $item['quantity']);
            }

            // Coupon discount calculation
            $discount = 0;
            if (!empty($validated['coupon_code'])) {
                $code = strtoupper(trim($validated['coupon_code']));
                $coupon = Coupon::where('code', $code)->where('is_active', true)->first();
                if ($coupon && $subtotal >= $coupon->min_spend) {
                    $discount = round(($subtotal * $coupon->discount_percent) / 100, 2);
                }
            }

            $total = max(0, $subtotal - $discount);
            $orderNumber = 'ORD-' . strtoupper(Str::random(6));

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $request->user()?->id,
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'shipping_address' => $validated['shipping_address'],
                'city' => $validated['city'],
                'state' => $validated['state'] ?? null,
                'zip' => $validated['zip'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => 0.00,
                'total' => $total,
                'payment_method' => $validated['payment_method'] ?? 'cod',
                'payment_status' => ($validated['payment_method'] ?? 'cod') === 'card' ? 'paid' : 'pending',
                'status' => 'Pending',
                'notes' => $request->get('notes'),
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_name' => $item['name'],
                    'product_image' => $item['image'] ?? null,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'selected_color' => $item['selected_color'] ?? null,
                    'subtotal' => ($item['price'] * $item['quantity']),
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully!',
                'data' => $order->load('items'),
            ], 201);
        });
    }

    /**
     * Track / View single order
     */
    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::with('items')
            ->where('order_number', $orderNumber)
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order,
        ]);
    }
}
