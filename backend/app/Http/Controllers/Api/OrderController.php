<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Mail\AdminNewOrderMail;
use App\Mail\CustomerOrderConfirmationMail;
use Carbon\Carbon;
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
        foreach ($orders as $ord) {
            $this->normalizeOrderItems($ord);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $orders,
            'orders' => $orders,
        ]);
    }

    /**
     * Helper to clean & deduplicate items on an Order instance
     */
    private function normalizeOrderItems($order)
    {
        if (!$order) return $order;
        $rawItems = [];
        if ($order->relationLoaded('items') && count($order->getRelations()['items']) > 0) {
            $rawItems = $order->getRelations()['items']->toArray();
        } else {
            $rawItems = is_array($order->items) ? $order->items : [];
        }

        $unique = [];
        $seen = [];
        foreach ($rawItems as $it) {
            $itArray = is_array($it) ? $it : (method_exists($it, 'toArray') ? $it->toArray() : (array)$it);
            $pId = $itArray['product_id'] ?? $itArray['productId'] ?? $itArray['id'] ?? '';
            $name = strtolower(trim($itArray['name'] ?? $itArray['product_name'] ?? $itArray['title'] ?? ''));
            $color = strtolower(trim($itArray['selected_color'] ?? $itArray['color'] ?? ''));
            $size = strtolower(trim($itArray['size'] ?? ''));
            $key = "{$pId}-{$name}-{$color}-{$size}";

            if (!isset($seen[$key])) {
                $seen[$key] = count($unique);
                $unique[] = $itArray;
            } else {
                $idx = $seen[$key];
                $existingQty = (int)($unique[$idx]['quantity'] ?? $unique[$idx]['qty'] ?? 1);
                $addQty = (int)($itArray['quantity'] ?? $itArray['qty'] ?? 1);
                $unique[$idx]['quantity'] = $existingQty + $addQty;
                $unique[$idx]['qty'] = $existingQty + $addQty;
            }
        }

        $order->unsetRelation('items');
        $order->items = $unique;
        return $order;
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
        $processedItems = [];
        $embeddedItems = [];

        foreach ($validated['items'] as $rawItem) {
            $item = $rawItem;
            $product = null;
            $pId = $item['product_id'] ?? $item['id'] ?? null;

            if (!empty($item['name'])) {
                $product = Product::where('name', $item['name'])->first();
            }
            if (!$product && !empty($pId)) {
                $product = Product::find($pId) ?? Product::where('_id', $pId)->first();
            }

            if ($product) {
                if (isset($product->stock_status) && $product->stock_status === 'out_of_stock') {
                    return response()->json(['status' => 'error', 'message' => "Product is out of stock: {$product->name}"], 400);
                }
                $realPrice = (float)$product->price;
                $item['price'] = $realPrice;
                $item['product_id'] = (string)($product->_id ?? $product->id);
                if (empty($item['name'])) {
                    $item['name'] = $product->name;
                }
                if (empty($item['image'])) {
                    $item['image'] = $product->image ?? $product->image_url ?? null;
                }
            } else {
                $realPrice = (float)($item['price'] ?? 0);
            }

            $subtotal += ($realPrice * (int)($item['quantity'] ?? 1));
            $processedItems[] = $item;

            $embeddedItems[] = [
                'productId' => (string)($item['product_id'] ?? $item['id'] ?? ''),
                'product_id' => (string)($item['product_id'] ?? $item['id'] ?? ''),
                'title' => $item['name'],
                'name' => $item['name'],
                'product_name' => $item['name'],
                'image' => $item['image'] ?? null,
                'product_image' => $item['image'] ?? null,
                'price' => (float)$item['price'],
                'quantity' => (int)($item['quantity'] ?? 1),
                'qty' => (int)($item['quantity'] ?? 1),
                'size' => $item['size'] ?? null,
                'color' => $item['selected_color'] ?? $item['color'] ?? null,
                'selected_color' => $item['selected_color'] ?? $item['color'] ?? null,
                'status' => 'Pending',
            ];
        }
        $validated['items'] = $processedItems;

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
        
        $transactionId = $request->get('transaction_id') ?? $request->get('razorpay_payment_id') ?? '';
        
        if ($paymentMethod === 'online' && !empty($transactionId) && !str_starts_with($transactionId, 'pay_mock_')) {
            try {
                $razorpayKey = env('RAZORPAY_KEY_ID');
                $razorpaySecret = env('RAZORPAY_KEY_SECRET');
                if ($razorpayKey && $razorpaySecret) {
                    $response = \Illuminate\Support\Facades\Http::withBasicAuth($razorpayKey, $razorpaySecret)
                        ->get("https://api.razorpay.com/v1/payments/{$transactionId}");

                    if ($response->successful()) {
                        $rMethod = $response->json('method'); // e.g. card, upi, netbanking
                        if (!empty($rMethod)) {
                            $paymentMethod = strtoupper($rMethod);
                        }
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Razorpay Error: ' . $e->getMessage());
            }
        }

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
            'items' => $embeddedItems,
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

        foreach ($embeddedItems as $item) {
            $createdItem = OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'] ?? $item['productId'] ?? null,
                'productId' => (string)($item['product_id'] ?? $item['productId'] ?? ''),
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

            // Deduct stock from Product
            try {
                $product = null;
                $pId = $item['product_id'] ?? $item['productId'] ?? null;
                if (!empty($pId)) {
                    $product = Product::find($pId) ?? Product::where('_id', $pId)->first();
                }
                if (!$product && !empty($item['name'])) {
                    $product = Product::where('name', $item['name'])->first();
                }

                if ($product) {
                    $deductQty = (int)($item['quantity'] ?? 1);
                    $color = $item['color'] ?? $item['selected_color'] ?? null;
                    
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
                        $product->stock_status = 'out_of_stock';
                        Log::warning("⚠️ OUT OF STOCK ALERT: Product [{$product->name}] (ID: {$product->id}) has reached 0 stock!");
                    }
                    $product->save();
                }
            } catch (\Throwable $e) {
                Log::error('Stock deduction failed: ' . $e->getMessage());
            }
        }

        $this->normalizeOrderItems($order);

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
        $adminEmail = env('ADMIN_EMAIL', env('MAIL_FROM_ADDRESS', 'pmall6584@gmail.com'));
        
        // 1. Send Customer Order Confirmation Email directly to customer email
        if (!empty($order->email)) {
            try {
                Mail::to($order->email)->send(new CustomerOrderConfirmationMail($order));
                Log::info("Customer order confirmation email sent to: {$order->email}");
            } catch (\Throwable $e) {
                Log::error("Failed to send customer order email to {$order->email}: " . $e->getMessage());
            }
        }

        // 2. Send Admin New Order Notification Email
        if (!empty($adminEmail) && $adminEmail !== $order->email) {
            try {
                Mail::to($adminEmail)->send(new AdminNewOrderMail($order));
                Log::info("Admin order notification email sent to: {$adminEmail}");
            } catch (\Throwable $e) {
                Log::error("Failed to send admin order email to {$adminEmail}: " . $e->getMessage());
            }
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
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found',
            ], 404);
        }

        $this->normalizeOrderItems($order);

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

        // 1. Order must be in Delivered status
        if ($order->status !== 'Delivered') {
            return response()->json([
                'status' => 'error',
                'message' => 'Return/Exchange can only be requested for delivered orders. Current status: ' . $order->status,
            ], 422);
        }

        // 2. 7-day return window validation
        $deliveredAt = $order->delivered_at ? new \Carbon\Carbon($order->delivered_at) : null;
        if (!$deliveredAt) {
            // Fallback: use created_at + 2 days as estimated delivery if delivered_at not set
            $deliveredAt = \Carbon\Carbon::parse($order->created_at)->addDays(2);
        }
        $daysSinceDelivery = $deliveredAt->diffInDays(now(), false);
        if ($daysSinceDelivery > 7) {
            return response()->json([
                'status' => 'error',
                'message' => "Return/Exchange window has expired. Requests must be made within 7 days of delivery. ({$daysSinceDelivery} days since delivery)",
            ], 422);
        }

        // 3. Check if return already requested
        if (in_array($order->return_status, ['Requested', 'Approved', 'Exchange Approved'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'A return/exchange request has already been submitted for this order.',
            ], 422);
        }

        $validated = $request->validate([
            'return_type'             => 'required|string|in:Return,Exchange',
            'reason'                  => 'required|string|max:255',
            'notes'                   => 'nullable|string|max:1000',
            'bank_details'            => 'nullable|string|max:500',
            'proof_images'            => 'nullable|array|max:5',
            'proof_images.*'          => 'nullable|string',
            'exchange_product_name'   => 'nullable|string|max:255',
            'exchange_size'           => 'nullable|string|max:100',
            'exchange_color'          => 'nullable|string|max:100',
            'exchange_product_id'     => 'nullable|string|max:255',
        ]);

        $exchangeDetails = null;
        if ($validated['return_type'] === 'Exchange') {
            $exchangeDetails = array_filter([
                'product_id'   => $validated['exchange_product_id'] ?? null,
                'product_name' => $validated['exchange_product_name'] ?? null,
                'size'         => $validated['exchange_size'] ?? null,
                'color'        => $validated['exchange_color'] ?? null,
            ]);
        }

        $statusName = $validated['return_type'] === 'Exchange' ? 'Exchange Requested' : 'Return Requested';

        $order->update([
            'return_type'         => $validated['return_type'],
            'return_reason'       => $validated['reason'],
            'return_notes'        => $validated['notes'] ?? null,
            'return_bank_details' => $validated['bank_details'] ?? null,
            'return_status'       => 'Requested',
            'return_requested_at' => now(),
            'return_proof_images' => !empty($validated['proof_images']) ? $validated['proof_images'] : null,
            'exchange_details'    => $exchangeDetails ?: null,
            'status'              => $statusName,
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
            'message' => "{$validated['return_type']} request submitted successfully! Our team will review within 24-48 hours and schedule pickup.",
            'days_since_delivery' => (int)$daysSinceDelivery,
            'days_remaining_in_window' => max(0, 7 - (int)$daysSinceDelivery),
            'data' => $order,
        ]);
    }


    /**
     * Cancel an individual item in an order (Amazon / Myntra style)
     */
    public function cancelItem(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        if (in_array($order->status, ['Shipped', 'Delivered', 'Cancelled'])) {
            return response()->json([
                'status' => 'error', 
                'message' => "Order is already {$order->status}. Items cannot be cancelled at this stage."
            ], 400);
        }

        $validated = $request->validate([
            'item_index' => 'nullable|integer',
            'product_id' => 'nullable|string',
            'reason' => 'nullable|string|max:255',
        ]);

        $items = $order->items ?? [];
        if (empty($items)) {
            return response()->json(['status' => 'error', 'message' => 'No items found in this order'], 400);
        }

        $targetIndex = null;

        if (isset($validated['item_index']) && isset($items[$validated['item_index']])) {
            $targetIndex = (int)$validated['item_index'];
        } elseif (!empty($validated['product_id'])) {
            foreach ($items as $idx => $it) {
                $pId = $it['productId'] ?? $it['product_id'] ?? $it['id'] ?? null;
                if ($pId == $validated['product_id'] && ($it['status'] ?? 'Pending') !== 'Cancelled') {
                    $targetIndex = $idx;
                    break;
                }
            }
        }

        if ($targetIndex === null || !isset($items[$targetIndex])) {
            return response()->json(['status' => 'error', 'message' => 'Item not found or already cancelled'], 404);
        }

        $itemToCancel = $items[$targetIndex];
        if (($itemToCancel['status'] ?? 'Pending') === 'Cancelled') {
            return response()->json(['status' => 'error', 'message' => 'This item is already cancelled.'], 400);
        }

        // Mark item as Cancelled
        $items[$targetIndex]['status'] = 'Cancelled';
        $items[$targetIndex]['cancel_reason'] = $validated['reason'] ?? 'Cancelled by customer';
        $items[$targetIndex]['cancelled_at'] = now()->toDateTimeString();

        // Also update OrderItem table if exists
        try {
            $pId = $itemToCancel['productId'] ?? $itemToCancel['product_id'] ?? null;
            $query = OrderItem::where('order_id', $order->id);
            if ($pId) {
                $query->where(function($q) use ($pId) {
                    $q->where('product_id', $pId)->orWhere('productId', (string)$pId);
                });
            }
            $orderItemModel = $query->first();
            if ($orderItemModel) {
                $orderItemModel->update(['status' => 'Cancelled']);
            }
        } catch (\Throwable $e) {
            Log::error('Failed updating OrderItem row: ' . $e->getMessage());
        }

        // Restore Stock to Product
        try {
            $qtyToRestore = (int)($itemToCancel['quantity'] ?? $itemToCancel['qty'] ?? 1);
            $pId = $itemToCancel['productId'] ?? $itemToCancel['product_id'] ?? null;
            $product = null;
            if ($pId) {
                $product = Product::find($pId) ?? Product::where('_id', $pId)->first();
            }
            if (!$product && !empty($itemToCancel['title'] ?? $itemToCancel['name'])) {
                $product = Product::where('name', $itemToCancel['title'] ?? $itemToCancel['name'])->first();
            }

            if ($product) {
                $currentStock = is_numeric($product->stock) ? (int)$product->stock : 0;
                $product->stock = $currentStock + $qtyToRestore;
                $product->in_stock = true;
                $product->save();
            }
        } catch (\Throwable $e) {
            Log::error('Stock restoration failed for cancelled item: ' . $e->getMessage());
        }

        // Recalculate Subtotal & Total
        $newSubtotal = 0;
        $activeCount = 0;
        foreach ($items as $it) {
            if (($it['status'] ?? 'Pending') !== 'Cancelled') {
                $price = (float)($it['price'] ?? 0);
                $qty = (int)($it['quantity'] ?? $it['qty'] ?? 1);
                $newSubtotal += ($price * $qty);
                $activeCount++;
            }
        }

        $discount = (float)($order->discount ?? 0);
        $shipping = (float)($order->shipping ?? $order->shipping_cost ?? 0);
        $newTotal = max(0, $newSubtotal - $discount + $shipping);

        $newOrderStatus = $order->status;
        if ($activeCount === 0) {
            $newOrderStatus = 'Cancelled';
        } else {
            $newOrderStatus = 'Partially Cancelled';
        }

        $order->update([
            'items' => $items,
            'subtotal' => (float)$newSubtotal,
            'total' => (float)$newTotal,
            'status' => $newOrderStatus,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Item cancelled successfully and stock updated.',
            'data' => $order->fresh(),
        ]);
    }

    /**
     * Cancel the full order
     */
    public function cancelOrder(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        if (in_array($order->status, ['Shipped', 'Delivered', 'Cancelled'])) {
            return response()->json([
                'status' => 'error', 
                'message' => "Order is already {$order->status} and cannot be cancelled."
            ], 400);
        }

        $reason = $request->input('reason', 'Cancelled by customer');
        $items = $order->items ?? [];

        foreach ($items as $idx => &$it) {
            if (($it['status'] ?? 'Pending') !== 'Cancelled') {
                $it['status'] = 'Cancelled';
                $it['cancel_reason'] = $reason;
                $it['cancelled_at'] = now()->toDateTimeString();

                // Restore stock
                try {
                    $qtyToRestore = (int)($it['quantity'] ?? $it['qty'] ?? 1);
                    $pId = $it['productId'] ?? $it['product_id'] ?? null;
                    $product = null;
                    if ($pId) {
                        $product = Product::find($pId) ?? Product::where('_id', $pId)->first();
                    }
                    if (!$product && !empty($it['title'] ?? $it['name'])) {
                        $product = Product::where('name', $it['title'] ?? $it['name'])->first();
                    }
                    if ($product) {
                        $product->stock = (is_numeric($product->stock) ? (int)$product->stock : 0) + $qtyToRestore;
                        $product->in_stock = true;
                        $product->save();
                    }
                } catch (\Throwable $e) {
                    Log::error('Stock restore failed in full cancel: ' . $e->getMessage());
                }
            }
        }
        unset($it);

        OrderItem::where('order_id', $order->id)->update(['status' => 'Cancelled']);

        $order->update([
            'items' => $items,
            'status' => 'Cancelled',
            'notes' => ($order->notes ? $order->notes . ' | ' : '') . "Cancelled reason: {$reason}",
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Order cancelled successfully.',
            'data' => $order->fresh(),
        ]);
    }
}

