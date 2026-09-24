<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Been Shipped - Order #{{ $order->order_number }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 24px 30px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .banner { background: #eff6ff; border-bottom: 1px solid #bfdbfe; padding: 16px 30px; text-align: center; }
        .banner-icon { font-size: 28px; margin-bottom: 4px; }
        .banner-title { color: #1e40af; font-weight: 700; font-size: 16px; margin: 0; }
        .banner-sub { color: #3b82f6; font-size: 13px; margin-top: 2px; }
        .content { padding: 26px 30px; }
        .tracking-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0; }
        .tracking-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13.5px; }
        .tracking-label { color: #64748b; font-weight: 500; }
        .tracking-val { color: #0f172a; font-weight: 700; }
        .track-btn { display: inline-block; background: #d96b27; color: #fff !important; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 14px; }
        .items-summary { margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Homewood Decor</h1>
        </div>

        <div class="banner">
            <div class="banner-icon">🚚</div>
            <h2 class="banner-title">Your Order is on the Way!</h2>
            <div class="banner-sub">Order #{{ $order->order_number }} has been shipped.</div>
        </div>

        <div class="content">
            <p style="font-size: 15px; margin-top: 0;">
                Hi <strong>{{ $order->customer_name }}</strong>,<br>
                Great news! Your package has been dispatched from our warehouse and is on its way to your doorstep.
            </p>

            <div class="tracking-card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Order Number:</td>
                        <td style="text-align: right; font-weight: 700; color: #0f172a; font-size: 14px;">#{{ $order->order_number }}</td>
                    </tr>
                    @if(!empty($order->courier_name))
                    <tr>
                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Courier Partner:</td>
                        <td style="text-align: right; font-weight: 600; color: #0f172a; font-size: 13.5px;">{{ $order->courier_name }}</td>
                    </tr>
                    @endif
                    @if(!empty($order->tracking_number))
                    <tr>
                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Tracking AWB:</td>
                        <td style="text-align: right; font-weight: 700; color: #d96b27; font-size: 14px;">{{ $order->tracking_number }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Delivery Address:</td>
                        <td style="text-align: right; color: #334155; font-size: 13px;">{{ $order->shipping_address }}, {{ $order->city }}</td>
                    </tr>
                </table>

                @if(!empty($order->tracking_url))
                <div style="text-align: center;">
                    <a href="{{ $order->tracking_url }}" class="track-btn" target="_blank">Track Shipment &rarr;</a>
                </div>
                @endif
            </div>

            <div class="items-summary">
                <strong style="font-size: 14px; color: #0f172a;">Items in this shipment:</strong>
                <ul style="padding-left: 20px; color: #475569; font-size: 13.5px; margin-top: 8px;">
                    @foreach($items as $item)
                        <li>{{ $item->product_name ?? $item['name'] ?? 'Product' }} &times; {{ $item->quantity ?? $item['quantity'] ?? 1 }}</li>
                    @endforeach
                </ul>
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Homewood Decor. If you have any questions, contact support@homewooddecor.com.
        </div>
    </div>
</body>
</html>
