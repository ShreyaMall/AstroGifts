<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Order</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #121212;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        table {
            border-collapse: collapse;
        }
    </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #121212; width: 100%;">
        <tr>
            <td align="center" style="padding: 10px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background-color: #161616; border-radius: 4px; overflow: hidden;">
                    <!-- Top Purple Header -->
                    <tr>
                        <td style="background-color: #1d182b; padding: 40px 28px 32px 28px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1.18; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                Thank you for your<br>order
                            </h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 28px; background-color: #161616;">
                            <!-- Salutation -->
                            <div style="font-size: 15.5px; font-weight: 600; color: #ffffff; margin-bottom: 12px;">
                                Hi {{ $order->customer_name }},
                            </div>

                            <!-- Intro -->
                            <div style="font-size: 14px; color: #a3a3a3; line-height: 1.5; margin-bottom: 26px;">
                                Thanks for your order. We have received your order and will process it shortly.
                            </div>

                            <!-- Order Header -->
                            <div style="margin-bottom: 22px;">
                                <div style="font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.2;">Order</div>
                                <div style="font-size: 18px; font-weight: 700; color: #ffffff; word-break: break-all; margin-top: 3px;">#{{ $order->order_number ?? $order->id }}</div>
                                <div style="font-size: 13.5px; color: #737373; margin-top: 4px;">
                                    ({{ $order->created_at ? \Carbon\Carbon::parse($order->created_at)->format('d F Y') : date('d F Y') }})
                                </div>
                            </div>

                            <!-- Products & Pricing Table -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; border: 1px solid #2a2a2a; margin-bottom: 28px;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; padding: 12px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700;">Product</th>
                                        <th style="text-align: center; padding: 12px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700; width: 75px;">Quantity</th>
                                        <th style="text-align: right; padding: 12px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700; width: 95px;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($items as $item)
                                    <tr>
                                        <td style="padding: 13px 14px; border: 1px solid #2a2a2a; vertical-align: top;">
                                            <div style="color: #ffffff; font-weight: 600; font-size: 13.5px; line-height: 1.4;">
                                                {{ $item->product_name ?? $item['product_name'] ?? $item['name'] ?? 'Product' }}
                                            </div>
                                            @if(!empty($item->size ?? $item['size'] ?? ''))
                                                <div style="color: #888888; font-size: 12px; margin-top: 4px;">Size: {{ $item->size ?? $item['size'] }}</div>
                                            @endif
                                            @if(!empty($item->selected_color ?? $item['selected_color'] ?? ''))
                                                <div style="color: #888888; font-size: 12px; margin-top: 2px;">Color: {{ $item->selected_color ?? $item['selected_color'] }}</div>
                                            @endif
                                        </td>
                                        <td style="padding: 13px 14px; border: 1px solid #2a2a2a; text-align: center; vertical-align: middle; color: #ffffff; font-size: 13.5px;">
                                            {{ $item->quantity ?? $item['quantity'] ?? 1 }}
                                        </td>
                                        <td style="padding: 13px 14px; border: 1px solid #2a2a2a; text-align: right; vertical-align: middle; color: #ffffff; font-size: 13.5px;">
                                            ₹{{ number_format((float)($item->subtotal ?? (($item->price ?? $item['price'] ?? 0) * ($item->quantity ?? $item['quantity'] ?? 1))), 2) }}
                                        </td>
                                    </tr>
                                    @endforeach

                                    <!-- Subtotal -->
                                    <tr>
                                        <th colspan="2" style="text-align: left; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700;">Subtotal:</th>
                                        <td style="text-align: right; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px;">
                                            ₹{{ number_format((float)($order->subtotal ?? $order->total), 2) }}
                                        </td>
                                    </tr>

                                    <!-- Discount if any -->
                                    @if(!empty($order->discount) && $order->discount > 0)
                                    <tr>
                                        <th colspan="2" style="text-align: left; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700;">Discount:</th>
                                        <td style="text-align: right; padding: 11px 14px; border: 1px solid #2a2a2a; color: #22c55e; font-size: 13.5px;">
                                            -₹{{ number_format((float)$order->discount, 2) }}
                                        </td>
                                    </tr>
                                    @endif

                                    <!-- Shipping -->
                                    <tr>
                                        <th colspan="2" style="text-align: left; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700;">Shipping:</th>
                                        <td style="text-align: right; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px;">
                                            {{ !empty($order->shipping_cost) && $order->shipping_cost > 0 ? '₹' . number_format((float)$order->shipping_cost, 2) : '₹0.00' }}
                                        </td>
                                    </tr>

                                    <!-- Tax if any -->
                                    @if(!empty($order->tax) && $order->tax > 0)
                                    <tr>
                                        <th colspan="2" style="text-align: left; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700;">Tax:</th>
                                        <td style="text-align: right; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px;">
                                            ₹{{ number_format((float)$order->tax, 2) }}
                                        </td>
                                    </tr>
                                    @endif

                                    <!-- Payment Method -->
                                    <tr>
                                        <th colspan="2" style="text-align: left; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px; font-weight: 700;">Payment method:</th>
                                        <td style="text-align: right; padding: 11px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 13.5px;">
                                            {{ strtoupper($order->payment_method ?? 'COD') }}
                                        </td>
                                    </tr>

                                    <!-- Total -->
                                    <tr>
                                        <th colspan="2" style="text-align: left; padding: 13px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 15.5px; font-weight: 700;">Total:</th>
                                        <td style="text-align: right; padding: 13px 14px; border: 1px solid #2a2a2a; color: #ffffff; font-size: 15.5px; font-weight: 700;">
                                            ₹{{ number_format((float)$order->total, 2) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <!-- Billing Address Section -->
                            <div style="margin-top: 24px;">
                                <h3 style="color: #ffffff; font-size: 17px; font-weight: 700; margin: 0 0 10px; line-height: 1.2;">Billing address</h3>
                                <div style="color: #d4d4d4; font-size: 13.5px; line-height: 1.6;">
                                    <div style="color: #ffffff; font-weight: 600;">{{ $order->customer_name }}</div>
                                    @if(!empty($order->shipping_address))
                                        <div>{{ $order->shipping_address }}</div>
                                    @endif
                                    @if(!empty($order->city) || !empty($order->state) || !empty($order->zip))
                                        <div>{{ $order->city }}{{ $order->state ? ', ' . $order->state : '' }} {{ $order->zip ?? '' }}</div>
                                    @endif
                                    @if(!empty($order->phone))
                                        <div style="margin-top: 4px; color: #a3a3a3;">{{ $order->phone }}</div>
                                    @endif
                                    @if(!empty($order->email))
                                        <div style="color: #a3a3a3;">{{ $order->email }}</div>
                                    @endif
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
