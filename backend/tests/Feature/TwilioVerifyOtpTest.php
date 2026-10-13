<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Sms\SmsServiceInterface;
use App\Services\Sms\TwilioException;
use App\Services\Sms\TwilioSmsService;
use Carbon\Carbon;
use Illuminate\Support\Facades\RateLimiter;
use Mockery;
use Tests\TestCase;
use Twilio\Exceptions\RestException;
use Twilio\Rest\Client;

class TwilioVerifyOtpTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('send_otp_ip:127.0.0.1');
        RateLimiter::clear('verify_otp_ip:127.0.0.1');
        RateLimiter::clear('send_otp_phone:9876543210');
        RateLimiter::clear('verify_otp_phone:9876543210');
        RateLimiter::clear('throttle:5,1');
        RateLimiter::clear('throttle:10,1');
    }

    protected function tearDown(): void
    {
        User::where('phone', 'like', '9876543%')->delete();
        User::where('email', 'like', '%@test-twilio-otp.com')->delete();
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Helper to bind a mocked TwilioSmsService
     */
    private function mockTwilioSmsService(): Mockery\MockInterface
    {
        $mock = Mockery::mock(TwilioSmsService::class);
        $this->app->instance(SmsServiceInterface::class, $mock);
        $this->app->instance(TwilioSmsService::class, $mock);
        return $mock;
    }

    /**
     * Helper to mock Twilio SDK Client directly inside a real TwilioSmsService
     */
    private function createServiceWithMockedTwilioClient(): array
    {
        $mockClient = Mockery::mock(Client::class);
        $mockVerify = Mockery::mock();
        $mockV2 = Mockery::mock();
        $mockServiceContext = Mockery::mock();
        $mockVerifications = Mockery::mock();
        $mockVerificationChecks = Mockery::mock();

        $mockClient->verify = $mockVerify;
        $mockVerify->v2 = $mockV2;
        $mockV2->shouldReceive('services')->with('VA_TEST_MOCK_SID')->andReturn($mockServiceContext);
        $mockServiceContext->verifications = $mockVerifications;
        $mockServiceContext->verificationChecks = $mockVerificationChecks;

        $service = new TwilioSmsService(
            client: $mockClient,
            sid: 'AC_TEST_MOCK_SID',
            token: 'test_token',
            verifySid: 'VA_TEST_MOCK_SID'
        );

        $this->app->instance(SmsServiceInterface::class, $service);
        $this->app->instance(TwilioSmsService::class, $service);

        return [
            'service' => $service,
            'client' => $mockClient,
            'verifications' => $mockVerifications,
            'verificationChecks' => $mockVerificationChecks,
        ];
    }

    /**
     * Test 1: Send OTP OK (no local OTP generated, cooldown 120s returned)
     */
    public function test_send_otp_success_with_mocked_twilio(): void
    {
        $mocks = $this->createServiceWithMockedTwilioClient();
        $mocks['verifications']->shouldReceive('create')
            ->once()
            ->with('+919876543210', 'sms')
            ->andReturn((object)['status' => 'pending']);

        $response = $this->postJson('/api/auth/send-otp', [
            'phone' => '9876543210',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'cooldown' => 120,
                'retry_after' => 120,
                'user_exists' => false,
            ]);

        // Assert response does NOT contain full phone number or any OTP secrets
        $data = $response->json();
        $this->assertStringNotContainsString('9876543210', $data['phone']);
        $this->assertArrayNotHasKey('otp', $data);
        $this->assertArrayNotHasKey('otp_hash', $data);

        // Verify DB does not store plain or hashed OTP
        $user = User::where('phone', '9876543210')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->otp);
        $this->assertNull($user->otp_hash);
        $this->assertNotNull($user->otp_sent_at);
    }

    /**
     * Test 2: Invalid phone number returns 422
     */
    public function test_send_otp_invalid_phone_returns_422(): void
    {
        $response1 = $this->postJson('/api/auth/send-otp', [
            'phone' => '12345',
        ]);
        $response1->assertStatus(422)
            ->assertJson(['status' => 'error']);

        // Invalid Indian mobile prefix (starts with 5 instead of 6-9)
        $response2 = $this->postJson('/api/auth/send-otp', [
            'phone' => '5123456789',
        ]);
        $response2->assertStatus(422)
            ->assertJson(['status' => 'error']);
    }

    /**
     * Test 3: 120-second resend cooldown returns HTTP 429 and integer retry_after
     */
    public function test_send_otp_resend_cooldown_returns_429_with_integer_retry_after(): void
    {
        $user = User::create([
            'phone' => '9876543210',
            'role' => 'customer',
            'otp_sent_at' => Carbon::now()->subSeconds(30), // Sent 30 seconds ago
        ]);

        $response = $this->postJson('/api/auth/send-otp', [
            'phone' => '9876543210',
        ]);

        $response->assertStatus(429)
            ->assertJson(['status' => 'error']);

        $retryAfter = $response->json('retry_after');
        $this->assertIsInt($retryAfter);
        $this->assertGreaterThan(0, $retryAfter);
        $this->assertLessThanOrEqual(90, $retryAfter);

        // Also test the /auth/resend-otp endpoint returns 429 identically
        $resendResponse = $this->postJson('/api/auth/resend-otp', [
            'phone' => '9876543210',
        ]);
        $resendResponse->assertStatus(429);
    }

    /**
     * Test 4: Verify OTP with wrong code returns HTTP 401
     */
    public function test_verify_otp_wrong_code_returns_401(): void
    {
        User::create([
            'phone' => '9876543210',
            'role' => 'customer',
            'otp_sent_at' => Carbon::now()->subMinutes(1),
        ]);

        $mocks = $this->createServiceWithMockedTwilioClient();
        $mocks['verificationChecks']->shouldReceive('create')
            ->once()
            ->with(['to' => '+919876543210', 'code' => '999999'])
            ->andReturn((object)['status' => 'canceled']);

        $response = $this->postJson('/api/auth/verify-otp', [
            'phone' => '9876543210',
            'otp' => '999999',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
            ]);

        $this->assertStringContainsString('Invalid OTP', $response->json('message'));
        $this->assertEquals(4, $response->json('attempts_left'));
    }

    /**
     * Test 5: Verify OTP expired code returns HTTP 401
     */
    public function test_verify_otp_expired_code_returns_401(): void
    {
        User::create([
            'phone' => '9876543210',
            'role' => 'customer',
            'otp_sent_at' => Carbon::now()->subMinutes(11),
        ]);

        $mocks = $this->createServiceWithMockedTwilioClient();
        $mocks['verificationChecks']->shouldReceive('create')
            ->once()
            ->with(['to' => '+919876543210', 'code' => '123456'])
            ->andThrow(new RestException('Verification expired or not found', 60205, 404));

        $response = $this->postJson('/api/auth/verify-otp', [
            'phone' => '9876543210',
            'otp' => '123456',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
            ]);

        $this->assertStringContainsString('expired', strtolower($response->json('message')));
    }

    /**
     * Test 6: New user flow - first verification sets is_new_user: true
     */
    public function test_verify_otp_new_user_flow(): void
    {
        User::create([
            'phone' => '9876543210',
            'role' => 'customer',
            'phone_verified_at' => null,
            'name' => null,
        ]);

        $mocks = $this->createServiceWithMockedTwilioClient();
        $mocks['verificationChecks']->shouldReceive('create')
            ->once()
            ->with(['to' => '+919876543210', 'code' => '123456'])
            ->andReturn((object)['status' => 'approved']);

        $response = $this->postJson('/api/auth/verify-otp', [
            'phone' => '9876543210',
            'otp' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_new_user' => true,
            ]);

        $this->assertNotEmpty($response->json('token'));
        $this->assertEquals('customer', $response->json('user.role'));

        // Check user now has phone_verified_at set
        $user = User::where('phone', '9876543210')->first();
        $this->assertNotNull($user->phone_verified_at);
    }

    /**
     * Test 7: Existing user flow - second verification sets is_new_user: false
     */
    public function test_verify_otp_existing_user_flow(): void
    {
        User::create([
            'name' => 'Existing Customer',
            'email' => 'existing@test-twilio-otp.com',
            'phone' => '9876543210',
            'role' => 'customer',
            'phone_verified_at' => Carbon::now()->subDays(5),
        ]);

        $mocks = $this->createServiceWithMockedTwilioClient();
        $mocks['verificationChecks']->shouldReceive('create')
            ->once()
            ->with(['to' => '+919876543210', 'code' => '123456'])
            ->andReturn((object)['status' => 'approved']);

        $response = $this->postJson('/api/auth/verify-otp', [
            'phone' => '9876543210',
            'otp' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_new_user' => false,
                'user' => [
                    'name' => 'Existing Customer',
                    'email' => 'existing@test-twilio-otp.com',
                ],
            ]);

        $this->assertNotEmpty($response->json('token'));
    }
}
