<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReturnStatusCustomerMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public string $statusNote;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, string $statusNote = '')
    {
        $this->order = $order;
        $this->statusNote = $statusNote;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $type = $this->order->return_type ?? 'Return';
        $status = str_contains($this->order->status, 'Approved') ? 'Approved' : 'Updated';
        return new Envelope(
            subject: "Your {$type} Request has been {$status} - Order #{$this->order->order_number}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.return_status_customer',
            with: [
                'order' => $this->order,
                'items' => $this->order->items ?? [],
                'statusNote' => $this->statusNote,
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
