<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class CheckoutCreateAccountTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('throttle:5,1');
        RateLimiter::clear('throttle:10,1');
        Setting::clearCache('checkout');
    }

    protected function tearDown(): void
    {
        Setting::where('key', 'checkout')->delete();
        Setting::clearCache('checkout');
        User::where('email', 'like', '%@test-checkout.com')->delete();
        User::where('phone', 'like', '999888%')->delete();
        parent::tearDown();
    }

    private function getSampleOrderPayload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Aditi Sharma',
            'email' => 'aditi@test-checkout.com',
            'phone' => '9998887701',
            'shipping_address' => 'Flat 204, Rose Villa, Sector 14',
            'city' => 'Gurugram',
            'state' => 'Haryana',
            'zip' => '122001',
            'payment_method' => 'cod',
            'items' => [
                [
                    'name' => 'Personalized Wooden Plaque',
                    'price' => 799,
                    'quantity' => 1,
                    'size' => 'Standard',
                    'selected_color' => 'Walnut',
                ]
            ],
            'total' => 799,
        ], $overrides);
    }

    public function test_public_site_settings_endpoint_does_not_expose_checkout_settings(): void
    {
        Setting::set('checkout', [
            'guest_checkout_enabled' => false,
            'show_create_account' => false,
            'create_account_default_checked' => false,
            'create_account_method' => 'otp',
            'create_account_label' => 'Create an account?',
            'create_account_help_text' => 'Fast checkout tracking',
        ]);

        $res = $this->getJson('/api/site-settings');
        $res->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // Ensure checkout key or guest_checkout settings are not exposed
        $data = $res->json('data') ?? [];
        $this->assertArrayNotHasKey('checkout', $data);
    }

    public function test_unauthenticated_order_returns_401(): void
    {
        $payload = $this->getSampleOrderPayload();

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(401)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Authentication is required to place an order. Please log in to complete your checkout.');
    }

    public function test_unauthenticated_order_with_create_account_payload_returns_401(): void
    {
        $payload = $this->getSampleOrderPayload([
            'create_account' => true,
            'create_account_method' => 'password',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(401)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Authentication is required to place an order. Please log in to complete your checkout.');
    }

    public function test_unverified_phone_authenticated_order_returns_403(): void
    {
        $customer = User::create([
            'name' => 'Unverified Customer',
            'email' => 'unverified@test-checkout.com',
            'phone' => '9998887702',
            'phone_verified_at' => null,
            'password' => Hash::make('password123'),
            'role' => 'customer',
        ]);

        $token = $customer->createToken('test_token', ['customer'])->plainTextToken;

        $payload = $this->getSampleOrderPayload(['phone' => '9998887702']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/orders', $payload);

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Mobile number verification is required before placing an order.');
    }

    public function test_authenticated_order_succeeds(): void
    {
        $customer = User::create([
            'name' => 'Verified Customer',
            'email' => 'verified@test-checkout.com',
            'phone' => '9998887703',
            'phone_verified_at' => Carbon::now(),
            'password' => Hash::make('password123'),
            'role' => 'customer',
        ]);

        $token = $customer->createToken('test_token', ['customer'])->plainTextToken;

        $payload = $this->getSampleOrderPayload(['phone' => '9998887703']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/orders', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $orderUserId = $response->json('order.user_id');
        $this->assertEquals((string)$customer->id, (string)$orderUserId);
    }

    public function test_authenticated_order_ignores_create_account_payload(): void
    {
        $customer = User::create([
            'name' => 'Authenticated Customer',
            'email' => 'auth_cust@test-checkout.com',
            'phone' => '9998887704',
            'phone_verified_at' => Carbon::now(),
            'password' => Hash::make('password123'),
            'role' => 'customer',
        ]);

        $token = $customer->createToken('customer_token', ['customer'])->plainTextToken;

        $payload = $this->getSampleOrderPayload([
            'phone' => '9998887704',
            'create_account' => true,
            'create_account_method' => 'password',
            'password' => 'secret12345',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/orders', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $orderUserId = $response->json('order.user_id');
        $this->assertEquals((string)$customer->id, (string)$orderUserId);
    }
}
