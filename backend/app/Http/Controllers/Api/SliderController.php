<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\JsonResponse;

class SliderController extends Controller
{
    /**
     * List active hero sliders
     */
    public function index(): JsonResponse
    {
        $sliders = Slider::where('status', 'Active')
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $sliders,
        ]);
    }
}
