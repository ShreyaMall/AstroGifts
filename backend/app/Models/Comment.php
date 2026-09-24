<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'post_slug',
        'post_title',
        'user_name',
        'user_email',
        'user_avatar',
        'comment',
        'status',
    ];
}
