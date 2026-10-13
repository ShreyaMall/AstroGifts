<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    /**
     * List all addresses for authenticated user
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $addresses = $user->addresses()
            ->orderBy('is_default', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($addresses);
    }

    /**
     * Show single address (owner-scoped)
     */
    public function show(string $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $address = $user->addresses()->where('_id', $id)->orWhere('id', $id)->first();
        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        return response()->json($address);
    }

    /**
     * Create address (duplicate-safe, owner-scoped)
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $this->validateAddressPayload($request, isUpdate: false);
        $payload = $this->normalizeAddressData($validated);

        // 1. Duplicate check: user_id + full_name + phone + line1 + pincode
        $existing = $this->findDuplicateAddress((string)($user->_id ?? $user->id), $payload);
        if ($existing) {
            // If requested to be default, ensure it is set as default
            if (!empty($payload['is_default']) && !$existing->is_default) {
                $user->addresses()->update(['is_default' => false]);
                $existing->is_default = true;
                $existing->save();
            }
            return response()->json($existing, 200);
        }

        // 2. Default rules: First address becomes default automatically
        $count = $user->addresses()->count();
        if ($count === 0 || !empty($payload['is_default'])) {
            $payload['is_default'] = true;
            if ($count > 0) {
                $user->addresses()->update(['is_default' => false]);
            }
        } else {
            $payload['is_default'] = false;
        }

        $address = $user->addresses()->create($payload);

        return response()->json($address, 201);
    }

    /**
     * Update address (owner-scoped)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $address = $user->addresses()->where(function ($q) use ($id) {
            $q->where('_id', $id)->orWhere('id', $id);
        })->first();

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        $validated = $this->validateAddressPayload($request, isUpdate: true);
        $payload = $this->normalizeAddressData($validated, existing: $address);

        if (!empty($payload['is_default'])) {
            $user->addresses()->where('_id', '!=', $address->id)->update(['is_default' => false]);
            $payload['is_default'] = true;
        }

        $address->update($payload);

        return response()->json($address);
    }

    /**
     * Delete address (soft-delete, owner-scoped)
     * If default is deleted, promote the most recent active address to default
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $address = $user->addresses()->where(function ($q) use ($id) {
            $q->where('_id', $id)->orWhere('id', $id);
        })->first();

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        $wasDefault = (bool) $address->is_default;
        $address->delete();

        // If the default address was deleted, promote the most recent remaining address
        if ($wasDefault) {
            $next = $user->addresses()
                ->orderBy('updated_at', 'desc')
                ->first();

            if ($next) {
                $next->is_default = true;
                $next->save();
            }
        }

        return response()->json(['message' => 'Address deleted successfully']);
    }

    /**
     * Set address as default (owner-scoped)
     */
    public function setDefault(string $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $address = $user->addresses()->where(function ($q) use ($id) {
            $q->where('_id', $id)->orWhere('id', $id);
        })->first();

        if (!$address) {
            return response()->json(['message' => 'Address not found'], 404);
        }

        // Reset all other addresses
        $user->addresses()->update(['is_default' => false]);

        $address->is_default = true;
        $address->save();

        return response()->json([
            'message' => 'Default address updated successfully',
            'address' => $address,
            'data' => $address,
        ]);
    }

    /**
     * Validate incoming address payload with strict constraints
     */
    private function validateAddressPayload(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'full_name' => ($isUpdate ? 'sometimes|' : ($request->has('name') ? 'nullable|' : 'required|')) . 'string|max:255',
            'name'      => 'nullable|string|max:255',
            'phone'     => ($isUpdate ? 'sometimes|' : 'required|') . 'string|regex:/^[6-9]\d{9}$/',
            'pincode'   => ($isUpdate ? 'sometimes|' : 'required|') . 'string|regex:/^\d{6}$/',
            'line1'     => ($isUpdate ? 'sometimes|' : ($request->has('address_line') ? 'nullable|' : 'required|')) . 'string|max:500',
            'address_line' => 'nullable|string|max:500',
            'line2'     => 'nullable|string|max:500',
            'landmark'  => 'nullable|string|max:255',
            'locality'  => 'nullable|string|max:255',
            'city'      => ($isUpdate ? 'sometimes|' : 'required|') . 'string|max:100',
            'state'     => ($isUpdate ? 'sometimes|' : 'required|') . 'string|max:100',
            'country'   => 'nullable|string|max:100',
            'label'     => 'nullable|string|max:50',
            'is_default' => 'nullable|boolean',
        ];

        $messages = [
            'phone.regex'   => 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
            'pincode.regex' => 'Please provide a valid 6-digit PIN code.',
        ];

        return $request->validate($rules, $messages);
    }

    /**
     * Normalize address fields for consistent storage & backward compatibility
     */
    private function normalizeAddressData(array $validated, ?Address $existing = null): array
    {
        $fullName = trim($validated['full_name'] ?? $validated['name'] ?? ($existing?->full_name ?? ''));
        $line1 = trim($validated['line1'] ?? $validated['address_line'] ?? ($existing?->line1 ?? ''));
        $landmark = trim($validated['landmark'] ?? $validated['locality'] ?? ($existing?->landmark ?? ''));

        $label = $validated['label'] ?? ($existing?->label ?? 'Home');
        if ($label) {
            $label = ucfirst(strtolower(trim($label)));
            if (!in_array($label, ['Home', 'Work', 'Other'])) {
                $label = 'Other';
            }
        }

        $data = [
            'full_name'    => $fullName,
            'name'         => $fullName,
            'phone'        => preg_replace('/\D/', '', $validated['phone'] ?? ($existing?->phone ?? '')),
            'line1'        => $line1,
            'address_line' => $line1,
            'line2'        => isset($validated['line2']) ? trim((string)$validated['line2']) : ($existing?->line2 ?? null),
            'landmark'     => $landmark ?: null,
            'locality'     => $landmark ?: null,
            'city'         => trim($validated['city'] ?? ($existing?->city ?? '')),
            'state'        => trim($validated['state'] ?? ($existing?->state ?? '')),
            'pincode'      => preg_replace('/\D/', '', $validated['pincode'] ?? ($existing?->pincode ?? '')),
            'country'      => trim($validated['country'] ?? ($existing?->country ?? 'India')) ?: 'India',
            'label'        => $label ?: 'Home',
        ];

        if (array_key_exists('is_default', $validated)) {
            $data['is_default'] = (bool)$validated['is_default'];
        }

        return $data;
    }

    /**
     * Find if duplicate address exists for the user
     */
    public static function findDuplicateAddress(string $userId, array $data): ?Address
    {
        $fullName = trim($data['full_name'] ?? $data['name'] ?? '');
        $phone = preg_replace('/\D/', '', $data['phone'] ?? '');
        $line1 = trim($data['line1'] ?? $data['address_line'] ?? '');
        $pincode = preg_replace('/\D/', '', $data['pincode'] ?? '');

        if (!$fullName || !$phone || !$line1 || !$pincode) {
            return null;
        }

        return Address::where('user_id', $userId)
            ->where('phone', $phone)
            ->where('pincode', $pincode)
            ->where(function ($q) use ($fullName) {
                $q->where('full_name', $fullName)->orWhere('name', $fullName);
            })
            ->where(function ($q) use ($line1) {
                $q->where('line1', $line1)->orWhere('address_line', $line1);
            })
            ->first();
    }
}
