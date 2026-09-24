<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RefundConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public float $refundAmount;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, float $refundAmount = 0.0)
    {
        $this->order = $order;
        $this->refundAmount = $refundAmount > 0 ? $refundAmount : (float)($order->total ?? 0);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Refund Processed for Order #' . $this->order->order_number . ' - Homewood Decor',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.refund_confirmation',
            with: [
                'order' => $this->order,
                'refundAmount' => $this->refundAmount,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
