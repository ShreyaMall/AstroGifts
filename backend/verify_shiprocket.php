<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;
use App\Services\ShiprocketService;

Cache::forget('shiprocket_token');
$shiprocket = new ShiprocketService();
$token = $shiprocket->getToken();

if ($token) {
    echo "SUCCESS: Shiprocket Token generated successfully!\n";
    echo "Token: " . substr($token, 0, 20) . "...\n";
} else {
    echo "FAILED: Could not authenticate with Shiprocket. Check backend/storage/logs/laravel.log\n";
}
