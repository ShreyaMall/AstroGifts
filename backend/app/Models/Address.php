<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use MongoDB\Laravel\Eloquent\Model;

class Address extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'full_name',
        'name',
        'phone',
        'line1',
        'address_line',
        'line2',
        'landmark',
        'locality',
        'city',
        'state',
        'pincode',
        'country',
        'label',
        'is_default',
    ];

    protected $attributes = [
        'country' => 'India',
        'is_default' => false,
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'id',
    ];

    /**
     * Ensure full_name / name consistency
     */
    public function getFullNameAttribute($value)
    {
        return $value ?: ($this->attributes['name'] ?? '');
    }

    public function getNameAttribute($value)
    {
        return $value ?: ($this->attributes['full_name'] ?? '');
    }

    /**
     * Ensure line1 / address_line consistency
     */
    public function getLine1Attribute($value)
    {
        return $value ?: ($this->attributes['address_line'] ?? '');
    }

    public function getAddressLineAttribute($value)
    {
        return $value ?: ($this->attributes['line1'] ?? '');
    }

    /**
     * Ensure landmark / locality consistency
     */
    public function getLandmarkAttribute($value)
    {
        return $value ?: ($this->attributes['locality'] ?? null);
    }

    public function getLocalityAttribute($value)
    {
        return $value ?: ($this->attributes['landmark'] ?? null);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
