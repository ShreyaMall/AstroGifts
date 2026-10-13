<?php

namespace App\Services\Sms;

interface SmsServiceInterface
{
    public function send(string $phone): bool;

    public function check(string $phone, string $code): bool;

    public function sendOtp(string $phone, string $otp = ''): bool;
}
