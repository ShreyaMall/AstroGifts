<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = ['question', 'answer', 'is_active', 'sort_order'];
}
