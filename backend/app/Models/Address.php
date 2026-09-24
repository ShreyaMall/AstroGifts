<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'pincode',
        'locality',
        'address_line',
        'city',
        'state',
        'is_default',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
