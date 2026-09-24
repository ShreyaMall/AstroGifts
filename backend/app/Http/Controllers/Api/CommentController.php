<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get approved comments for a specific article
     */
    public function index(string $slug): JsonResponse
    {
        try {
            $comments = Comment::where('post_slug', $slug)
                ->where('status', 'Approved')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $comments,
                'total' => count($comments),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a new comment for a blog post
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'nullable|string|max:100',
            'email'   => 'nullable|email|max:150',
            'comment' => 'required|string|min:2|max:2000',
        ]);

        try {
            $post = Post::where('slug', $slug)->first();
            $userName = trim($validated['name'] ?? '') ?: 'Guest Reader';
            $userEmail = trim($validated['email'] ?? '') ?: null;
            $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($userName) . '&background=fbe2d0&color=d96b27';

            $comment = Comment::create([
                'post_id'     => (string)($post?->_id ?? $post?->id ?? $slug),
                'post_slug'   => $slug,
                'post_title'  => $post?->title ?? $slug,
                'user_name'   => $userName,
                'user_email'  => $userEmail,
                'user_avatar' => $avatar,
                'comment'     => trim($validated['comment']),
                'status'      => 'Approved',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Comment posted successfully',
                'data'    => $comment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: List all comments
     */
    public function allComments(): JsonResponse
    {
        try {
            $comments = Comment::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $comments,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete comment
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $comment = Comment::find($id);
            if ($comment) {
                $comment->delete();
            }
            return response()->json([
                'success' => true,
                'message' => 'Comment deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
