<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;

class LogSmsService implements SmsServiceInterface
{
    public function sendOtp(string $phone, string $otp): bool
    {
        Log::info("==========================================");
        Log::info("📱 [SMS OTP LOG DRIVER] Sent to {$phone}");
        Log::info("🔑 OTP: {$otp}");
        Log::info("==========================================");
        return true;
    }
}
