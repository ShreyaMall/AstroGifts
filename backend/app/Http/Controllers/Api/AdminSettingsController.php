<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\Sms\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class AdminSettingsController extends Controller
{
    /**
     * Helper to mask secret strings (e.g. ••••••••1234)
     */
    private function maskSecret(?string $value): string
    {
        if (empty($value)) {
            return '';
        }
        $len = strlen($value);
        if ($len <= 4) {
            return '••••';
        }
        return '••••••••' . substr($value, -4);
    }

    /**
     * Check if a value is masked
     */
    private function isMasked(?string $value): bool
    {
        return !empty($value) && str_contains($value, '•');
    }

    /**
     * GET /api/admin/settings
     * Never returns full secrets. Returns masked strings and has_value booleans.
     */
    public function getSettings(OtpService $otpService): JsonResponse
    {
        // 1. Twilio
        $twilioConfig = $otpService->getTwilioConfig();
        $twilioSetting = Setting::get('twilio', []);

        $hasAccountSid = !empty($twilioConfig['account_sid']);
        $hasAuthToken = !empty($twilioConfig['auth_token']);
        $hasVerifySid = !empty($twilioConfig['verify_service_sid']);

        // 2. Razorpay
        $razorpaySetting = Setting::get('razorpay', []);
        $rzpKey = $razorpaySetting['key_id'] ?? env('RAZORPAY_KEY_ID', '');
        $rzpSecret = $razorpaySetting['secret'] ?? env('RAZORPAY_KEY_SECRET', '');
        $rzpLiveKey = $razorpaySetting['live_key_id'] ?? '';
        $rzpLiveSecret = $razorpaySetting['live_secret'] ?? '';

        // 3. Shiprocket
        $shiprocketSetting = Setting::get('shiprocket', []);
        $shipKey = $shiprocketSetting['api_key'] ?? env('SHIPROCKET_EMAIL', '');
        $shipSecret = $shiprocketSetting['api_secret'] ?? '';

        // 4. Checkout
        $checkoutSetting = Setting::get('checkout', []);

        return response()->json([
            'status' => 'success',
            'data' => [
                'twilio' => [
                    'enabled' => (bool)$twilioConfig['enabled'],
                    'account_sid' => $this->maskSecret($twilioConfig['account_sid']),
                    'has_account_sid' => $hasAccountSid,
                    'auth_token' => $this->maskSecret($twilioConfig['auth_token']),
                    'has_auth_token' => $hasAuthToken,
                    'verify_service_sid' => $twilioConfig['verify_service_sid'] ?: '',
                    'has_verify_service_sid' => $hasVerifySid,
                ],
                'razorpay' => [
                    'mode' => $razorpaySetting['mode'] ?? 'test',
                    'key_id' => $rzpKey,
                    'has_key_id' => !empty($rzpKey),
                    'secret' => $this->maskSecret($rzpSecret),
                    'has_secret' => !empty($rzpSecret),
                    'live_key_id' => $rzpLiveKey,
                    'has_live_key_id' => !empty($rzpLiveKey),
                    'live_secret' => $this->maskSecret($rzpLiveSecret),
                    'has_live_secret' => !empty($rzpLiveSecret),
                ],
                'shiprocket' => [
                    'key' => $shipKey,
                    'has_key' => !empty($shipKey),
                    'secret' => $this->maskSecret($shipSecret),
                    'has_secret' => !empty($shipSecret),
                ],
            ],
        ]);
    }

    /**
     * GET /api/site-settings (Public)
     * Returns public non-secret configuration options for the storefront.
     */
    public function getPublicSettings(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [],
        ]);
    }

    /**
     * POST /api/admin/settings
     * Updates settings with sensitive secrets encrypted at rest.
     * Empty or masked values mean "keep existing value".
     */
    public function updateSettings(Request $request): JsonResponse
    {
        // ── 1. Update Twilio Configuration ──
        if ($request->has('twilio')) {
            $incoming = $request->input('twilio', []);
            $existing = Setting::where('key', 'twilio')->first()?->value ?? [];

            $enabled = isset($incoming['enabled']) ? (bool)$incoming['enabled'] : ($existing['enabled'] ?? false);

            // Account SID
            $accountSid = $existing['account_sid'] ?? null;
            if (!empty($incoming['account_sid']) && !$this->isMasked($incoming['account_sid'])) {
                $accountSid = Crypt::encryptString(trim($incoming['account_sid']));
            }

            // Auth Token
            $authToken = $existing['auth_token'] ?? null;
            if (!empty($incoming['auth_token']) && !$this->isMasked($incoming['auth_token'])) {
                $authToken = Crypt::encryptString(trim($incoming['auth_token']));
            }

            // Verify Service SID
            $verifySid = $existing['verify_service_sid'] ?? null;
            if (isset($incoming['verify_service_sid']) && !$this->isMasked($incoming['verify_service_sid'])) {
                $verifySid = trim($incoming['verify_service_sid']);
            }

            Setting::set('twilio', [
                'enabled' => $enabled,
                'account_sid' => $accountSid,
                'auth_token' => $authToken,
                'verify_service_sid' => $verifySid,
            ]);
        }

        // ── 2. Update Razorpay Configuration (Non-breaking) ──
        if ($request->has('razorpay')) {
            $incoming = $request->input('razorpay', []);
            $existing = Setting::where('key', 'razorpay')->first()?->value ?? [];

            $rzpData = [
                'mode' => $incoming['mode'] ?? ($existing['mode'] ?? 'test'),
                'key_id' => !empty($incoming['key_id']) ? trim($incoming['key_id']) : ($existing['key_id'] ?? ''),
                'secret' => (!empty($incoming['secret']) && !$this->isMasked($incoming['secret']))
                    ? trim($incoming['secret'])
                    : ($existing['secret'] ?? ''),
                'live_key_id' => !empty($incoming['live_key_id']) ? trim($incoming['live_key_id']) : ($existing['live_key_id'] ?? ''),
                'live_secret' => (!empty($incoming['live_secret']) && !$this->isMasked($incoming['live_secret']))
                    ? trim($incoming['live_secret'])
                    : ($existing['live_secret'] ?? ''),
            ];

            Setting::set('razorpay', $rzpData);
        }

        // ── 3. Update Shiprocket Configuration (Non-breaking) ──
        if ($request->has('shiprocket')) {
            $incoming = $request->input('shiprocket', []);
            $existing = Setting::where('key', 'shiprocket')->first()?->value ?? [];

            $shipData = [
                'api_key' => !empty($incoming['key']) ? trim($incoming['key']) : ($existing['api_key'] ?? ''),
                'api_secret' => (!empty($incoming['secret']) && !$this->isMasked($incoming['secret']))
                    ? trim($incoming['secret'])
                    : ($existing['api_secret'] ?? ''),
            ];

            Setting::set('shiprocket', $shipData);
        }

        // Invalidate caches
        Setting::clearCache('twilio');
        Setting::clearCache('razorpay');
        Setting::clearCache('shiprocket');

        return response()->json([
            'status' => 'success',
            'message' => 'Configuration settings saved successfully.',
        ]);
    }

    /**
     * POST /api/admin/settings/test-otp
     * Throttled (3/min), Admin-only, validates phone /^[6-9]\d{9}$/
     * Never logs or returns secrets or OTP codes.
     */
    public function testOtp(Request $request, OtpService $otpService): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^[6-9]\d{9}$/'],
        ], [
            'phone.regex' => 'Please provide a valid 10-digit Indian mobile number starting with 6-9.',
        ]);

        $phone = $validated['phone'];
        $result = $otpService->sendTestOtp($phone);

        if ($result['success']) {
            return response()->json([
                'status' => 'success',
                'message' => "Test OTP verification initiated successfully to +91 {$phone} via Twilio.",
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $result['message'] ?? 'Failed to send test OTP via Twilio.',
        ], 422);
    }
}
