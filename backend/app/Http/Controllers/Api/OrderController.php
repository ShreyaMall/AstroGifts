<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Mail\AdminNewOrderMail;
use App\Mail\CustomerOrderConfirmationMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Customer order list
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user?->id;
        $email = $request->query('email') ?: $user?->email;
        $orderNumbers = $request->query('order_numbers');

        $query = Order::with('items');

        if (!empty($orderNumbers)) {
            $numbers = is_array($orderNumbers) ? $orderNumbers : explode(',', $orderNumbers);
            $numbers = array_filter(array_map('trim', $numbers));
            
            if (!empty($numbers)) {
                $query->whereIn('order_number', $numbers);
                
                if ($userId) {
                    $query->where(function ($q) use ($userId, $email) {
                        $q->where('user_id', $userId);
                        if ($email) {
                            $q->orWhere('email', $email);
                        }
                    });
                } else {
                    // STRICT CHECK FOR GUESTS: Must provide email to verify ownership
                    if (empty($email)) {
                        $query->whereRaw('1 = 0');
                    } else {
                        $query->where('email', $email);
                    }
                }
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif (!empty($email) || !empty($userId)) {
            if ($userId) {
                $query->where(function ($q) use ($userId, $email) {
                    $q->where('user_id', $userId);
                    if ($email) {
                        $q->orWhere('email', $email);
                    }
                });
            } else {
                // Guests cannot query ALL their orders just by providing an email!
                $query->whereRaw('1 = 0');
            }
        } else {
            $query->whereRaw('1 = 0');
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $orders,
            'orders' => $orders,
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
            'items.*.id' => 'nullable',
            'items.*.product_id' => 'nullable',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selected_color' => 'nullable|string',
            'items.*.size' => 'nullable|string',
            'items.*.image' => 'nullable|string',
        ]);

        // Calculate subtotal from items and verify against database
        $subtotal = 0;
        foreach ($validated['items'] as &$item) {
            $product = \App\Models\Product::find($item['product_id']);
            
            if (!$product) {
                return response()->json(['status' => 'error', 'message' => "Product not found: {$item['name']}"], 404);
            }
            
            if ($product->stock_status === 'out_of_stock') {
                return response()->json(['status' => 'error', 'message' => "Product is out of stock: {$product->name}"], 400);
            }
            
            // Force the backend price
            $realPrice = $product->price;
            $item['price'] = $realPrice;
            
            $subtotal += ($realPrice * $item['quantity']);
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

        $paymentMethod = in_array(strtolower($validated['payment_method'] ?? 'cod'), ['razorpay', 'online', 'card', 'prepaid']) ? 'online' : 'cod';
        $paymentStatus = $paymentMethod === 'online' ? 'paid' : 'pending';

        $shippingAddress = [
            'fullName' => $validated['customer_name'],
            'phone' => $validated['phone'] ?? '',
            'addressLine' => $validated['shipping_address'],
            'city' => $validated['city'],
            'state' => $validated['state'] ?? 'Delhi',
            'pincode' => $validated['zip'] ?? '',
        ];

        $userId = auth('sanctum')->check() ? auth('sanctum')->id() : null;

        $order = Order::create([
            'order_number' => $orderNumber,
            'user_id' => $userId,
            'user' => $userId,
            'customer_name' => $validated['customer_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'shipping_address' => $validated['shipping_address'],
            'city' => $validated['city'],
            'state' => $validated['state'] ?? 'Delhi',
            'zip' => $validated['zip'] ?? null,
            'shippingAddress' => $shippingAddress,
            'subtotal' => (float)$subtotal,
            'discount' => (float)$discount,
            'shipping' => 0.00,
            'shipping_cost' => 0.00,
            'tax' => 0.00,
            'total' => (float)$total,
            'payment_method' => $paymentMethod,
            'paymentMethod' => $paymentMethod,
            'payment_status' => $paymentStatus,
            'paymentStatus' => $paymentStatus,
            'razorpayPaymentId' => $request->get('transaction_id') ?? $request->get('razorpay_payment_id') ?? '',
            'status' => 'Pending',
            'orderStatus' => 'placed',
            'notes' => $request->get('notes'),
            'shiprocket' => [
                'orderId' => '',
                'shipmentId' => '',
                'awbCode' => '',
                'courierName' => '',
                'trackingUrl' => '',
                'status' => 'pending',
            ],
        ]);

        $embeddedItems = [];
        foreach ($validated['items'] as $item) {
            $createdItem = OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'] ?? $item['id'] ?? null,
                'productId' => (string)($item['product_id'] ?? $item['id'] ?? ''),
                'product_name' => $item['name'],
                'title' => $item['name'],
                'product_image' => $item['image'] ?? null,
                'image' => $item['image'] ?? null,
                'price' => (float)$item['price'],
                'quantity' => (int)$item['quantity'],
                'selected_color' => $item['selected_color'] ?? null,
                'color' => $item['selected_color'] ?? null,
                'size' => $item['size'] ?? null,
                'status' => 'Pending',
                'subtotal' => ((float)$item['price'] * (int)$item['quantity']),
            ]);

            $embeddedItems[] = [
                'productId' => (string)($item['product_id'] ?? $item['id'] ?? ''),
                'title' => $item['name'],
                'image' => $item['image'] ?? null,
                'price' => (float)$item['price'],
                'quantity' => (int)$item['quantity'],
                'size' => $item['size'] ?? null,
                'color' => $item['selected_color'] ?? null,
                'status' => 'Pending',
            ];

            // Deduct stock from Product
            try {
                $product = null;
                $pId = $item['product_id'] ?? $item['id'] ?? null;
                if (!empty($pId)) {
                    $product = Product::find($pId) ?? Product::where('_id', $pId)->first();
                }
                if (!$product && !empty($item['name'])) {
                    $product = Product::where('name', $item['name'])->first();
                }

                if ($product) {
                    $deductQty = (int)($item['quantity'] ?? 1);
                    $color = $item['color'] ?? $item['selected_color'] ?? $item['options']['color'] ?? null;
                    
                    // Deduct from variant stock if applicable
                    if ($color && isset($product->stock_by_color) && is_array($product->stock_by_color) && isset($product->stock_by_color[$color])) {
                        $variantStock = (int)$product->stock_by_color[$color];
                        $newVariantStock = max(0, $variantStock - $deductQty);
                        $stocks = $product->stock_by_color;
                        $stocks[$color] = $newVariantStock;
                        $product->stock_by_color = $stocks;
                    }

                    // Deduct from total stock
                    $currentStock = isset($product->stock) && is_numeric($product->stock) ? (int)$product->stock : 25;
                    $newStock = max(0, $currentStock - $deductQty);
                    $product->stock = $newStock;
                    
                    if ($newStock <= 0) {
                        $product->in_stock = false;
                    }
                    $product->save();
                }
            } catch (\Throwable $e) {
                Log::error('Stock deduction failed: ' . $e->getMessage());
            }
        }

        // Save embedded items array to MongoDB Order document
        $order->update(['items' => $embeddedItems]);

        // Reload items onto the order object
        $order->load('items');

        // Push to Shiprocket after response is sent (no queue worker needed)
        try {
            dispatch(function () use ($order) {
                try {
                    $shiprocket = new \App\Services\ShiprocketService();
                    $shiprocket->createOrder($order);
                } catch (\Exception $e) {
                    Log::error('Shiprocket order creation failed: ' . $e->getMessage());
                }
            })->afterResponse();
        } catch (\Exception $e) {
            Log::error('Failed to dispatch Shiprocket job: ' . $e->getMessage());
        }

        // Send Email Notifications
        try {
            $adminEmail = env('ADMIN_EMAIL', env('MAIL_FROM_ADDRESS', 'pmall6584@gmail.com'));
            dispatch(function () use ($adminEmail, $order) {
                if (!empty($adminEmail)) {
                    Mail::to($adminEmail)->send(new AdminNewOrderMail($order));
                }
                if (!empty($order->email)) {
                    Mail::to($order->email)->send(new CustomerOrderConfirmationMail($order));
                }
            })->afterResponse();
        } catch (\Throwable $e) {
            Log::error('Order email notification failed: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order placed successfully!',
            'data' => $order,
        ], 201);
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

    /**
     * Submit Return or Exchange request for an order
     */
    public function requestReturn(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::with('items')->where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'return_type' => 'required|string|in:Return,Exchange',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'bank_details' => 'nullable|string|max:500',
        ]);

        $statusName = $validated['return_type'] === 'Exchange' ? 'Exchange Requested' : 'Return Requested';

        $order->update([
            'return_type' => $validated['return_type'],
            'return_reason' => $validated['reason'],
            'return_notes' => $validated['notes'] ?? null,
            'return_bank_details' => $validated['bank_details'] ?? null,
            'return_status' => 'Requested',
            'return_requested_at' => now(),
            'status' => $statusName,
        ]);

        // Send Email to Admin
        try {
            $adminEmail = env('ADMIN_EMAIL', env('MAIL_FROM_ADDRESS', 'pmall6584@gmail.com'));
            if (!empty($adminEmail)) {
                dispatch(function () use ($adminEmail, $order) {
                    Mail::to($adminEmail)->send(new \App\Mail\ReturnRequestAdminMail($order));
                })->afterResponse();
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending return request email to admin: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => "{$validated['return_type']} request submitted successfully! Our team will review and schedule pickup.",
            'data' => $order,
        ]);
    }
}
