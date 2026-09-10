<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Validate a promo / coupon code
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'nullable|numeric',
        ]);

        $code = strtoupper(trim($request->code));
        $coupon = Coupon::where('code', $code)->where('is_active', true)->first();

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired coupon code. Try WOODMART15 or WOODMART20.',
            ], 404);
        }

        $subtotal = (float) $request->get('subtotal', 0);
        if ($subtotal < $coupon->min_spend) {
            return response()->json([
                'status' => 'error',
                'message' => "Minimum purchase of \${$coupon->min_spend} required for this coupon.",
            ], 422);
        }

        $discountAmount = round(($subtotal * $coupon->discount_percent) / 100, 2);

        return response()->json([
            'status' => 'success',
            'message' => "{$coupon->discount_percent}% discount coupon applied successfully!",
            'data' => [
                'code' => $coupon->code,
                'discount_percent' => $coupon->discount_percent,
                'discount_amount' => $discountAmount,
            ],
        ]);
    }
}
