<?php

namespace App\Services\Sms;

use App\Models\Setting;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OtpService
{
    /**
     * Resolve active Twilio credentials: DB settings first, falling back to config/env.
     */
    public function getTwilioConfig(): array
    {
        $dbSetting = Setting::get('twilio');
        $enabled = false;
        $accountSid = null;
        $authToken = null;
        $verifyServiceSid = null;

        if ($dbSetting && is_array($dbSetting)) {
            $enabled = !empty($dbSetting['enabled']);
            
            if (!empty($dbSetting['account_sid'])) {
                try {
                    $accountSid = Crypt::decryptString($dbSetting['account_sid']);
                } catch (\Throwable $e) {
                    $accountSid = $dbSetting['account_sid'];
                }
            }
            
            if (!empty($dbSetting['auth_token'])) {
                try {
                    $authToken = Crypt::decryptString($dbSetting['auth_token']);
                } catch (\Throwable $e) {
                    $authToken = $dbSetting['auth_token'];
                }
            }
            
            if (!empty($dbSetting['verify_service_sid'])) {
                $verifyServiceSid = $dbSetting['verify_service_sid'];
            }
        }

        // Fallback to services/env config if empty
        $accountSid = $accountSid ?: config('services.twilio.account_sid');
        $authToken = $authToken ?: config('services.twilio.auth_token');
        $verifyServiceSid = $verifyServiceSid ?: config('services.twilio.verify_service_sid');

        // If no explicit DB setting exists yet but env credentials are set, default enabled to true
        if ($dbSetting === null && !empty($accountSid) && !empty($authToken) && !empty($verifyServiceSid)) {
            $enabled = true;
        }

        return [
            'enabled' => (bool)$enabled,
            'account_sid' => $accountSid ?: '',
            'auth_token' => $authToken ?: '',
            'verify_service_sid' => $verifyServiceSid ?: '',
        ];
    }

    /**
     * Format Indian phone number to E.164 (+91XXXXXXXXXX)
     */
    public function formatPhoneE164(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($cleaned) === 10) {
            return '+91' . $cleaned;
        }
        if (str_starts_with($cleaned, '91') && strlen($cleaned) === 12) {
            return '+' . $cleaned;
        }
        return '+' . $cleaned;
    }

    /**
     * Send OTP via Twilio Verify Service
     */
    public function sendOtp(string $phone): array
    {
        $config = $this->getTwilioConfig();

        if (!$config['enabled']) {
            return [
                'success' => false,
                'message' => 'Twilio SMS service is disabled in settings.',
            ];
        }

        if (empty($config['account_sid']) || empty($config['auth_token']) || empty($config['verify_service_sid'])) {
            return [
                'success' => false,
                'message' => 'Twilio configuration is incomplete (Account SID, Auth Token or Verify SID missing).',
            ];
        }

        $formattedPhone = $this->formatPhoneE164($phone);
        $url = "https://verify.twilio.com/v2/Services/{$config['verify_service_sid']}/Verifications";

        try {
            $response = Http::withBasicAuth($config['account_sid'], $config['auth_token'])
                ->asForm()
                ->post($url, [
                    'To' => $formattedPhone,
                    'Channel' => 'sms',
                ]);

            if ($response->successful()) {
                Log::info("Twilio OTP verification initiated for masked destination: " . substr($formattedPhone, 0, 4) . '••••' . substr($formattedPhone, -2));
                return [
                    'success' => true,
                    'message' => 'OTP dispatched successfully.',
                    'sid' => $response->json('sid'),
                    'status' => $response->json('status'),
                ];
            }

            $errorMsg = $response->json('message') ?? 'Failed to send OTP via Twilio.';
            Log::warning("Twilio API response error (HTTP {$response->status()}): {$errorMsg}");

            return [
                'success' => false,
                'message' => $errorMsg,
            ];
        } catch (\Throwable $e) {
            Log::error("Twilio sendOtp exception: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Connection to Twilio SMS service failed.',
            ];
        }
    }

    /**
     * Admin Test OTP trigger
     */
    public function sendTestOtp(string $phone): array
    {
        return $this->sendOtp($phone);
    }
}
