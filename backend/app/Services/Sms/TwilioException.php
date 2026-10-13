<?php

namespace App\Services\Sms;

use Exception;

class TwilioException extends Exception
{
    protected int $statusCode;
    protected ?int $twilioCode;

    public function __construct(string $message, int $statusCode = 500, ?int $twilioCode = null)
    {
        parent::__construct($message, $statusCode);
        $this->statusCode = $statusCode;
        $this->twilioCode = $twilioCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getTwilioCode(): ?int
    {
        return $this->twilioCode;
    }
}
