<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\Sms\OtpService::class);

        $this->app->bind(\App\Services\Sms\SmsServiceInterface::class, function () {
            try {
                $otpService = app(\App\Services\Sms\OtpService::class);
                $config = $otpService->getTwilioConfig();
                if (!empty($config['enabled'])) {
                    return new \App\Services\Sms\TwilioSmsService();
                }
            } catch (\Throwable $e) {
                // fallback to default driver if DB not reachable
            }

            $driver = env('SMS_DRIVER', 'log');
            if ($driver === 'msg91') {
                return new \App\Services\Sms\Msg91SmsService();
            }
            return new \App\Services\Sms\LogSmsService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
        \App\Models\Category::observe(\App\Observers\CategoryObserver::class);
    }
}
