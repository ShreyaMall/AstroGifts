<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    /**
     * Default sizes seed list
     */
    protected $defaultSizes = [
        ['name' => 'Small (S)',       'code' => 'S',      'dimensions' => 'Compact / Standard',     'status' => 'Active', 'order' => 1],
        ['name' => 'Medium (M)',      'code' => 'M',      'dimensions' => 'Standard Comfort',       'status' => 'Active', 'order' => 2],
        ['name' => 'Large (L)',       'code' => 'L',      'dimensions' => 'Spacious / Executive',   'status' => 'Active', 'order' => 3],
        ['name' => 'Extra Large',     'code' => 'XL',     'dimensions' => 'Oversized Lounge',       'status' => 'Active', 'order' => 4],
        ['name' => 'King Size',       'code' => 'KING',   'dimensions' => '72" x 78" (183x198 cm)', 'status' => 'Active', 'order' => 5],
        ['name' => 'Queen Size',      'code' => 'QUEEN',  'dimensions' => '60" x 78" (152x198 cm)', 'status' => 'Active', 'order' => 6],
        ['name' => 'Single Bed',      'code' => 'SINGLE', 'dimensions' => '36" x 75" (91x190 cm)',  'status' => 'Active', 'order' => 7],
        ['name' => '2-Seater Sofa',   'code' => '2S',     'dimensions' => 'W 145 x D 88 x H 85 cm', 'status' => 'Active', 'order' => 8],
        ['name' => '3-Seater Sofa',   'code' => '3S',     'dimensions' => 'W 205 x D 92 x H 88 cm', 'status' => 'Active', 'order' => 9],
        ['name' => 'L-Shape Modular', 'code' => 'L-SHP',  'dimensions' => 'W 260 x D 160 x H 85 cm','status' => 'Active', 'order' => 10],
    ];

    /**
     * Get all sizes (Admin)
     */
    public function index()
    {
        try {
            $sizes = Size::all();

            // Auto-seed defaults if collection is empty
            if ($sizes->isEmpty()) {
                foreach ($this->defaultSizes as $d) {
                    Size::create($d);
                }
                $sizes = Size::all();
            }

            return response()->json([
                'success' => true,
                'data' => $sizes,
                'total' => count($sizes)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store new size (Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'code'       => 'nullable|string|max:20',
            'dimensions' => 'nullable|string|max:255',
            'status'     => 'nullable|string|in:Active,Inactive',
        ]);

        try {
            $name = trim($validated['name']);
            $code = !empty($validated['code']) 
                ? strtoupper(trim($validated['code'])) 
                : strtoupper(substr($name, 0, 3));

            $size = Size::create([
                'name'       => $name,
                'code'       => $code,
                'dimensions' => trim($validated['dimensions'] ?? 'Standard'),
                'status'     => $validated['status'] ?? 'Active',
                'order'      => Size::count() + 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Size created successfully!',
                'data'    => $size
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create size: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update size (Admin)
     */
    public function update(Request $request, $id)
    {
        try {
            $size = Size::find($id) ?? Size::where('_id', $id)->first();
            if (!$size) {
                return response()->json(['success' => false, 'message' => 'Size not found'], 404);
            }

            $updateData = [];
            if ($request->has('name')) {
                $updateData['name'] = trim($request->name);
            }
            if ($request->has('code')) {
                $updateData['code'] = strtoupper(trim($request->code));
            }
            if ($request->has('dimensions')) {
                $updateData['dimensions'] = trim($request->dimensions);
            }
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }

            $size->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Size updated successfully!',
                'data'    => $size
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete size (Admin)
     */
    public function destroy($id)
    {
        try {
            $size = Size::find($id) ?? Size::where('_id', $id)->first();
            if ($size) {
                $size->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Size deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active sizes (Public frontend)
     */
    public function publicSizes()
    {
        try {
            $sizes = Size::where('status', 'Active')->get();
            return response()->json([
                'success' => true,
                'data' => $sizes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
