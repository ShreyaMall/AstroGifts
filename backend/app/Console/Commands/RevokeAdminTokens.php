<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class RevokeAdminTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:revoke-tokens';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Revoke personal access tokens for all users with the admin role only';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $adminUsers = User::where('role', 'admin')->get();

        if ($adminUsers->isEmpty()) {
            $this->info('No admin users found.');
            return self::SUCCESS;
        }

        $totalRevoked = 0;
        foreach ($adminUsers as $admin) {
            $count = $admin->tokens()->count();
            $admin->tokens()->delete();
            $totalRevoked += $count;
            $this->line("Revoked {$count} token(s) for admin: {$admin->email}");
        }

        $this->info("Successfully revoked {$totalRevoked} admin token(s). Customer tokens were untouched.");
        return self::SUCCESS;
    }
}
