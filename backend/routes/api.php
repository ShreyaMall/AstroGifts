<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SliderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for WoodMart E-Commerce
|--------------------------------------------------------------------------
*/

// ── 1. Authentication Routes ──
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('/addresses', \App\Http\Controllers\Api\AddressController::class);
});

// ── 2. Catalog & Products ──
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/bestsellers', [ProductController::class, 'bestsellers']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{identifier}', [ProductController::class, 'show']);

// ── 3. Sliders & Articles ──
Route::get('/sliders', [SliderController::class, 'index']);
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

// ── 4. Coupons ──
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

// ── 5. Orders & Checkout ──
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/orders', [OrderController::class, 'index']);
});

// ── 6. Admin Endpoints ──
Route::prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/orders', [AdminController::class, 'orders']);
    Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

    Route::get('/products', [AdminController::class, 'products']);
    Route::post('/products', [AdminController::class, 'storeProduct']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
    
    Route::post('/upload', [AdminController::class, 'uploadImage']);

    Route::get('/categories', [AdminController::class, 'categories']);
    Route::get('/sliders', [AdminController::class, 'sliders']);
    Route::get('/posts', [AdminController::class, 'posts']);
    Route::get('/users', [AdminController::class, 'users']);
});
