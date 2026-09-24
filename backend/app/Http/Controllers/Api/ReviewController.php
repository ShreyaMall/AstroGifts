<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific product
     */
    public function index($productId)
    {
        try {
            $reviews = Review::where('product_id', (string)$productId)
                ->orWhere('product_slug', (string)$productId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews,
                'total' => count($reviews)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new review for a product
     */
    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'user_name'  => 'required|string|max:100',
            'user_email' => 'nullable|email|max:150',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|min:3|max:1000',
        ]);

        try {
            $product = Product::find($productId) ?? Product::where('slug', $productId)->first();
            $prodName = $request->product_name ?: ($product?->name ?: 'Chair #' . $productId);
            $prodImg = $request->product_image ?: ($product?->image ?: '/chair1.jpg');
            $userName = trim($validated['user_name']);
            $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($userName) . '&background=fbe2d0&color=d96b27';

            $review = Review::create([
                'product_id'    => (string)$productId,
                'product_slug'  => (string)$productId,
                'product_name'  => $prodName,
                'product_image' => $prodImg,
                'user_name'     => $userName,
                'user_email'    => $validated['user_email'] ?? null,
                'user_image'    => $avatar,
                'image'         => $prodImg,
                'rating'        => (int)$validated['rating'],
                'comment'       => trim($validated['comment']),
                'status'        => 'Pending',
                'created_at'    => now()->toDateTimeString(),
            ]);

            // Update average rating on product if product exists
            try {
                $avgRating = Review::where('product_id', (string)$productId)->avg('rating');
                if ($product && $avgRating) {
                    $product->update(['rating' => round($avgRating, 1)]);
                }
            } catch (\Exception $ex) {
                // Ignore product rating update error if any
            }

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully!',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public: Get active reviews for frontend homepage / testimonials
     */
    public function publicReviews()
    {
        try {
            $reviews = Review::where(function($q) {
                    $q->where('status', 'Approved')
                      ->orWhere('status', 'Active');
                })
                ->orderBy('created_at', 'desc')
                ->take(12)
                ->get();

            foreach ($reviews as $rev) {
                if (empty($rev->image)) {
                    $rev->image = $rev->user_image ?: ('https://ui-avatars.com/api/?name=' . urlencode($rev->user_name ?? 'User') . '&background=fbe2d0&color=d96b27');
                }
                $rev->name = $rev->user_name ?? 'Customer';
                $rev->message = $rev->comment ?? '';
            }

            return response()->json([
                'success' => true,
                'data' => $reviews,
                'total' => count($reviews)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public: Submit general review from frontend
     */
    public function storeGeneral(Request $request)
    {
        $validated = $request->validate([
            'user_name'  => 'required|string|max:100',
            'user_email' => 'nullable|email|max:150',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|min:3|max:1000',
        ]);

        try {
            $userName = trim($validated['user_name']);
            $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($userName) . '&background=fbe2d0&color=d96b27';

            $review = Review::create([
                'product_id'    => $request->product_id ?? 'general',
                'product_slug'  => $request->product_slug ?? 'general',
                'product_name'  => $request->product_name ?? 'Homewood Decor Store',
                'product_image' => $request->product_image ?? '/chair1.jpg',
                'user_name'     => $userName,
                'user_email'    => $validated['user_email'] ?? null,
                'user_image'    => $avatar,
                'image'         => $avatar,
                'rating'        => (int)$validated['rating'],
                'comment'       => trim($validated['comment']),
                'status'        => 'Active',
                'created_at'    => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully!',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get all reviews
     */
    public function allReviews()
    {
        try {
            $reviews = Review::orderBy('created_at', 'desc')->get();
            
            // Populate product info if missing and normalize status to Pending, Approved, or Rejected
            foreach ($reviews as $rev) {
                if (empty($rev->status) || $rev->status === 'Pending') {
                    $rev->status = 'Pending';
                } elseif ($rev->status === 'Active' || $rev->status === 'Approved') {
                    $rev->status = 'Approved';
                } elseif ($rev->status === 'Inactive' || $rev->status === 'Rejected') {
                    $rev->status = 'Rejected';
                } else {
                    $rev->status = 'Pending';
                }
                if (empty($rev->image)) {
                    $rev->image = $rev->user_image ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                }
                $rev->name = $rev->user_name ?? 'Customer';
                $rev->message = $rev->comment ?? '';
                if (empty($rev->product_name) || empty($rev->product_image)) {
                    $prod = Product::find($rev->product_id) ?? Product::where('slug', $rev->product_id)->first();
                    if ($prod) {
                        $rev->product_name = $prod->name;
                        $rev->product_image = $prod->image;
                    } else {
                        $rev->product_name = 'General Product';
                        $rev->product_image = '/chair1.jpg';
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $reviews,
                'total' => count($reviews)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update review status or details
     */
    public function update(Request $request, $id)
    {
        try {
            $review = Review::find($id) ?? Review::where('_id', $id)->first();
            if (!$review) {
                return response()->json(['success' => false, 'message' => 'Review not found'], 404);
            }

            $review->update($request->only(['status', 'user_name', 'comment', 'rating', 'user_image', 'image', 'product_name']));

            return response()->json([
                'success' => true,
                'message' => 'Review updated successfully',
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Admin: Delete review
     */
    public function destroy($id)
    {
        try {
            $review = Review::find($id) ?? Review::where('_id', $id)->first();
            if ($review) {
                $review->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Admin: Add review manually
     */
    public function adminStore(Request $request)
    {
        $validated = $request->validate([
            'user_name'    => 'required|string|max:100',
            'comment'      => 'required|string',
            'rating'       => 'required|integer|min:1|max:5',
            'status'       => 'nullable|string',
            'product_name' => 'nullable|string',
            'product_image'=> 'nullable|string',
        ]);

        try {
            $review = Review::create([
                'product_id'    => $request->product_id ?? 'custom',
                'product_slug'  => $request->product_id ?? 'custom',
                'product_name'  => $validated['product_name'] ?? 'Premium Chair',
                'product_image' => $validated['product_image'] ?? '/chair1.jpg',
                'user_name'     => trim($validated['user_name']),
                'user_email'    => $request->user_email ?? null,
                'user_image'    => $request->user_image ?? $request->image ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'image'         => $request->image ?? $request->user_image ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                'rating'        => (int)$validated['rating'],
                'comment'       => trim($validated['comment']),
                'status'        => $validated['status'] ?? 'Approved',
                'created_at'    => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review created successfully!',
                'data' => $review
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
