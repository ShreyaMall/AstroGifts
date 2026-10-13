<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Msg91SmsService implements SmsServiceInterface
{
    public function sendOtp(string $phone, string $otp): bool
    {
        $authKey = config('services.msg91.auth_key');
        $templateId = config('services.msg91.template_id');

        if (empty($authKey) || empty($templateId)) {
            Log::warning("MSG91 Auth Key or Template ID missing. Falling back to log driver.");
            return (new LogSmsService())->sendOtp($phone, $otp);
        }

        // Format phone number to 91XXXXXXXXXX
        $formattedPhone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($formattedPhone) === 10) {
            $formattedPhone = '91' . $formattedPhone;
        }

        try {
            $response = Http::withHeaders([
                'authkey' => $authKey,
                'content-type' => 'application/json',
            ])->post('https://control.msg91.com/api/v5/otp', [
                'template_id' => $templateId,
                'mobile' => $formattedPhone,
                'otp' => $otp,
            ]);

            if ($response->successful() && ($response->json('type') === 'success' || $response->json('status') === 'success')) {
                Log::info("MSG91 OTP sent successfully to {$formattedPhone}");
                return true;
            } else {
                Log::error("MSG91 OTP sending failed: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("MSG91 Exception: " . $e->getMessage());
            return false;
        }
    }
}
