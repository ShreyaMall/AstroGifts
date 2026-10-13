<?php

namespace App\Services\Sms;

class TwilioSmsService implements SmsServiceInterface
{
    public function sendOtp(string $phone, string $otp): bool
    {
        $otpService = app(OtpService::class);
        $result = $otpService->sendOtp($phone);
        return !empty($result['success']);
    }
}
