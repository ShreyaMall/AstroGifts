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

    public function test_public_site_settings_endpoint_exposes_checkout_settings(): void
    {
        Setting::set('checkout', [
            'guest_checkout_enabled' => true,
            'show_create_account' => true,
            'create_account_default_checked' => true,
            'create_account_method' => 'otp',
            'create_account_label' => 'Create an account?',
            'create_account_help_text' => 'Fast checkout tracking',
        ]);

        $res = $this->getJson('/api/site-settings');
        $res->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.checkout.guest_checkout_enabled', true)
            ->assertJsonPath('data.checkout.show_create_account', true)
            ->assertJsonPath('data.checkout.create_account_method', 'otp')
            ->assertJsonPath('data.checkout.create_account_label', 'Create an account?');
    }

    public function test_guest_creates_account_via_otp(): void
    {
        Setting::set('checkout', [
            'guest_checkout_enabled' => true,
            'show_create_account' => true,
            'create_account_method' => 'otp',
        ]);

        $phone = '9998887702';
        $otp = '582914';

        // Pre-create draft user simulating sendOtp
        $draftUser = User::create([
            'name' => null,
            'phone' => $phone,
            'role' => 'customer',
            'otp' => $otp,
            'otp_hash' => hash('sha256', $otp),
            'otp_expires_at' => Carbon::now()->addMinutes(5),
        ]);

        $payload = $this->getSampleOrderPayload([
            'phone' => $phone,
            'create_account' => true,
            'create_account_method' => 'otp',
            'otp' => $otp,
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['auth_token', 'user' => ['id', 'name', 'phone']]);

        $createdUserId = $response->json('user.id');
        $orderUserId = $response->json('order.user_id');

        $this->assertEquals((string)$createdUserId, (string)$orderUserId);

        $freshUser = User::find($createdUserId);
        $this->assertNotNull($freshUser->phone_verified_at);
        $this->assertEquals('Aditi Sharma', $freshUser->name);
    }

    public function test_duplicate_phone_rejected(): void
    {
        Setting::set('checkout', [
            'guest_checkout_enabled' => true,
            'show_create_account' => true,
        ]);

        $phone = '9998887703';

        // Existing verified user
        User::create([
            'name' => 'Existing Customer',
            'email' => 'existing@test-checkout.com',
            'phone' => $phone,
            'password' => Hash::make('password123'),
            'phone_verified_at' => Carbon::now(),
            'role' => 'customer',
        ]);

        $payload = $this->getSampleOrderPayload([
            'phone' => $phone,
            'create_account' => true,
            'create_account_method' => 'password',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('account_exists', true);
    }

    public function test_wrong_otp_rejected(): void
    {
        Setting::set('checkout', [
            'guest_checkout_enabled' => true,
            'show_create_account' => true,
            'create_account_method' => 'otp',
        ]);

        $phone = '9998887704';
        $correctOtp = '112233';

        User::create([
            'phone' => $phone,
            'role' => 'customer',
            'otp' => $correctOtp,
            'otp_hash' => hash('sha256', $correctOtp),
            'otp_expires_at' => Carbon::now()->addMinutes(5),
        ]);

        $payload = $this->getSampleOrderPayload([
            'phone' => $phone,
            'create_account' => true,
            'create_account_method' => 'otp',
            'otp' => '999999', // wrong OTP
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }

    public function test_account_creation_rejected_when_setting_is_off(): void
    {
        Setting::set('checkout', [
            'guest_checkout_enabled' => true,
            'show_create_account' => false,
        ]);

        $phone = '9998887705';

        $payload = $this->getSampleOrderPayload([
            'phone' => $phone,
            'create_account' => true,
            'create_account_method' => 'password',
            'password' => 'secret12345',
            'password_confirmation' => 'secret12345',
        ]);

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertSee('Account creation during checkout is currently disabled');
    }

    public function test_logged_in_user_ignores_create_account_flag(): void
    {
        Setting::set('checkout', [
            'guest_checkout_enabled' => true,
            'show_create_account' => true,
        ]);

        $customer = User::create([
            'name' => 'Authenticated Customer',
            'email' => 'auth_cust@test-checkout.com',
            'phone' => '9998887706',
            'phone_verified_at' => Carbon::now(),
            'password' => Hash::make('password123'),
            'role' => 'customer',
        ]);

        $token = $customer->createToken('customer_token', ['customer'])->plainTextToken;

        $payload = $this->getSampleOrderPayload([
            'phone' => '9998887706',
            'create_account' => true, // should be safely ignored
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
