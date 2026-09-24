<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FaqController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for AstroGifts E-Commerce
|--------------------------------------------------------------------------
*/

// ── Contact & FAQs ──
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/faqs', [FaqController::class, 'index']);

// ── 1. Authentication Routes ──
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);
    
    Route::post('/send-otp', [AuthController::class, 'sendOtp'])->middleware('throttle:5,1');
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

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
Route::get('/categories/all', [CategoryController::class, 'all']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/bestsellers', [ProductController::class, 'bestsellers']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{identifier}', [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
Route::get('/reviews', [ReviewController::class, 'publicReviews']);
Route::post('/reviews', [ReviewController::class, 'storeGeneral']);
Route::get('/sizes', [SizeController::class, 'publicSizes']);

// ── 3. Sliders & Articles ──
Route::get('/sliders', [SliderController::class, 'index']);
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);
Route::get('/articles/{slug}/comments', [CommentController::class, 'index']);
Route::post('/articles/{slug}/comments', [CommentController::class, 'store']);

// ── 4. Coupons ──
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

// ── 5. Orders & Checkout ──
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
Route::post('/orders/{orderNumber}/return-request', [OrderController::class, 'requestReturn']);

Route::get('/user/orders', [OrderController::class, 'index']);

// ── 6. Admin Endpoints ──
Route::prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    
    // Contacts & FAQs
    Route::get('/contacts', [ContactController::class, 'index']);
    // Wait, the FAQ admin controller operations would require FaqController methods (store, update, delete). Let's define them directly or just add them.
    Route::post('/faqs', [FaqController::class, 'store']);
    Route::put('/faqs/{id}', [FaqController::class, 'update']);
    Route::delete('/faqs/{id}', [FaqController::class, 'destroy']);

    Route::get('/orders', [AdminController::class, 'orders']);
    Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

    Route::get('/products', [AdminController::class, 'products']);
    Route::post('/products', [AdminController::class, 'storeProduct']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
    
    Route::post('/upload', [AdminController::class, 'uploadImage']);

    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);
    Route::get('/sliders', [AdminController::class, 'sliders']);
    Route::post('/sliders', [AdminController::class, 'storeSlider']);
    Route::put('/sliders/{id}', [AdminController::class, 'updateSlider']);
    Route::delete('/sliders/{id}', [AdminController::class, 'deleteSlider']);
    Route::get('/posts', [AdminController::class, 'posts']);
    Route::get('/users', [AdminController::class, 'users']);
    
    // Reviews
    Route::get('/reviews', [ReviewController::class, 'allReviews']);
    Route::post('/reviews', [ReviewController::class, 'adminStore']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Sizes
    Route::get('/sizes', [SizeController::class, 'index']);
    Route::post('/sizes', [SizeController::class, 'store']);
    Route::put('/sizes/{id}', [SizeController::class, 'update']);
    Route::delete('/sizes/{id}', [SizeController::class, 'destroy']);

    // Comments
    Route::get('/comments', [CommentController::class, 'allComments']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
});

// ── 7. Settings ──
Route::get('/settings/whatsapp', function () {
    return response()->json([
        'whatsapp_number' => env('WHATSAPP_NUMBER', '+911234567890')
    ]);
});
