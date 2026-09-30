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
        ['name' => 'Standard Pack / Box',    'code' => 'STD',    'dimensions' => 'Standard Box',          'status' => 'Active', 'order' => 1],
        ['name' => 'Small Box (S)',          'code' => 'S',      'dimensions' => 'Compact Gift Box',      'status' => 'Active', 'order' => 2],
        ['name' => 'Medium Box (M)',         'code' => 'M',      'dimensions' => 'Regular Hamper Box',    'status' => 'Active', 'order' => 3],
        ['name' => 'Large Luxury Hamper',    'code' => 'L',      'dimensions' => 'Premium Gift Hamper',   'status' => 'Active', 'order' => 4],
        ['name' => 'Mega Celebration Box',   'code' => 'XL',     'dimensions' => 'Deluxe Gift Box',       'status' => 'Active', 'order' => 5],
        ['name' => 'Free Size (Adjustable)', 'code' => 'FREE',   'dimensions' => 'Adjustable Jewelry',    'status' => 'Active', 'order' => 6],
        ['name' => 'Ring Size 12',           'code' => 'R12',    'dimensions' => '16.5mm Inner Dia',      'status' => 'Active', 'order' => 7],
        ['name' => 'Ring Size 14',           'code' => 'R14',    'dimensions' => '17.2mm Inner Dia',      'status' => 'Active', 'order' => 8],
        ['name' => 'Ring Size 16',           'code' => 'R16',    'dimensions' => '17.8mm Inner Dia',      'status' => 'Active', 'order' => 9],
        ['name' => 'Standard Bouquet',       'code' => 'B10',    'dimensions' => '10 Fresh Stems',        'status' => 'Active', 'order' => 10],
        ['name' => 'Luxury Grand Bouquet',   'code' => 'B25',    'dimensions' => '25 Fresh Stems',        'status' => 'Active', 'order' => 11],
    ];

    /**
     * Get all sizes (Admin)
     */
    public function index()
    {
        try {
            $sizes = Size::all();

            // Refresh default sizes if empty or containing old furniture sizes
            $hasOldSizes = $sizes->pluck('name')->contains(fn($name) => str_contains($name, 'Sofa') || str_contains($name, 'King Size'));
            if ($sizes->isEmpty() || $hasOldSizes) {
                Size::query()->delete();
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
