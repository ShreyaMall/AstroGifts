<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Processed - Order #{{ $order->order_number }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 22px 30px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .banner { background: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 18px 30px; text-align: center; }
        .banner-icon { font-size: 28px; margin-bottom: 4px; }
        .banner-title { color: #065f46; font-weight: 700; font-size: 17px; margin: 0; }
        .content { padding: 26px 30px; }
        .refund-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0; text-align: center; }
        .refund-val { font-size: 26px; font-weight: 800; color: #15803d; margin: 6px 0; }
        .note { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 8px; padding: 14px 18px; font-size: 13px; line-height: 1.5; margin-top: 20px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Homewood Decor</h1>
        </div>

        <div class="banner">
            <div class="banner-icon">💰</div>
            <h2 class="banner-title">Refund Successful</h2>
            <div style="font-size: 13px; color: #047857; margin-top: 2px;">Order #{{ $order->order_number }}</div>
        </div>

        <div class="content">
            <p style="font-size: 15px; margin-top: 0;">
                Dear <strong>{{ $order->customer_name }}</strong>,<br>
                We have processed your refund for returned items from order <strong>#{{ $order->order_number }}</strong>.
            </p>

            <div class="refund-card">
                <div style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase;">Refund Amount</div>
                <div class="refund-val">₹{{ number_format((float)$refundAmount, 2) }}</div>
                <div style="font-size: 12.5px; color: #475569;">Payment Method: {{ strtoupper($order->payment_method ?? 'Original Payment Method') }}</div>
            </div>

            <div class="note">
                <strong>When will you see the money?</strong><br>
                • <strong>Online Payments (UPI / Card / NetBanking):</strong> It typically takes 1 to 3 business days for the funds to reflect in your bank account.<br>
                • <strong>Cash on Delivery (COD):</strong> If transferred to your provided UPI or Bank details, it will reflect within 24 hours.
            </div>

            <p style="font-size: 13.5px; color: #64748b; margin-top: 20px;">
                Thank you for your patience and understanding throughout the return process. We hope to serve you again soon!
            </p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Homewood Decor. If you need any assistance, contact us at support@homewooddecor.com.
        </div>
    </div>
</body>
</html>
