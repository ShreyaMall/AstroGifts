<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $order->return_type ?? 'Return' }} Requested - Order #{{ $order->order_number }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { background: #1e293b; padding: 22px 30px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 19px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .banner { background: #fef2f2; border-bottom: 1px solid #fecaca; padding: 14px 30px; text-align: center; }
        .banner-title { color: #991b1b; font-weight: 700; font-size: 16px; margin: 0; }
        .content { padding: 26px 30px; }
        .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 16px 0; }
        .cta-btn { display: inline-block; background: #0f172a; color: #fff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 14px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Homewood Decor</h1>
            <p style="margin: 2px 0 0; font-size: 12px; color: #94a3b8;">Admin Alert</p>
        </div>

        <div class="banner">
            <h2 class="banner-title">⚠️ {{ strtoupper($order->return_type ?? 'Return') }} Requested</h2>
            <div style="font-size: 13px; color: #b91c1c; margin-top: 2px;">Action required on Order #{{ $order->order_number }}</div>
        </div>

        <div class="content">
            <p style="font-size: 14.5px; margin-top: 0;">
                Customer <strong>{{ $order->customer_name }}</strong> has submitted a request for <strong>{{ $order->return_type ?? 'Return' }}</strong> on their delivered order.
            </p>

            <div class="details-card">
                <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                    <tr>
                        <td style="color: #64748b; padding: 5px 0; width: 140px;">Order ID:</td>
                        <td style="font-weight: 700; color: #0f172a;">#{{ $order->order_number }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 5px 0;">Customer Name:</td>
                        <td style="font-weight: 600; color: #0f172a;">{{ $order->customer_name }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 5px 0;">Customer Contact:</td>
                        <td>{{ $order->email }} / {{ $order->phone ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 5px 0;">Request Type:</td>
                        <td style="font-weight: 700; color: {{ ($order->return_type ?? '') === 'Exchange' ? '#2563eb' : '#dc2626' }};">
                            {{ $order->return_type ?? 'Return' }}
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 5px 0;">Reason:</td>
                        <td style="font-weight: 600; color: #0f172a;">{{ $order->return_reason ?? 'Not specified' }}</td>
                    </tr>
                    @if(!empty($order->return_notes))
                    <tr>
                        <td style="color: #64748b; padding: 5px 0;">Customer Notes:</td>
                        <td style="color: #334155; font-style: italic;">{{ $order->return_notes }}</td>
                    </tr>
                    @endif
                    @if(!empty($order->return_bank_details))
                    <tr>
                        <td style="color: #64748b; padding: 5px 0;">Refund UPI/Bank:</td>
                        <td style="font-weight: 600; color: #15803d;">{{ $order->return_bank_details }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td style="color: #64748b; padding: 5px 0;">Order Value:</td>
                        <td style="font-weight: 700; color: #0f172a;">₹{{ number_format((float)$order->total, 2) }}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 24px;">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/admin" class="cta-btn">
                    Review in Admin Dashboard &rarr;
                </a>
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Homewood Decor. Automated Notification.
        </div>
    </div>
</body>
</html>
