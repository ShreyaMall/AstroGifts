<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $order->return_type ?? 'Return' }} Update - Order #{{ $order->order_number }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 22px 30px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .banner { background: #eff6ff; border-bottom: 1px solid #bfdbfe; padding: 16px 30px; text-align: center; }
        .banner-title { color: #1e40af; font-weight: 700; font-size: 16px; margin: 0; }
        .content { padding: 26px 30px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0; }
        .pickup-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; color: #065f46; font-size: 13.5px; margin-top: 18px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Homewood Decor</h1>
        </div>

        <div class="banner">
            <h2 class="banner-title">✅ {{ $order->return_type ?? 'Return' }} Request Approved</h2>
            <div style="font-size: 13px; color: #3b82f6; margin-top: 2px;">Order #{{ $order->order_number }}</div>
        </div>

        <div class="content">
            <p style="font-size: 15px; margin-top: 0;">
                Dear <strong>{{ $order->customer_name }}</strong>,<br>
                Your request for <strong>{{ $order->return_type ?? 'Return' }}</strong> on order <strong>#{{ $order->order_number }}</strong> has been approved by our team.
            </p>

            <div class="card">
                <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                    <tr>
                        <td style="color: #64748b; padding: 4px 0; width: 140px;">Status:</td>
                        <td style="font-weight: 700; color: #15803d;">{{ $order->status }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 4px 0;">Reason:</td>
                        <td style="font-weight: 600; color: #0f172a;">{{ $order->return_reason ?? 'Verified' }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 4px 0;">Pickup Address:</td>
                        <td style="color: #334155;">{{ $order->shipping_address }}, {{ $order->city }}</td>
                    </tr>
                </table>
            </div>

            <div class="pickup-box">
                <strong>📦 Courier Pickup Information:</strong><br>
                Our courier representative will arrive at your address within <strong>24 to 48 hours</strong> to collect the item. Please ensure the product is packed in its original packaging with all tags intact.
            </div>

            <p style="font-size: 13.5px; color: #64748b; margin-top: 18px;">
                Once the item arrives at our warehouse and passes quality check, your {{ ($order->return_type ?? '') === 'Exchange' ? 'replacement product will be shipped immediately' : 'refund will be credited to your account' }}.
            </p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Homewood Decor. Questions? Reach us at support@homewooddecor.com.
        </div>
    </div>
</body>
</html>
