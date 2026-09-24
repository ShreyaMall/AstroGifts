<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Received - Order #{{ $order->order_number }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            color: #0f172a;
            line-height: 1.6;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: #0f172a;
            padding: 24px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .header p {
            margin: 4px 0 0;
            color: #94a3b8;
            font-size: 13px;
        }
        .badge-bar {
            background: #fef3c7;
            border-bottom: 1px solid #fde68a;
            padding: 12px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .badge-title {
            color: #92400e;
            font-weight: 700;
            font-size: 14px;
        }
        .order-pill {
            background: #ffffff;
            border: 1px solid #f59e0b;
            color: #b45309;
            font-weight: 700;
            font-size: 12px;
            padding: 2px 10px;
            border-radius: 12px;
        }
        .body-content {
            padding: 28px 30px;
        }
        .intro-title {
            font-size: 17px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 16px;
        }
        /* Details Card */
        .details-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
            font-size: 14px;
        }
        .detail-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .detail-row:first-child {
            padding-top: 0;
        }
        .detail-bullet {
            color: #d97706;
            font-weight: bold;
            font-size: 16px;
            margin-right: 8px;
            line-height: 1.4;
        }
        .detail-label {
            font-weight: 600;
            color: #475569;
            min-width: 140px;
        }
        .detail-value {
            color: #0f172a;
            font-weight: 600;
            flex: 1;
        }
        /* Items Table */
        .section-heading {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin: 20px 0 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13.5px;
        }
        .items-table th {
            background: #f1f5f9;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border-bottom: 1px solid #cbd5e1;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        .cta-box {
            text-align: center;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #f1f5f9;
        }
        .cta-btn {
            display: inline-block;
            background: #0f172a;
            color: #ffffff !important;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            text-decoration: none;
        }
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 18px 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <h1>Homewood Decor</h1>
            <p>Admin Notification System</p>
        </div>

        <div class="badge-bar">
            <span class="badge-title">📩 New Order Received</span>
            <span class="order-pill">Order #{{ $order->order_number }}</span>
        </div>

        <div class="body-content">
            <h2 class="intro-title">Order Details:</h2>

            <!-- Exact Bullet Details Format -->
            <div class="details-card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Customer Name:</strong>
                            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">{{ $order->customer_name }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Customer Email:</strong>
                            <a href="mailto:{{ $order->email }}" style="color: #2563eb; text-decoration: none; font-weight: 600; margin-left: 6px;">{{ $order->email }}</a>
                        </td>
                    </tr>
                    @if(!empty($order->phone))
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Customer Phone:</strong>
                            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">{{ $order->phone }}</span>
                        </td>
                    </tr>
                    @endif

                    @php
                        $firstItem = !empty($items) && count($items) > 0 ? $items[0] : null;
                        $firstItemName = $firstItem ? ($firstItem->product_name ?? $firstItem['name'] ?? 'Product') : 'N/A';
                        $firstItemQty = $firstItem ? ($firstItem->quantity ?? $firstItem['quantity'] ?? 1) : 1;
                        $firstItemPrice = $firstItem ? ($firstItem->price ?? $firstItem['price'] ?? 0) : 0;
                    @endphp

                    @if(count($items) === 1)
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Product:</strong>
                            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">{{ $firstItemName }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Quantity:</strong>
                            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">{{ $firstItemQty }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Price:</strong>
                            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">₹{{ number_format((float)$firstItemPrice, 2) }}</span>
                        </td>
                    </tr>
                    @else
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Products:</strong>
                            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">{{ count($items) }} items ordered (details below)</span>
                        </td>
                    </tr>
                    @endif

                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Total:</strong>
                            <span style="color: #15803d; font-weight: 700; font-size: 15px; margin-left: 6px;">₹{{ number_format((float)$order->total, 2) }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Delivery Address:</strong>
                            <span style="color: #334155; margin-left: 6px;">
                                {{ $order->shipping_address }}, {{ $order->city }}{{ $order->state ? ', ' . $order->state : '' }} {{ $order->zip ?? '' }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Payment Method:</strong>
                            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">
                                {{ strtoupper($order->payment_method ?? 'COD') }} ({{ ucfirst($order->payment_status ?? 'Pending') }})
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; vertical-align: top; font-size: 14px;">
                            <span class="detail-bullet">&bull;</span>
                            <strong style="color: #475569;">Order Date:</strong>
                            <span style="color: #0f172a; margin-left: 6px;">
                                {{ $order->created_at ? $order->created_at->format('d M Y, h:i A') : now()->format('d M Y, h:i A') }}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- If multiple items, show detailed breakdown table -->
            @if(count($items) > 1)
            <div class="section-heading">All Ordered Items</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product_name ?? $item['name'] ?? 'Product' }}</strong>
                            @if(!empty($item->selected_color ?? $item['selected_color'] ?? ''))
                                <div style="font-size: 12px; color: #64748b;">Color: {{ $item->selected_color ?? $item['selected_color'] }}</div>
                            @endif
                        </td>
                        <td style="text-align: center;">{{ $item->quantity ?? $item['quantity'] ?? 1 }}</td>
                        <td style="text-align: right;">₹{{ number_format((float)($item->price ?? $item['price'] ?? 0), 2) }}</td>
                        <td style="text-align: right; font-weight: 600;">₹{{ number_format((float)($item->subtotal ?? (($item->price ?? $item['price'] ?? 0) * ($item->quantity ?? $item['quantity'] ?? 1))), 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @endif

            <div class="cta-box">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/admin" class="cta-btn">
                    View in Admin Dashboard &rarr;
                </a>
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Homewood Decor. Automated Store Admin Notification.
        </div>
    </div>
</body>
</html>
