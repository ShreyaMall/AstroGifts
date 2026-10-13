<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;
use Twilio\Exceptions\RestException;
use Twilio\Exceptions\TwilioException as BaseTwilioException;
use Twilio\Rest\Client;

class TwilioSmsService implements SmsServiceInterface
{
    protected ?Client $client = null;
    protected string $sid = '';
    protected string $token = '';
    protected string $verifySid = '';

    public function __construct(
        ?Client $client = null,
        ?string $sid = null,
        ?string $token = null,
        ?string $verifySid = null
    ) {
        $this->sid = $sid ?: (string) (config('services.twilio.sid') ?: config('services.twilio.account_sid') ?: env('TWILIO_ACCOUNT_SID', ''));
        $this->token = $token ?: (string) (config('services.twilio.token') ?: config('services.twilio.auth_token') ?: env('TWILIO_AUTH_TOKEN', ''));
        $this->verifySid = $verifySid ?: (string) (config('services.twilio.verify_sid') ?: config('services.twilio.verify_service_sid') ?: env('TWILIO_VERIFY_SERVICE_SID', ''));

        if ($client !== null) {
            $this->client = $client;
        } elseif (!empty($this->sid) && !empty($this->token)) {
            $this->client = new Client($this->sid, $this->token);
        }
    }

    /**
     * Set Twilio REST client (useful for unit/feature tests)
     */
    public function setClient(Client $client): self
    {
        $this->client = $client;
        return $this;
    }

    /**
     * Send OTP via Twilio Verify
     *
     * @param string $phone
     * @return bool
     * @throws TwilioException|\InvalidArgumentException
     */
    public function send(string $phone): bool
    {
        $cleanPhone = $this->validateAndFormatPhone($phone);
        $e164Phone = '+91' . $cleanPhone;

        $client = $this->getClient();

        try {
            $verification = $client->verify->v2
                ->services($this->verifySid)
                ->verifications
                ->create($e164Phone, 'sms');

            $status = $verification->status ?? 'pending';
            return $status === 'pending' || $status === 'approved';
        } catch (RestException $e) {
            $this->handleTwilioRestException($e, 'send');
        } catch (BaseTwilioException $e) {
            Log::error('Twilio generic error: code=' . $e->getCode());
            throw new TwilioException('SMS verification service error. Please try again.', 500, $e->getCode());
        } catch (\Throwable $e) {
            Log::error('Twilio network/system error: ' . get_class($e));
            throw new TwilioException('Unable to reach SMS verification service. Please try again later.', 503);
        }
    }

    /**
     * Check / Verify OTP code via Twilio Verify
     *
     * @param string $phone
     * @param string $code
     * @return bool
     * @throws TwilioException|\InvalidArgumentException
     */
    public function check(string $phone, string $code): bool
    {
        $cleanPhone = $this->validateAndFormatPhone($phone);
        $cleanCode = trim($code);

        if (!preg_match('/^\d{4,8}$/', $cleanCode)) {
            return false;
        }

        $e164Phone = '+91' . $cleanPhone;
        $client = $this->getClient();

        try {
            $verificationCheck = $client->verify->v2
                ->services($this->verifySid)
                ->verificationChecks
                ->create([
                    'to' => $e164Phone,
                    'code' => $cleanCode,
                ]);

            return ($verificationCheck->status ?? '') === 'approved';
        } catch (RestException $e) {
            $this->handleTwilioRestException($e, 'check');
        } catch (BaseTwilioException $e) {
            Log::error('Twilio check generic error: code=' . $e->getCode());
            throw new TwilioException('Verification failed due to a service error. Please try again.', 500, $e->getCode());
        } catch (\Throwable $e) {
            Log::error('Twilio check network/system error: ' . get_class($e));
            throw new TwilioException('Unable to connect to verification service. Please try again later.', 503);
        }
    }

    /**
     * Compatibility alias for SmsServiceInterface
     */
    public function sendOtp(string $phone, string $otp = ''): bool
    {
        return $this->send($phone);
    }

    /**
     * Clean and validate Indian 10-digit phone number: /^[6-9]\d{9}$/
     */
    public function validateAndFormatPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            $digits = substr($digits, 2);
        }

        if (strlen($digits) !== 10 || !preg_match('/^[6-9]\d{9}$/', $digits)) {
            throw new \InvalidArgumentException('Please enter a valid 10-digit Indian mobile number.');
        }

        return $digits;
    }

    /**
     * Ensure client and verify service SID are present
     */
    public function getClient(): Client
    {
        if ($this->client === null) {
            if (!empty($this->sid) && !empty($this->token)) {
                $this->client = new Client($this->sid, $this->token);
            } else {
                Log::error('Twilio client error: credentials missing');
                throw new TwilioException('SMS verification service is not configured.', 500);
            }
        }

        if (empty($this->verifySid)) {
            Log::error('Twilio client error: verify service SID missing');
            throw new TwilioException('SMS verification service is not configured.', 500);
        }

        return $this->client;
    }

    /**
     * Handle RestException mapping with safe logging
     */
    protected function handleTwilioRestException(RestException $e, string $action): never
    {
        $code = $e->getCode();
        $httpStatus = $e->getStatusCode();

        // Safe log: log ONLY short error code, NEVER log secrets, tokens, or phone numbers
        Log::warning("Twilio {$action} failed: code={$code}, status={$httpStatus}");

        switch ($code) {
            case 60200:
                throw new TwilioException('Invalid phone number format for verification.', 422, $code);

            case 60202:
                throw new TwilioException('Maximum verification check attempts reached. Please request a new OTP.', 429, $code);

            case 60203:
                throw new TwilioException('Max verification send attempts reached. Please wait before requesting another OTP.', 429, $code);

            case 60205:
                throw new TwilioException('Verification code has expired or was not found. Please request a new OTP.', 401, $code);

            case 20429:
                throw new TwilioException('Too many verification requests. Please try again later.', 429, $code);

            case 21211:
            case 21614:
                throw new TwilioException('Invalid mobile number destination.', 422, $code);

            default:
                if ($httpStatus === 429) {
                    throw new TwilioException('Rate limit reached. Please wait before trying again.', 429, $code);
                } elseif ($httpStatus === 404) {
                    throw new TwilioException('Verification session not found or expired. Please request a new OTP.', 404, $code);
                } elseif ($httpStatus >= 500) {
                    throw new TwilioException('Twilio verification service temporarily unavailable.', 503, $code);
                } else {
                    throw new TwilioException('Verification failed. Please try again.', $httpStatus ?: 400, $code);
                }
        }
    }
}
