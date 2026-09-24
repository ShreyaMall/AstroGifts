<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class ShiprocketService
{
    protected $baseUrl = 'https://apiv2.shiprocket.in/v1/external';
    
    /**
     * Authenticate and get a Bearer token
     * Tokens are valid for 240 hours (10 days). We cache it for 9 days.
     */
    public function getToken()
    {
        return Cache::remember('shiprocket_token', now()->addDays(9), function () {
            $email = env('SHIPROCKET_EMAIL');
            $password = env('SHIPROCKET_PASSWORD');
            
            if (!$email || !$password) {
                Log::warning('Shiprocket credentials missing in .env');
                return null;
            }

            $response = Http::post("{$this->baseUrl}/auth/login", [
                'email' => $email,
                'password' => $password,
            ]);

            if ($response->successful()) {
                return $response->json('token');
            }

            Log::error('Shiprocket Authentication Failed: ' . $response->body());
            return null;
        });
    }

    /**
     * Push a new order to Shiprocket
     */
    public function createOrder($localOrder)
    {
        $token = $this->getToken();
        
        if (!$token) {
            Log::warning('Shiprocket token not available, skipping order sync.');
            return ['status' => false, 'message' => 'Shiprocket authentication failed.'];
        }

        // Format items
        $orderItems = [];
        $skuCounts = [];
        if (!empty($localOrder->items)) {
            foreach ($localOrder->items as $item) {
                $productName = $item->product_name ?? 'Product Item';
                $baseSku = !empty($item->product_id) ? 'SKU-' . substr((string)$item->product_id, -6) : 'SKU-' . rand(1000, 9999);
                
                if (isset($skuCounts[$baseSku])) {
                    $skuCounts[$baseSku]++;
                    $sku = $baseSku . '-' . $skuCounts[$baseSku];
                } else {
                    $skuCounts[$baseSku] = 1;
                    $sku = $baseSku;
                }

                $orderItems[] = [
                    'name' => mb_substr($productName, 0, 100),
                    'sku' => $sku,
                    'units' => max(1, (int)($item->quantity ?? 1)),
                    'selling_price' => (float)($item->price ?? 0),
                ];
            }
        }

        if (empty($orderItems)) {
            $orderItems[] = [
                'name' => 'Order Item',
                'sku' => 'SKU-' . rand(1000, 9999),
                'units' => 1,
                'selling_price' => (float)($localOrder->total ?? $localOrder->subtotal ?? 100),
            ];
        }

        // Clean phone: ensure 10 digits
        $rawPhone = preg_replace('/[^0-9]/', '', (string)$localOrder->phone);
        $cleanPhone = strlen($rawPhone) >= 10 ? substr($rawPhone, -10) : '9999999999';

        // Split customer name
        $nameParts = explode(' ', trim($localOrder->customer_name ?? 'Customer'));
        $firstName = $nameParts[0] ?? 'Customer';
        $lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : '.';

        // Address min 10 chars
        $address = trim($localOrder->shipping_address ?? '');
        if (strlen($address) < 10) {
            $address = $address . ', ' . ($localOrder->city ?? 'City');
            if (strlen($address) < 10) {
                $address = $address . ', India';
            }
        }

        $pickupLocation = env('SHIPROCKET_PICKUP_LOCATION', 'Primary');

        $length = 10;
        $breadth = 10;
        $height = 10;
        $weight = 0.5;

        // Try to fetch dimensions and weight from the first item
        if (!empty($localOrder->items) && count($localOrder->items) > 0) {
            $firstItem = $localOrder->items[0];
            $product = \App\Models\Product::find($firstItem->product_id) ?? \App\Models\Product::where('_id', $firstItem->product_id)->first();
            
            if ($product) {
                if (!empty($product->weight)) {
                    $w = (float) preg_replace('/[^0-9.]/', '', (string)$product->weight);
                    if ($w > 0) $weight = $w;
                }
                
                $dimStr = $product->dimensions ?? $product->size ?? '';
                if (!empty($dimStr)) {
                    preg_match_all('/[0-9]+(\.[0-9]+)?/', $dimStr, $matches);
                    if (!empty($matches[0]) && count($matches[0]) >= 3) {
                        $length = (float)$matches[0][0];
                        $breadth = (float)$matches[0][1];
                        $height = (float)$matches[0][2];
                    } elseif (!empty($matches[0]) && count($matches[0]) >= 1) {
                         $length = $breadth = $height = (float)$matches[0][0];
                    }
                }
            }
        }

        $payload = [
            'order_id' => (string)$localOrder->order_number,
            'order_date' => $localOrder->created_at ? $localOrder->created_at->format('Y-m-d H:i') : now()->format('Y-m-d H:i'),
            'pickup_location' => $pickupLocation,
            'billing_customer_name' => $firstName,
            'billing_last_name' => $lastName,
            'billing_address' => $address,
            'billing_city' => $localOrder->city ?? 'New Delhi',
            'billing_pincode' => !empty($localOrder->zip) ? trim($localOrder->zip) : '110001',
            'billing_state' => !empty($localOrder->state) ? trim($localOrder->state) : 'Delhi',
            'billing_country' => 'India',
            'billing_email' => $localOrder->email ?? 'customer@example.com',
            'billing_phone' => $cleanPhone,
            'shipping_is_billing' => true,
            'order_items' => $orderItems,
            'payment_method' => strtolower($localOrder->payment_method ?? '') === 'cod' ? 'COD' : 'Prepaid',
            'sub_total' => (float)($localOrder->total ?? $localOrder->subtotal ?? 0),
            'length' => $length,
            'breadth' => $breadth,
            'height' => $height,
            'weight' => $weight,
        ];

        try {
            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/orders/create/adhoc", $payload);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Shiprocket full response: ', $data);
                
                if (empty($data['order_id'])) {
                    Log::error('Shiprocket API returned success but no order_id: ', $data);
                    return ['status' => false, 'message' => $data['message'] ?? 'Unknown error from Shiprocket'];
                }
                
                $shiprocketObj = [
                    'orderId' => (string)($data['order_id'] ?? ''),
                    'shipmentId' => (string)($data['shipment_id'] ?? ''),
                    'awbCode' => (string)($data['awb_code'] ?? ''),
                    'courierName' => (string)($data['courier_name'] ?? ''),
                    'trackingUrl' => (string)($data['tracking_url'] ?? ''),
                    'status' => strtolower($data['status'] ?? 'processing'),
                ];

                // Update local order with Shiprocket IDs
                $localOrder->update([
                    'shiprocket' => $shiprocketObj,
                    'shiprocket_order_id' => $data['order_id'] ?? null,
                    'shiprocket_shipment_id' => $data['shipment_id'] ?? null,
                    'shiprocket_status' => $data['status'] ?? 'NEW',
                    'shiprocket_awb_code' => $data['awb_code'] ?? null,
                    'courier_name' => $data['courier_name'] ?? null,
                    'tracking_url' => $data['tracking_url'] ?? null,
                ]);

                Log::info('Shiprocket order created successfully for ' . $localOrder->order_number, [
                    'shiprocket_order_id' => $data['order_id'] ?? null,
                    'shipment_id' => $data['shipment_id'] ?? null,
                ]);

                return ['status' => true, 'data' => $data];
            }

            Log::error('Shiprocket Order Creation Failed for ' . $localOrder->order_number, [
                'status_code' => $response->status(),
                'response' => $response->body(),
                'payload' => $payload,
            ]);

            return ['status' => false, 'message' => $response->body()];
        } catch (Exception $e) {
            Log::error('Shiprocket API Exception: ' . $e->getMessage());
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
