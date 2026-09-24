<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\ShiprocketService;

$service = new ShiprocketService();
$dummyOrder = new stdClass();
$dummyOrder->order_number = 'TEST-' . rand(1000, 9999);
$dummyOrder->created_at = now();
$dummyOrder->customer_name = 'Test User';
$dummyOrder->phone = '9876543210';
$dummyOrder->shipping_address = '123 Test Street, Some Area';
$dummyOrder->city = 'New Delhi';
$dummyOrder->state = 'Delhi';
$dummyOrder->zip = '110001';
$dummyOrder->email = 'test@example.com';
$dummyOrder->payment_method = 'COD';
$dummyOrder->total = 500;
$dummyOrder->items = [
    (object)[
        'product_name' => 'Test Product',
        'product_id' => '123',
        'quantity' => 1,
        'price' => 500,
    ]
];

$response = $service->createOrder($dummyOrder);
print_r($response);
