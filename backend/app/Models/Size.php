<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Size extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'dimensions',
        'status',
        'order',
        'created_at',
        'updated_at',
    ];
}
