<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('throttle:5,1');
    }

    protected function tearDown(): void
    {
        User::where('email', 'like', '%@test-auth.com')->delete();
        parent::tearDown();
    }

    public function test_admin_login_issues_a_token_with_the_admin_ability(): void
    {
        $admin = User::create([
            'name' => 'Admin Unit Test',
            'email' => 'admin_success@test-auth.com',
            'password' => Hash::make('admin_pass_123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin_success@test-auth.com',
            'password' => 'admin_pass_123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Admin login successful',
            ])
            ->assertJsonStructure(['token', 'user']);

        $tokenModel = $admin->tokens()->first();
        $this->assertNotNull($tokenModel);
        $this->assertContains('admin', $tokenModel->abilities);
        $this->assertNotContains('*', $tokenModel->abilities);
    }

    public function test_non_admin_and_wrong_password_both_get_the_same_401(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_exist@test-auth.com',
            'password' => Hash::make('correct_pass'),
            'role' => 'admin',
        ]);

        $customer = User::create([
            'name' => 'Customer User',
            'email' => 'customer_user@test-auth.com',
            'password' => Hash::make('customer_pass'),
            'role' => 'customer',
        ]);

        // 1. Admin with wrong password
        $resWrongPass = $this->postJson('/api/admin/login', [
            'email' => 'admin_exist@test-auth.com',
            'password' => 'wrong_pass',
        ]);

        $resWrongPass->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid credentials.',
            ]);

        // 2. Customer trying to log in on admin login
        $resCustomer = $this->postJson('/api/admin/login', [
            'email' => 'customer_user@test-auth.com',
            'password' => 'customer_pass',
        ]);

        $resCustomer->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid credentials.',
            ]);

        // 3. Completely non-existent email
        $resNonExistent = $this->postJson('/api/admin/login', [
            'email' => 'nonexistent@test-auth.com',
            'password' => 'any_pass',
        ]);

        $resNonExistent->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid credentials.',
            ]);
    }

    public function test_customer_token_gets_403_on_admin_stats(): void
    {
        $customer = User::create([
            'name' => 'Customer User',
            'email' => 'customer_stats@test-auth.com',
            'password' => Hash::make('secret'),
            'role' => 'customer',
        ]);

        $customerToken = $customer->createToken('customer_token', ['customer'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$customerToken}")
            ->getJson('/api/admin/stats');

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthorized. Admin privileges required.',
            ]);
    }

    public function test_legacy_token_with_wildcard_gets_403_on_admin_stats(): void
    {
        $admin = User::create([
            'name' => 'Admin Legacy',
            'email' => 'admin_legacy@test-auth.com',
            'password' => Hash::make('secret'),
            'role' => 'admin',
        ]);

        // Token with wildcard ability '*'
        $wildcardToken = $admin->createToken('legacy_token', ['*'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$wildcardToken}")
            ->getJson('/api/admin/stats');

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthorized. Admin privileges required.',
            ]);
    }

    public function test_admin_token_gets_200_on_admin_stats(): void
    {
        $admin = User::create([
            'name' => 'Admin Stats',
            'email' => 'admin_stats@test-auth.com',
            'password' => Hash::make('secret'),
            'role' => 'admin',
        ]);

        $adminToken = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/stats');

        $response->assertStatus(200);
    }

    public function test_admin_logout_invalidates_the_token(): void
    {
        $admin = User::create([
            'name' => 'Admin Logout',
            'email' => 'admin_logout@test-auth.com',
            'password' => Hash::make('secret'),
            'role' => 'admin',
        ]);

        $adminToken = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        $logoutRes = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->postJson('/api/admin/logout');

        $logoutRes->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Admin logged out successfully',
            ]);

        $this->assertEquals(0, $admin->tokens()->count());
        $this->app['auth']->forgetGuards();

        // Trying to access admin route with same token must now fail with 401
        $subsequentRes = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/stats');

        $subsequentRes->assertStatus(401);
    }

    public function test_login_route_is_throttled(): void
    {
        // 5 attempts allowed per minute. 6th should get 429
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', [
                'email' => 'throttle@test-auth.com',
                'password' => 'wrong',
            ]);
        }

        $throttledRes = $this->postJson('/api/admin/login', [
            'email' => 'throttle@test-auth.com',
            'password' => 'wrong',
        ]);

        $throttledRes->assertStatus(429);
    }
}
