<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;

class ColorController extends Controller
{
    /**
     * Default admin colors list
     */
    protected $defaultColors = [
        ['name' => 'White',       'hex' => '#ffffff', 'status' => 'Active', 'order' => 1],
        ['name' => 'Black',       'hex' => '#1a1a1a', 'status' => 'Active', 'order' => 2],
        ['name' => 'Blue',        'hex' => '#0066cc', 'status' => 'Active', 'order' => 3],
        ['name' => 'Red',         'hex' => '#d93838', 'status' => 'Active', 'order' => 4],
        ['name' => 'Gold',        'hex' => '#d4af37', 'status' => 'Active', 'order' => 5],
        ['name' => 'Multicolor',  'hex' => 'conic-gradient(#8ce055 0 90deg, #ea5455 90deg 180deg, #f5c045 180deg 270deg, #a754f5 270deg 360deg)', 'status' => 'Active', 'order' => 6],
        ['name' => 'Mix Color',   'hex' => 'conic-gradient(#8ce055 0 90deg, #ea5455 90deg 180deg, #f5c045 180deg 270deg, #a754f5 270deg 360deg)', 'status' => 'Active', 'order' => 7],
        ['name' => 'Brown',       'hex' => '#6e3b1c', 'status' => 'Active', 'order' => 8],
        ['name' => 'Light Brown', 'hex' => '#b5835a', 'status' => 'Active', 'order' => 9],
        ['name' => 'Pink',        'hex' => '#e87a90', 'status' => 'Active', 'order' => 10],
        ['name' => 'Silver',      'hex' => '#c0c0c0', 'status' => 'Active', 'order' => 11],
        ['name' => 'Green',       'hex' => '#27ae60', 'status' => 'Active', 'order' => 12],
        ['name' => 'Navy Blue',   'hex' => '#1b2a4a', 'status' => 'Active', 'order' => 13],
        ['name' => 'Maroon',      'hex' => '#800020', 'status' => 'Active', 'order' => 14],
        ['name' => 'Grey',        'hex' => '#95a5a6', 'status' => 'Active', 'order' => 15],
        ['name' => 'Rose Gold',   'hex' => '#b76e79', 'status' => 'Active', 'order' => 16],
        ['name' => 'Purple',      'hex' => '#800080', 'status' => 'Active', 'order' => 17],
        ['name' => 'Yellow',      'hex' => '#f4d03f', 'status' => 'Active', 'order' => 18],
        ['name' => 'Beige',       'hex' => '#f5f5dc', 'status' => 'Active', 'order' => 19],
        ['name' => 'Orange',      'hex' => '#f07d26', 'status' => 'Active', 'order' => 20],
    ];

    /**
     * Ensure default colors exist in DB
     */
    public function seedDefaults()
    {
        if (Color::count() === 0) {
            foreach ($this->defaultColors as $c) {
                Color::create($c);
            }
        }
    }

    /**
     * Get all colors (Admin)
     */
    public function index()
    {
        try {
            $this->seedDefaults();
            $colors = Color::all();

            return response()->json([
                'success' => true,
                'data' => $colors,
                'total' => count($colors)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store new color (Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:100',
            'hex'    => 'nullable|string|max:255',
            'code'   => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Active,Inactive',
        ]);

        try {
            $name = trim($validated['name']);
            $hex  = trim($validated['hex'] ?? $validated['code'] ?? '#000000');

            $color = Color::create([
                'name'   => $name,
                'hex'    => $hex,
                'status' => $validated['status'] ?? 'Active',
                'order'  => Color::count() + 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Color created successfully!',
                'data'    => $color
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create color: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update color (Admin)
     */
    public function update(Request $request, $id)
    {
        try {
            $color = Color::find($id) ?? Color::where('_id', $id)->first();
            if (!$color) {
                return response()->json(['success' => false, 'message' => 'Color not found'], 404);
            }

            $updateData = [];
            if ($request->has('name')) {
                $updateData['name'] = trim($request->name);
            }
            if ($request->has('hex')) {
                $updateData['hex'] = trim($request->hex);
            }
            if ($request->has('code')) {
                $updateData['hex'] = trim($request->code);
            }
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }

            $color->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Color updated successfully!',
                'data'    => $color
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete color (Admin)
     */
    public function destroy($id)
    {
        try {
            $color = Color::find($id) ?? Color::where('_id', $id)->first();
            if ($color) {
                $color->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Color deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active colors (Public frontend)
     */
    public function publicColors()
    {
        try {
            $this->seedDefaults();
            $colors = Color::where('status', 'Active')->get();
            return response()->json([
                'success' => true,
                'data' => $colors
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
