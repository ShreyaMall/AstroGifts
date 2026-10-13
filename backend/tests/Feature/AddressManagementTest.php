<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AddressManagementTest extends TestCase
{
    private User $userA;
    private User $userB;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('throttle:30,1');
        RateLimiter::clear('throttle:60,1');

        $this->userA = User::create([
            'name' => 'User Alpha',
            'email' => 'alpha@test-address.com',
            'phone' => '9876543210',
            'phone_verified_at' => Carbon::now(),
            'role' => 'customer',
        ]);

        $this->userB = User::create([
            'name' => 'User Beta',
            'email' => 'beta@test-address.com',
            'phone' => '9876543211',
            'phone_verified_at' => Carbon::now(),
            'role' => 'customer',
        ]);
    }

    protected function tearDown(): void
    {
        Address::whereIn('user_id', [(string)$this->userA->id, (string)$this->userB->id])->forceDelete();
        Order::whereIn('user_id', [(string)$this->userA->id, (string)$this->userB->id])->delete();
        Order::where('email', 'like', '%@test-address.com')->delete();
        User::whereIn('email', ['alpha@test-address.com', 'beta@test-address.com', 'guest@test-address.com'])->delete();
        parent::tearDown();
    }

    private function getSampleAddressPayload(array $overrides = []): array
    {
        return array_merge([
            'full_name' => 'Aditi Sharma',
            'phone' => '9876543210',
            'line1' => 'Flat 302, Sunrise Towers, MG Road',
            'line2' => 'Near Central Park',
            'landmark' => 'Behind City Mall',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'pincode' => '560001',
            'country' => 'India',
            'label' => 'Home',
        ], $overrides);
    }

    public function test_user_can_create_and_list_addresses_scoped_to_owner(): void
    {
        $payload = $this->getSampleAddressPayload();

        $response = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/addresses', $payload);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'full_name' => 'Aditi Sharma',
            'city' => 'Bengaluru',
            'is_default' => true, // First address automatically becomes default
        ]);

        $listResponse = $this->actingAs($this->userA, 'sanctum')
            ->getJson('/api/addresses');

        $listResponse->assertStatus(200);
        $listResponse->assertJsonCount(1);

        // User B should see 0 addresses
        $bResponse = $this->actingAs($this->userB, 'sanctum')
            ->getJson('/api/addresses');
        $bResponse->assertStatus(200);
        $bResponse->assertJsonCount(0);
    }

    public function test_another_user_gets_404_when_accessing_updating_deleting_address(): void
    {
        $address = $this->userA->addresses()->create($this->getSampleAddressPayload([
            'is_default' => true,
        ]));

        $addrId = (string)($address->_id ?? $address->id);

        // User B tries to view User A's address
        $responseShow = $this->actingAs($this->userB, 'sanctum')
            ->getJson("/api/addresses/{$addrId}");
        $responseShow->assertStatus(404);

        // User B tries to update User A's address
        $responseUpdate = $this->actingAs($this->userB, 'sanctum')
            ->putJson("/api/addresses/{$addrId}", [
                'city' => 'Hacked City',
            ]);
        $responseUpdate->assertStatus(404);

        // User B tries to delete User A's address
        $responseDelete = $this->actingAs($this->userB, 'sanctum')
            ->deleteJson("/api/addresses/{$addrId}");
        $responseDelete->assertStatus(404);

        // User B tries to set User A's address as default
        $responseDefault = $this->actingAs($this->userB, 'sanctum')
            ->postJson("/api/addresses/{$addrId}/default");
        $responseDefault->assertStatus(404);

        // Verify User A's address is intact
        $this->assertDatabaseHas('addresses', [
            '_id' => $address->_id ?? $address->id,
            'city' => 'Bengaluru',
        ]);
    }

    public function test_duplicate_address_is_not_created_returns_existing(): void
    {
        $payload = $this->getSampleAddressPayload();

        $first = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/addresses', $payload);
        $first->assertStatus(201);
        $firstId = $first->json('id') ?: $first->json('_id');

        // Post exact same user_id + full_name + phone + line1 + pincode
        $second = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/addresses', $payload);

        $second->assertStatus(200);
        $secondId = $second->json('id') ?: $second->json('_id');
        $this->assertEquals((string)$firstId, (string)$secondId);

        // Verify database only has 1 record for user A
        $count = $this->userA->addresses()->count();
        $this->assertEquals(1, $count);
    }

    public function test_default_rules_and_promotion_when_default_deleted(): void
    {
        // 1st address: becomes default
        $addr1 = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/addresses', $this->getSampleAddressPayload([
                'line1' => 'Address One, Lane 1',
            ]))->json();

        $this->assertTrue($addr1['is_default']);

        // 2nd address: not default
        $addr2 = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/addresses', $this->getSampleAddressPayload([
                'line1' => 'Address Two, Lane 2',
            ]))->json();

        $this->assertFalse($addr2['is_default']);

        // Set 2nd address as default
        $setDefaultRes = $this->actingAs($this->userA, 'sanctum')
            ->postJson("/api/addresses/{$addr2['id']}/default");
        $setDefaultRes->assertStatus(200);

        // Delete the default address (addr2)
        $delRes = $this->actingAs($this->userA, 'sanctum')
            ->deleteJson("/api/addresses/{$addr2['id']}");
        $delRes->assertStatus(200);

        // addr1 should now be promoted to default
        $refreshed1 = $this->userA->addresses()->where('_id', $addr1['id'])->orWhere('id', $addr1['id'])->first();
        $this->assertNotNull($refreshed1);
        $this->assertTrue((bool)$refreshed1->is_default);
    }

    public function test_order_address_snapshot_remains_unchanged_after_saved_address_edited_or_deleted(): void
    {
        $address = $this->userA->addresses()->create($this->getSampleAddressPayload([
            'is_default' => true,
        ]));
        $addrId = (string)($address->_id ?? $address->id);

        $orderPayload = [
            'customer_name' => 'Aditi Sharma',
            'email' => 'alpha@test-address.com',
            'phone' => '9876543210',
            'shipping_address' => 'Flat 302, Sunrise Towers, MG Road',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'zip' => '560001',
            'address_id' => $addrId,
            'payment_method' => 'cod',
            'items' => [
                [
                    'name' => 'Zodiac Crystal Pendant',
                    'price' => 499,
                    'quantity' => 1,
                ]
            ],
            'total' => 499,
        ];

        $orderRes = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/orders', $orderPayload);

        $orderRes->assertStatus(201);
        $orderNumber = $orderRes->json('data.order_number') ?: $orderRes->json('order.order_number');
        $this->assertNotEmpty($orderNumber);

        // Verify order has address_snapshot
        $order = Order::where('order_number', $orderNumber)->first();
        $this->assertNotNull($order);
        $this->assertNotNull($order->address_snapshot);
        $this->assertEquals('Flat 302, Sunrise Towers, MG Road', $order->address_snapshot['line1']);
        $this->assertEquals('Bengaluru', $order->address_snapshot['city']);

        // Now modify the saved address
        $this->actingAs($this->userA, 'sanctum')
            ->putJson("/api/addresses/{$addrId}", [
                'full_name' => 'New Name Modified',
                'line1' => 'Completely Different Street 999',
                'city' => 'Mumbai',
                'pincode' => '400001',
            ])->assertStatus(200);

        // Delete the saved address
        $this->actingAs($this->userA, 'sanctum')
            ->deleteJson("/api/addresses/{$addrId}")
            ->assertStatus(200);

        // Past order snapshot must remain untouched!
        $orderRefreshed = Order::where('order_number', $orderNumber)->first();
        $this->assertEquals('Aditi Sharma', $orderRefreshed->customer_name);
        $this->assertEquals('Flat 302, Sunrise Towers, MG Road', $orderRefreshed->shipping_address);
        $this->assertEquals('Flat 302, Sunrise Towers, MG Road', $orderRefreshed->address_snapshot['line1']);
        $this->assertEquals('Bengaluru', $orderRefreshed->address_snapshot['city']);
        $this->assertEquals('560001', $orderRefreshed->address_snapshot['pincode']);
    }

    public function test_order_with_save_address_false_does_not_save_to_user_addresses(): void
    {
        $this->assertEquals(0, $this->userA->addresses()->count());

        $orderPayload = [
            'customer_name' => 'Aditi Sharma',
            'email' => 'alpha@test-address.com',
            'phone' => '9876543210',
            'shipping_address' => 'Temporary Hotel Address, Room 101',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'zip' => '302001',
            'save_address' => false,
            'payment_method' => 'cod',
            'items' => [
                [
                    'name' => 'Zodiac Crystal Pendant',
                    'price' => 499,
                    'quantity' => 1,
                ]
            ],
            'total' => 499,
        ];

        $res = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/orders', $orderPayload);

        $res->assertStatus(201);
        $this->assertEquals(0, $this->userA->addresses()->count());
    }

    public function test_order_with_save_address_true_saves_address_duplicate_safely(): void
    {
        $this->assertEquals(0, $this->userA->addresses()->count());

        $orderPayload = [
            'customer_name' => 'Aditi Sharma',
            'email' => 'alpha@test-address.com',
            'phone' => '9876543210',
            'shipping_address' => 'House 42, Green Park',
            'city' => 'Delhi',
            'state' => 'Delhi',
            'zip' => '110016',
            'save_address' => true,
            'payment_method' => 'cod',
            'items' => [
                [
                    'name' => 'Zodiac Crystal Pendant',
                    'price' => 499,
                    'quantity' => 1,
                ]
            ],
            'total' => 499,
        ];

        $res = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/orders', $orderPayload);

        $res->assertStatus(201);
        $this->assertEquals(1, $this->userA->addresses()->count());

        $saved = $this->userA->addresses()->first();
        $this->assertEquals('House 42, Green Park', $saved->line1);
        $this->assertTrue((bool)$saved->is_default);

        // Place a second order with same address and save_address: true
        $res2 = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/orders', $orderPayload);
        $res2->assertStatus(201);

        // Duplicate check prevented second row
        $this->assertEquals(1, $this->userA->addresses()->count());
    }

    public function test_order_with_another_users_address_id_returns_422(): void
    {
        // Create an address belonging to User B
        $userBAddr = Address::create([
            'user_id' => (string)$this->userB->id,
            'full_name' => 'User Beta',
            'phone' => '9876543211',
            'line1' => 'Private Villa 99',
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'pincode' => '411001',
            'country' => 'India',
        ]);

        $orderPayload = [
            'customer_name' => 'User Alpha',
            'email' => 'alpha@test-address.com',
            'phone' => '9876543210',
            'shipping_address' => 'Private Villa 99',
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'zip' => '411001',
            'address_id' => (string)($userBAddr->_id ?? $userBAddr->id),
            'payment_method' => 'cod',
            'items' => [
                [
                    'name' => 'Zodiac Crystal Pendant',
                    'price' => 499,
                    'quantity' => 1,
                ]
            ],
            'total' => 499,
        ];

        // User A tries to use User B's address_id
        $res = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/orders', $orderPayload);

        $res->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'The selected delivery address is invalid or does not belong to your account.');
    }

    public function test_order_with_valid_owned_address_id_succeeds(): void
    {
        // Create an address belonging to User A
        $userAAddr = Address::create([
            'user_id' => (string)$this->userA->id,
            'full_name' => 'User Alpha',
            'phone' => '9876543210',
            'line1' => 'My Personal House 12',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'pincode' => '560001',
            'country' => 'India',
        ]);

        $orderPayload = [
            'customer_name' => 'User Alpha',
            'email' => 'alpha@test-address.com',
            'phone' => '9876543210',
            'shipping_address' => 'My Personal House 12',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'zip' => '560001',
            'address_id' => (string)($userAAddr->_id ?? $userAAddr->id),
            'payment_method' => 'cod',
            'items' => [
                [
                    'name' => 'Zodiac Crystal Pendant',
                    'price' => 499,
                    'quantity' => 1,
                ]
            ],
            'total' => 499,
        ];

        // User A uses their own address_id
        $res = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/orders', $orderPayload);

        $res->assertStatus(201)
            ->assertJsonPath('status', 'success');
    }

    public function test_order_without_valid_address_payload_returns_422(): void
    {
        $invalidPayload = [
            'customer_name' => 'User Alpha',
            'email' => 'alpha@test-address.com',
            'phone' => '9876543210',
            // Missing shipping_address and city
            'payment_method' => 'cod',
            'items' => [
                [
                    'name' => 'Zodiac Crystal Pendant',
                    'price' => 499,
                    'quantity' => 1,
                ]
            ],
            'total' => 499,
        ];

        $res = $this->actingAs($this->userA, 'sanctum')
            ->postJson('/api/orders', $invalidPayload);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['shipping_address', 'city']);
    }
}
