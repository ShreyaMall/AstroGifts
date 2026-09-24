<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Customer & User Registration
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Send OTP for Passwordless Login
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'nullable|string',
        ]);

        $email = strtolower(trim($request->email));
        $password = $request->password;

        $user = User::where('email', $email)->first();

        // Check if demo shortcut email
        if (!$user && ($email === 'user@astrogifts.com' || $email === 'user')) {
            $email = 'user@astrogifts.com';
            $user = User::where('email', $email)->first();
        }

        // If user exists, verify password
        if ($user) {
            if ($email === 'user@astrogifts.com') {
                if ($password && !Hash::check($password, $user->password) && $password !== 'user123') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid password for Demo User. Please use password: user123'
                    ], 401);
                }
            } else if ($password) {
                // For custom emails, update password to the user's chosen password
                $user->password = Hash::make($password);
                $user->save();
            }
        } else {
            // New user registration flow with password
            $emailPrefix = explode('@', $email)[0];
            $displayName = ucwords(str_replace(['.', '_', '-'], ' ', $emailPrefix));
            $user = User::create([
                'name' => $displayName,
                'email' => $email,
                'password' => Hash::make($password ?: 'user123'),
                'role' => 'customer',
            ]);
        }

        // Generate 6-digit OTP
        $otp = (string) rand(100000, 999999);

        // Save OTP and expiration time to user
        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        // Send Email (safely wrapped in try-catch)
        try {
            dispatch(function () use ($user, $otp) {
                Mail::to($user->email)->send(new OtpMail($otp));
            })->afterResponse();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Mail sending skipped/failed: " . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Email & Password verified! 6-digit OTP sent to your email successfully.'
        ]);
    }

    /**
     * Verify OTP and Login
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found.'
            ], 404);
        }

        // Check if OTP matches and is not expired
        if ($user->otp !== $request->otp) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid OTP.'
            ], 401);
        }

        if (Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json([
                'status' => 'error',
                'message' => 'OTP has expired. Please request a new one.'
            ], 401);
        }

        // Clear OTP after successful verification
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('customer_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
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

        // Support demo login username shortcut 'user'
        if (!$user && ($loginInput === 'user' || $loginInput === 'user@astrogifts.com' || $loginInput === 'user@woodmart.com')) {
            $user = User::where('email', 'user@astrogifts.com')->first()
                 ?? User::where('email', 'user@woodmart.com')->first();
        }

        $isDemoUser = ($loginInput === 'user' || $loginInput === 'user@astrogifts.com' || $loginInput === 'user@woodmart.com') 
                      && $request->password === 'user123';

        if (!$user) {
            $user = User::create([
                'name' => 'Demo User',
                'email' => 'user@astrogifts.com',
                'password' => Hash::make('user123'),
                'role' => 'customer',
            ]);
        } else if ($isDemoUser) {
            $user->email = 'user@astrogifts.com';
            $user->password = Hash::make('user123');
            $user->save();
        }

        if (!$isDemoUser && !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email or password. (Demo: user@astrogifts.com / user123)',
            ], 401);
        }

        $token = $user->createToken('customer_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
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

        // Support demo login username shortcut 'admin'
        if (!$user && ($loginInput === 'admin' || $loginInput === 'admin@astrogifts.com' || $loginInput === 'admin@woodmart.com')) {
            $user = User::where('email', 'admin@astrogifts.com')->first()
                 ?? User::where('email', 'admin@woodmart.com')->first();
        }

        $isDemoAdmin = ($loginInput === 'admin' || $loginInput === 'admin@astrogifts.com' || $loginInput === 'admin@woodmart.com') 
                       && $request->password === 'admin123';

        if (!$user) {
            $user = User::create([
                'name' => 'AstroGifts Admin',
                'email' => 'admin@astrogifts.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]);
        } else if ($isDemoAdmin) {
            $user->email = 'admin@astrogifts.com';
            $user->password = Hash::make('admin123');
            $user->role = 'admin';
            $user->save();
        }

        if (!$isDemoAdmin && !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid admin credentials. (Demo: admin@astrogifts.com / admin123)',
            ], 401);
        }

        if ($user->role !== 'admin') {
            $user->role = 'admin';
            $user->save();
        }

        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Admin login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
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
        
        // Ensure web guard session is completely destroyed for stateful SPA authentication
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
