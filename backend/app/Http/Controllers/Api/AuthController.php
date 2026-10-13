<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Sms\SmsServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use App\Mail\OtpMail;
use App\Services\Sms\TwilioException;

class AuthController extends Controller
{
    /**
     * Helper to normalize Indian 10-digit mobile number
     */
    private function normalizePhone(?string $input): ?string
    {
        if (!$input) return null;
        $digits = preg_replace('/[^0-9]/', '', $input);
        if (strlen($digits) > 10 && str_starts_with($digits, '91')) {
            $digits = substr($digits, -10);
        }
        if (strlen($digits) === 10 && preg_match('/^[6-9]\d{9}$/', $digits)) {
            return $digits;
        }
        return null;
    }

    /**
     * Customer & User Registration (Legacy Email)
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
        ]);

        $normalizedPhone = $this->normalizePhone($request->phone);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'phone' => $normalizedPhone,
            'role' => 'customer',
        ]);

        $token = $user->createToken('customer_token', ['customer'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'phone_verified_at' => $user->phone_verified_at,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Send OTP for Passwordless Mobile or Email Login
     */
    public function sendOtp(Request $request): JsonResponse
    {
        // 1. Mobile Phone OTP Flow (Twilio Verify)
        if ($request->has('phone') || !empty($request->phone)) {
            $phoneInput = $request->phone;
            $phone = $this->normalizePhone($phoneInput);

            if (!$phone) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Please enter a valid 10-digit Indian mobile number.'
                ], 422);
            }

            // IP Throttle: max 10 requests per minute
            $ipKey = 'send_otp_ip:' . $request->ip();
            if (RateLimiter::tooManyAttempts($ipKey, 10)) {
                $seconds = (int) RateLimiter::availableIn($ipKey);
                return response()->json([
                    'status' => 'error',
                    'message' => "Too many OTP requests from this IP. Please wait {$seconds} seconds.",
                    'retry_after' => $seconds,
                    'cooldown_seconds' => $seconds,
                ], 429);
            }
            RateLimiter::hit($ipKey, 60);

            // Phone Throttle: max 5 requests per hour
            $phoneKey = 'send_otp_phone:' . $phone;
            if (RateLimiter::tooManyAttempts($phoneKey, 5)) {
                $seconds = (int) RateLimiter::availableIn($phoneKey);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Too many OTP requests for this mobile number. Please try again later.',
                    'retry_after' => $seconds,
                    'cooldown_seconds' => $seconds,
                ], 429);
            }
            RateLimiter::hit($phoneKey, 3600);

            // Find or create user record for tracking
            $user = User::where('phone', $phone)->first();
            if (!$user) {
                $user = User::create([
                    'name' => null,
                    'phone' => $phone,
                    'role' => 'customer',
                ]);
            }

            // Lockout check
            if ($user->otp_locked_until && Carbon::now()->lessThan($user->otp_locked_until)) {
                $secondsLeft = (int) ceil(abs(Carbon::now()->diffInSeconds($user->otp_locked_until)));
                $minutesLeft = (int) ceil($secondsLeft / 60);
                return response()->json([
                    'status' => 'error',
                    'message' => "Too many failed attempts. Account locked for {$minutesLeft} minute(s).",
                    'locked' => true,
                    'retry_after' => $secondsLeft,
                    'cooldown_seconds' => $secondsLeft,
                ], 429);
            }

            // 120s Resend Cooldown Check
            if ($user->otp_sent_at) {
                $sentAt = Carbon::parse($user->otp_sent_at);
                $now = Carbon::now();
                $elapsed = ($now->greaterThanOrEqualTo($sentAt))
                    ? (int) abs($now->diffInSeconds($sentAt))
                    : 120;

                if ($elapsed < 120) {
                    $retryAfter = (int) max(1, 120 - $elapsed);
                    return response()->json([
                        'status' => 'error',
                        'message' => "Please wait {$retryAfter} seconds before requesting a new OTP.",
                        'retry_after' => $retryAfter,
                        'cooldown_seconds' => $retryAfter,
                    ], 429);
                }
            }

            // Hourly limit check
            $resetAt = $user->otp_hourly_reset_at ? new Carbon($user->otp_hourly_reset_at) : null;
            if (!$resetAt || Carbon::now()->greaterThan($resetAt)) {
                $user->otp_hourly_count = 0;
                $user->otp_hourly_reset_at = Carbon::now()->addHour();
            }

            if (($user->otp_hourly_count ?? 0) >= 5) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hourly limit reached (max 5 OTPs/hour). Please try again after 1 hour.',
                    'retry_after' => 3600,
                    'cooldown_seconds' => 3600,
                ], 429);
            }

            // Send via Twilio Verify (NO local OTP generation or storing)
            $smsService = app(SmsServiceInterface::class);
            try {
                $smsService->send($phone);
            } catch (TwilioException $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], $e->getStatusCode());
            } catch (\InvalidArgumentException $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 422);
            } catch (\Throwable $e) {
                Log::error('Twilio Verify send error: ' . get_class($e));
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unable to send verification code. Please try again later.',
                ], 503);
            }

            $user->otp = null;
            $user->otp_hash = null;
            $user->otp_expires_at = null;
            $user->otp_sent_at = Carbon::now();
            $user->otp_hourly_count = ($user->otp_hourly_count ?? 0) + 1;
            $user->save();

            $userExists = !empty($user->phone_verified_at);
            $maskedPhone = substr($phone, 0, 2) . '******' . substr($phone, -2);

            return response()->json([
                'status' => 'success',
                'message' => "6-digit OTP sent to +91 {$maskedPhone}",
                'phone' => $maskedPhone,
                'cooldown' => 120,
                'retry_after' => 120,
                'user_exists' => $userExists,
            ]);
        }

        // 2. Legacy Email OTP Flow (Fallback)
        $request->validate([
            'email' => 'required|email',
            'password' => 'nullable|string',
        ]);

        $email = strtolower(trim($request->email));
        $password = $request->password;

        $user = User::where('email', $email)->first();

        if (!$user && ($email === 'user@astrogifts.com' || $email === 'user')) {
            $email = 'user@astrogifts.com';
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            if ($email === 'user@astrogifts.com') {
                if ($password && !Hash::check($password, $user->password) && $password !== 'user123') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid password for Demo User. Please use password: user123'
                    ], 401);
                }
            } else if ($password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        } else {
            $emailPrefix = explode('@', $email)[0];
            $displayName = ucwords(str_replace(['.', '_', '-'], ' ', $emailPrefix));
            $user = User::create([
                'name' => $displayName,
                'email' => $email,
                'password' => Hash::make($password ?: 'user123'),
                'role' => 'customer',
            ]);
        }

        $otp = (string) rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_hash = hash('sha256', $otp);
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        try {
            dispatch(function () use ($user, $otp) {
                Mail::to($user->email)->send(new OtpMail($otp));
            })->afterResponse();
        } catch (\Exception $e) {
            Log::warning("Mail sending skipped/failed: " . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => '6-digit OTP sent to your email successfully.'
        ]);
    }

    /**
     * Resend OTP alias for /auth/resend-otp
     */
    public function resendOtp(Request $request): JsonResponse
    {
        return $this->sendOtp($request);
    }

    /**
     * Check if a phone number already has a verified account
     */
    public function checkPhone(Request $request): JsonResponse
    {
        $phoneInput = $request->input('phone');
        $phone = $this->normalizePhone($phoneInput);

        if (!$phone) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please enter a valid 10-digit Indian mobile number.'
            ], 422);
        }

        $user = User::where('phone', $phone)->first();
        $exists = (bool)($user && !empty($user->phone_verified_at));
        $maskedPhone = substr($phone, 0, 2) . '******' . substr($phone, -2);

        return response()->json([
            'status' => 'success',
            'exists' => $exists,
            'phone' => $maskedPhone,
        ]);
    }

    /**
     * Verify OTP and Login / Register (Mobile or Email)
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $otpInput = trim($request->otp);

        // 1. Mobile Phone OTP Verification (Twilio Verify)
        if ($request->has('phone') || !empty($request->phone)) {
            $phone = $this->normalizePhone($request->phone);

            if (!$phone) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid phone number format.'
                ], 422);
            }

            // IP Throttle: max 20 attempts per minute
            $ipKey = 'verify_otp_ip:' . $request->ip();
            if (RateLimiter::tooManyAttempts($ipKey, 20)) {
                $seconds = (int) RateLimiter::availableIn($ipKey);
                return response()->json([
                    'status' => 'error',
                    'message' => "Too many verification attempts from this IP. Please wait {$seconds} seconds.",
                    'retry_after' => $seconds,
                ], 429);
            }
            RateLimiter::hit($ipKey, 60);

            // Phone Throttle: max 10 attempts per 5 minutes
            $phoneKey = 'verify_otp_phone:' . $phone;
            if (RateLimiter::tooManyAttempts($phoneKey, 10)) {
                $seconds = (int) RateLimiter::availableIn($phoneKey);
                return response()->json([
                    'status' => 'error',
                    'message' => "Too many verification attempts for this number. Please wait {$seconds} seconds.",
                    'retry_after' => $seconds,
                ], 429);
            }
            RateLimiter::hit($phoneKey, 300);

            $user = User::where('phone', $phone)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No OTP request found for this phone number. Please request a new OTP.'
                ], 404);
            }

            // Lockout check
            if ($user->otp_locked_until && Carbon::now()->lessThan($user->otp_locked_until)) {
                $secondsLeft = (int) ceil(abs(Carbon::now()->diffInSeconds($user->otp_locked_until)));
                $minutesLeft = (int) ceil($secondsLeft / 60);
                return response()->json([
                    'status' => 'error',
                    'message' => "Too many wrong attempts. Account locked for {$minutesLeft} minute(s).",
                    'locked' => true,
                    'retry_after' => $secondsLeft,
                ], 429);
            }

            // Verify code via Twilio Verify
            $smsService = app(SmsServiceInterface::class);
            try {
                $approved = $smsService->check($phone, $otpInput);
            } catch (TwilioException $e) {
                if ($e->getStatusCode() === 429) {
                    $user->otp_locked_until = Carbon::now()->addMinutes(15);
                    $user->save();
                    return response()->json([
                        'status' => 'error',
                        'message' => $e->getMessage(),
                        'locked' => true,
                    ], 429);
                }
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], $e->getStatusCode());
            } catch (\InvalidArgumentException $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 422);
            } catch (\Throwable $e) {
                Log::error('Twilio Verify check error: ' . get_class($e));
                return response()->json([
                    'status' => 'error',
                    'message' => 'Verification failed due to a service error. Please try again.',
                ], 503);
            }

            if (!$approved) {
                $attempts = ($user->otp_attempts ?? 0) + 1;
                $user->otp_attempts = $attempts;

                if ($attempts >= 5) {
                    $user->otp_locked_until = Carbon::now()->addMinutes(15);
                    $user->save();
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Maximum 5 invalid attempts reached. Account locked for 15 minutes.',
                        'locked' => true,
                    ], 429);
                }

                $user->save();
                $remaining = 5 - $attempts;
                return response()->json([
                    'status' => 'error',
                    'message' => "Invalid OTP. {$remaining} attempt(s) remaining.",
                    'attempts_left' => $remaining,
                ], 401);
            }

            // OTP verified successfully (approved = true)
            if ($user->name && preg_match('/^User \d+$/i', trim($user->name))) {
                $user->name = null;
            }

            if ($request->filled('name')) {
                $user->name = trim($request->name);
            }

            $isNewUser = empty($user->name) || empty($user->phone_verified_at);

            $user->phone_verified_at = Carbon::now();
            $user->otp = null;
            $user->otp_hash = null;
            $user->otp_expires_at = null;
            $user->otp_attempts = 0;
            $user->otp_locked_until = null;
            $user->save();

            RateLimiter::clear($phoneKey);
            RateLimiter::clear('send_otp_phone:' . $phone);

            $token = $user->createToken('customer_token', ['customer'])->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'is_new_user' => $isNewUser,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'phone_verified_at' => $user->phone_verified_at,
                    'role' => $user->role,
                ],
                'token' => $token,
            ]);
        }

        // 2. Legacy Email Verification
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found.'
            ], 404);
        }

        $givenHash = hash('sha256', $otpInput);
        $isValid = ($user->otp_hash && $user->otp_hash === $givenHash) || ($user->otp && $user->otp === $otpInput);

        if (!$isValid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid OTP.'
            ], 401);
        }

        if ($user->otp_expires_at && Carbon::now()->greaterThan(new Carbon($user->otp_expires_at))) {
            return response()->json([
                'status' => 'error',
                'message' => 'OTP has expired. Please request a new one.'
            ], 401);
        }

        $user->otp = null;
        $user->otp_hash = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('customer_token', ['customer'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'phone_verified_at' => $user->phone_verified_at,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Attach Phone to Authenticated User (Request OTP)
     */
    public function attachPhone(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = $this->normalizePhone($request->phone);

        if (!$phone) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please enter a valid 10-digit Indian mobile number.'
            ], 422);
        }

        // Check if phone is already verified by ANOTHER user
        $existing = User::where('phone', $phone)
            ->whereNotNull('phone_verified_at')
            ->where('id', '!=', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'This mobile number is already registered and verified with another account.'
            ], 422);
        }

        // Check 120s resend cooldown
        if ($user->otp_sent_at) {
            $sentAt = Carbon::parse($user->otp_sent_at);
            $now = Carbon::now();
            $elapsed = ($now->greaterThanOrEqualTo($sentAt))
                ? (int) abs($now->diffInSeconds($sentAt))
                : 120;

            if ($elapsed < 120) {
                $retryAfter = (int) max(1, 120 - $elapsed);
                return response()->json([
                    'status' => 'error',
                    'message' => "Please wait {$retryAfter} seconds before requesting another OTP.",
                    'retry_after' => $retryAfter,
                    'cooldown_seconds' => $retryAfter,
                ], 429);
            }
        }

        $smsService = app(SmsServiceInterface::class);
        try {
            $smsService->send($phone);
        } catch (TwilioException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Twilio Verify attachPhone send error: ' . get_class($e));
            return response()->json([
                'status' => 'error',
                'message' => 'Unable to send verification code. Please try again later.',
            ], 503);
        }

        $user->phone = $phone;
        $user->otp = null;
        $user->otp_hash = null;
        $user->otp_expires_at = null;
        $user->otp_sent_at = Carbon::now();
        $user->save();

        $maskedPhone = substr($phone, 0, 2) . '******' . substr($phone, -2);

        return response()->json([
            'status' => 'success',
            'message' => "6-digit OTP sent to +91 {$maskedPhone} for verification.",
            'phone' => $maskedPhone,
            'cooldown' => 120,
            'retry_after' => 120,
        ]);
    }

    /**
     * Verify Attached Phone OTP
     */
    public function verifyAttachedPhone(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $otpInput = trim($request->otp);

        if (!$user->phone) {
            return response()->json([
                'status' => 'error',
                'message' => 'No phone number is being attached.',
            ], 404);
        }

        $smsService = app(SmsServiceInterface::class);
        try {
            $approved = $smsService->check($user->phone, $otpInput);
        } catch (TwilioException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            Log::error('Twilio Verify checkAttachedPhone error: ' . get_class($e));
            return response()->json([
                'status' => 'error',
                'message' => 'Verification failed due to a service error. Please try again.',
            ], 503);
        }

        if (!$approved) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid OTP.'
            ], 401);
        }

        $user->phone_verified_at = Carbon::now();
        $user->otp = null;
        $user->otp_hash = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Mobile number attached and verified successfully!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'phone_verified_at' => $user->phone_verified_at,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Customer Login (Legacy Password Auth)
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = strtolower(trim($request->email));
        $user = User::where('email', $loginInput)->first();

        if (!$user && ($loginInput === 'user' || $loginInput === 'user@astrogifts.com')) {
            $user = User::where('email', 'user@astrogifts.com')->first();
        }

        $isDemoUser = ($loginInput === 'user' || $loginInput === 'user@astrogifts.com') 
                      && $request->password === 'user123';

        if (!$user) {
            if ($isDemoUser) {
                $user = User::create([
                    'name' => 'Demo User',
                    'email' => 'user@astrogifts.com',
                    'password' => Hash::make('user123'),
                    'role' => 'customer',
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No account found with this email.',
                ], 404);
            }
        } else if ($isDemoUser) {
            $user->email = 'user@astrogifts.com';
            $user->password = Hash::make('user123');
            $user->save();
        }

        if (!$isDemoUser && !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $token = $user->createToken('customer_token', ['customer'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'phone_verified_at' => $user->phone_verified_at,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Admin Login
     */
    public function adminLogin(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = strtolower(trim($request->email));
        $user = User::where('email', $loginInput)->first();

        if (!$user || !Hash::check($request->password, $user->password) || $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Admin login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'phone_verified_at' => $user->phone_verified_at,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Admin Logout
     */
    public function adminLogout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Admin logged out successfully',
        ]);
    }

    /**
     * Current Authenticated User Profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'phone_verified_at' => $user->phone_verified_at,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Update Authenticated User Profile (Name & Optional Email)
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $user->name = trim($validated['name']);

        if (!empty($validated['email'])) {
            $email = strtolower(trim($validated['email']));
            $existing = User::where('email', $email)->where('id', '!=', $user->id)->first();
            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This email address is already associated with another account.',
                ], 422);
            }
            $user->email = $email;
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'phone_verified_at' => $user->phone_verified_at,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        if (auth('web')->check()) {
            auth('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
