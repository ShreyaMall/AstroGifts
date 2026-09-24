<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncOrderToShiprocket implements ShouldQueue
{
    use Queueable;

    public \App\Models\Order $order;

    /**
     * Create a new job instance.
     */
    public function __construct(\App\Models\Order $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $shiprocket = new \App\Services\ShiprocketService();
            $shiprocket->createOrder($this->order);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Background Shiprocket order creation failed: ' . $e->getMessage());
        }
    }
}
