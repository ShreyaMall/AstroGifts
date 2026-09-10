<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    /**
     * List published blog posts
     */
    public function index(): JsonResponse
    {
        $posts = Post::where('status', 'Published')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $posts,
        ]);
    }

    /**
     * Single post detail
     */
    public function show(string $slug): JsonResponse
    {
        $post = Post::where('slug', $slug)
            ->where('status', 'Published')
            ->first();

        if (!$post) {
            return response()->json([
                'status' => 'error',
                'message' => 'Article not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $post,
        ]);
    }
}
