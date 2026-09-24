<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'user',
        'customer_name',
        'email',
        'phone',
        'shipping_address',
        'city',
        'state',
        'zip',
        'shippingAddress',
        'items',
        'subtotal',
        'discount',
        'shipping',
        'shipping_cost',
        'tax',
        'total',
        'payment_method',
        'paymentMethod',
        'payment_status',
        'paymentStatus',
        'razorpayPaymentId',
        'status',
        'orderStatus',
        'notes',
        'tracking_number',
        'courier_name',
        'tracking_url',
        'shiprocket',
        'shiprocket_order_id',
        'shiprocket_shipment_id',
        'shiprocket_status',
        'shiprocket_awb_code',
        'return_type',
        'return_reason',
        'return_notes',
        'return_bank_details',
        'return_status',
        'return_requested_at',
        'refund_amount',
        'refunded_at',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount' => 'float',
        'shipping' => 'float',
        'shipping_cost' => 'float',
        'tax' => 'float',
        'total' => 'float',
        'shippingAddress' => 'array',
        'shiprocket' => 'array',
        'items' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
