<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class TwilioSettingsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('throttle:3,1');
        RateLimiter::clear('throttle:5,1');
    }

    protected function tearDown(): void
    {
        Setting::where('key', 'twilio')->delete();
        User::where('email', 'like', '%@test-twilio.com')->delete();
        parent::tearDown();
    }

    private function createAdminHeaders(): array
    {
        $admin = User::create([
            'name' => 'Admin Twilio Tester',
            'email' => 'admin_' . uniqid() . '@test-twilio.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
        $token = $admin->createToken('admin_token', ['admin'])->plainTextToken;
        return ['Authorization' => "Bearer {$token}"];
    }

    private function createCustomerHeaders(): array
    {
        $customer = User::create([
            'name' => 'Customer Twilio Tester',
            'email' => 'customer_' . uniqid() . '@test-twilio.com',
            'password' => Hash::make('password123'),
            'role' => 'customer',
        ]);
        $token = $customer->createToken('customer_token', ['customer'])->plainTextToken;
        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_non_admin_gets_403_or_401_on_settings_and_test_otp(): void
    {
        // 1. Guest
        $this->getJson('/api/admin/settings')->assertStatus(401);
        $this->postJson('/api/admin/settings', [])->assertStatus(401);
        $this->postJson('/api/admin/settings/test-otp', ['phone' => '9876543210'])->assertStatus(401);

        // 2. Regular Customer
        $customerHeaders = $this->createCustomerHeaders();
        $this->withHeaders($customerHeaders)->getJson('/api/admin/settings')->assertStatus(403);
        $this->withHeaders($customerHeaders)->postJson('/api/admin/settings', [])->assertStatus(403);
        $this->withHeaders($customerHeaders)->postJson('/api/admin/settings/test-otp', ['phone' => '9876543210'])->assertStatus(403);
    }

    public function test_masked_get_never_returns_full_secret(): void
    {
        $rawSid = 'AC1234567890abcdef1234567890abcd99';
        $rawToken = 'secret_token_value_xyz_8888';
        $verifySid = 'VA11223344556677889900aabbccddeeff';

        Setting::set('twilio', [
            'enabled' => true,
            'account_sid' => Crypt::encryptString($rawSid),
            'auth_token' => Crypt::encryptString($rawToken),
            'verify_service_sid' => $verifySid,
        ]);

        $headers = $this->createAdminHeaders();

        $response = $this->withHeaders($headers)->getJson('/api/admin/settings');
        $response->assertStatus(200);

        $data = $response->json('data.twilio');
        $this->assertTrue($data['enabled']);
        $this->assertTrue($data['has_account_sid']);
        $this->assertTrue($data['has_auth_token']);
        $this->assertTrue($data['has_verify_service_sid']);

        // Must be masked, ending in last 4 characters
        $this->assertStringContainsString('••••', $data['account_sid']);
        $this->assertStringEndsWith('cd99', $data['account_sid']);
        $this->assertStringNotContainsString($rawSid, $data['account_sid']);

        $this->assertStringContainsString('••••', $data['auth_token']);
        $this->assertStringEndsWith('8888', $data['auth_token']);
        $this->assertStringNotContainsString($rawToken, $data['auth_token']);
    }

    public function test_keep_on_empty_or_masked_save_preserves_existing_secrets(): void
    {
        $originalSid = 'ACoriginal_sid_1234567890_aaaa';
        $originalToken = 'token_original_secret_bbbb';
        $originalVerify = 'VAoriginal_verify_service_sid';

        Setting::set('twilio', [
            'enabled' => true,
            'account_sid' => Crypt::encryptString($originalSid),
            'auth_token' => Crypt::encryptString($originalToken),
            'verify_service_sid' => $originalVerify,
        ]);

        $headers = $this->createAdminHeaders();

        // Admin submits masked values back
        $response = $this->withHeaders($headers)->postJson('/api/admin/settings', [
            'twilio' => [
                'enabled' => false,
                'account_sid' => '••••••••aaaa',
                'auth_token' => '••••••••bbbb',
                'verify_service_sid' => $originalVerify,
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        // Inspect stored values
        $stored = Setting::where('key', 'twilio')->first()->value;
        $this->assertFalse($stored['enabled']);
        $this->assertEquals($originalSid, Crypt::decryptString($stored['account_sid']));
        $this->assertEquals($originalToken, Crypt::decryptString($stored['auth_token']));
        $this->assertEquals($originalVerify, $stored['verify_service_sid']);
    }

    public function test_secrets_are_stored_encrypted_at_rest(): void
    {
        $plainSid = 'ACplain_sid_stored_test_1111';
        $plainToken = 'auth_token_plain_stored_test_2222';
        $verifySid = 'VAtest_verify_sid_3333';

        $headers = $this->createAdminHeaders();

        $response = $this->withHeaders($headers)->postJson('/api/admin/settings', [
            'twilio' => [
                'enabled' => true,
                'account_sid' => $plainSid,
                'auth_token' => $plainToken,
                'verify_service_sid' => $verifySid,
            ],
        ]);

        $response->assertStatus(200);

        // Fetch directly from DB
        $rawRecord = Setting::where('key', 'twilio')->first();
        $this->assertNotNull($rawRecord);
        $storedValue = $rawRecord->value;

        // Verify stored value in DB is NOT plaintext
        $this->assertNotEquals($plainSid, $storedValue['account_sid']);
        $this->assertNotEquals($plainToken, $storedValue['auth_token']);

        // Verify it decrypts back to original plain string
        $this->assertEquals($plainSid, Crypt::decryptString($storedValue['account_sid']));
        $this->assertEquals($plainToken, Crypt::decryptString($storedValue['auth_token']));
    }

    public function test_admin_test_otp_endpoint_sends_otp_with_twilio_mocked(): void
    {
        Http::fake([
            'https://verify.twilio.com/v2/Services/*/Verifications' => Http::response([
                'sid' => 'VEmocked_verification_sid_123',
                'status' => 'pending',
                'to' => '+919876543210',
            ], 200),
        ]);

        Setting::set('twilio', [
            'enabled' => true,
            'account_sid' => Crypt::encryptString('ACmock_test_sid'),
            'auth_token' => Crypt::encryptString('mock_test_auth_token'),
            'verify_service_sid' => 'VAmock_test_verify_sid',
        ]);

        $headers = $this->createAdminHeaders();

        // 1. Invalid phone format
        $invalidRes = $this->withHeaders($headers)->postJson('/api/admin/settings/test-otp', [
            'phone' => '12345',
        ]);
        $invalidRes->assertStatus(422);

        // 2. Valid 10-digit Indian phone
        $validRes = $this->withHeaders($headers)->postJson('/api/admin/settings/test-otp', [
            'phone' => '9876543210',
        ]);

        $validRes->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'verify.twilio.com') &&
                $request['To'] === '+919876543210' &&
                $request['Channel'] === 'sms';
        });
    }
}
