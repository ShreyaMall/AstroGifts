<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_percent',
        'min_spend',
        'is_active',
    ];

    protected $casts = [
        'discount_percent' => 'integer',
        'min_spend' => 'float',
        'is_active' => 'boolean',
    ];
}
