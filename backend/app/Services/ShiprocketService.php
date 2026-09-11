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
            return ['status' => false, 'message' => 'Shiprocket authentication failed.'];
        }

        // Format items
        $orderItems = [];
        foreach ($localOrder->items as $item) {
            $orderItems[] = [
                'name' => $item->product_name ?? 'Product',
                'sku' => 'SKU-' . rand(1000, 9999), // Fallback if no SKU
                'units' => $item->quantity,
                'selling_price' => $item->price,
            ];
        }

        $payload = [
            'order_id' => $localOrder->order_number,
            'order_date' => $localOrder->created_at->format('Y-m-d H:i'),
            'pickup_location' => 'Primary',
            'billing_customer_name' => $localOrder->customer_name,
            'billing_last_name' => '',
            'billing_address' => $localOrder->shipping_address,
            'billing_city' => $localOrder->city,
            'billing_pincode' => $localOrder->zip ?? '201301',
            'billing_state' => $localOrder->state ?? 'Uttar Pradesh',
            'billing_country' => 'India',
            'billing_email' => $localOrder->email,
            'billing_phone' => $localOrder->phone ?? '9999999999',
            'shipping_is_billing' => true,
            'order_items' => $orderItems,
            'payment_method' => $localOrder->payment_method === 'cod' ? 'COD' : 'Prepaid',
            'sub_total' => $localOrder->total ?? $localOrder->subtotal,
            'length' => 10,
            'breadth' => 10,
            'height' => 10,
            'weight' => 1,
        ];

        try {
            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/orders/create/adhoc", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                // Update local order with Shiprocket IDs
                $localOrder->update([
                    'shiprocket_order_id' => $data['order_id'] ?? null,
                    'shiprocket_shipment_id' => $data['shipment_id'] ?? null,
                    'shiprocket_status' => $data['status'] ?? 'NEW',
                ]);

                return ['status' => true, 'data' => $data];
            }

            Log::error('Shiprocket Order Creation Failed', [
                'order' => $localOrder->order_number,
                'response' => $response->body()
            ]);

            return ['status' => false, 'message' => $response->body()];
        } catch (Exception $e) {
            Log::error('Shiprocket API Exception: ' . $e->getMessage());
            return ['status' => false, 'message' => $e->getMessage()];
        }
    }
}
