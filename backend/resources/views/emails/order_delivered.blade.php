<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Been Delivered - Order #{{ $order->order_number }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 24px 30px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .banner { background: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 18px 30px; text-align: center; }
        .banner-icon { font-size: 28px; margin-bottom: 4px; }
        .banner-title { color: #065f46; font-weight: 700; font-size: 17px; margin: 0; }
        .banner-sub { color: #047857; font-size: 13.5px; margin-top: 2px; }
        .content { padding: 26px 30px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0; }
        .policy-note { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; border-radius: 8px; padding: 14px 18px; font-size: 13px; line-height: 1.5; margin-top: 20px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Homewood Decor</h1>
        </div>

        <div class="banner">
            <div class="banner-icon">🏡✨</div>
            <h2 class="banner-title">Delivered! Enjoy Your New Furniture</h2>
            <div class="banner-sub">Order #{{ $order->order_number }} has arrived at your address.</div>
        </div>

        <div class="content">
            <p style="font-size: 15px; margin-top: 0;">
                Dear <strong>{{ $order->customer_name }}</strong>,<br>
                Your package has been successfully delivered! We hope you love your new furniture piece as much as we loved making it.
            </p>

            <div class="card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Order ID:</td>
                        <td style="text-align: right; font-weight: 700; color: #0f172a; font-size: 14px;">#{{ $order->order_number }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Delivery Address:</td>
                        <td style="text-align: right; color: #334155; font-size: 13px;">{{ $order->shipping_address }}, {{ $order->city }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Total Amount Paid:</td>
                        <td style="text-align: right; font-weight: 700; color: #15803d; font-size: 14px;">₹{{ number_format((float)$order->total, 2) }}</td>
                    </tr>
                </table>
            </div>

            <div class="policy-note">
                <strong>Need an Exchange or Return?</strong><br>
                If there is any defect, size mismatch, or quality issue with your item, you can request an <strong>Exchange</strong> or <strong>Return</strong> directly from your <strong>My Orders</strong> page on our website within 7 days.
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Homewood Decor. Thank you for making us a part of your home!
        </div>
    </div>
</body>
</html>
