<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $collection = 'settings';

    protected $fillable = [
        'key',
        'value',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    /**
     * Get a setting by key, cached for 1 hour
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember("app_setting_{$key}", 3600, function () use ($key, $default) {
            $record = static::where('key', $key)->first();
            return $record ? $record->value : $default;
        });
    }

    /**
     * Store or update a setting and invalidate cache
     */
    public static function set(string $key, $value): self
    {
        Cache::forget("app_setting_{$key}");
        
        $setting = static::where('key', $key)->first();
        if ($setting) {
            $setting->value = $value;
            $setting->save();
            return $setting;
        }

        return static::create([
            'key' => $key,
            'value' => $value,
        ]);
    }

    /**
     * Clear setting cache manually
     */
    public static function clearCache(string $key): void
    {
        Cache::forget("app_setting_{$key}");
    }
}
