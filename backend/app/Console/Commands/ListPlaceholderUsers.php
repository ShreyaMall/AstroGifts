<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ListPlaceholderUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:list-placeholders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users with placeholder names or duplicate phone numbers without making any DB modifications.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("=== SCANNING USER DATABASE ===");
        $users = User::all();

        $this->line("Total User Records: " . $users->count());

        $placeholders = [];
        $phoneMap = [];
        $duplicates = [];

        foreach ($users as $user) {
            $name = $user->name ?? '';
            $phone = $user->phone ?? 'NONE';

            // Identify placeholder users ("User ####" or empty name)
            if (empty($name) || preg_match('/^User \d+$/i', trim($name))) {
                $placeholders[] = [
                    'ID' => (string)$user->id,
                    'Name' => $name ?: '[EMPTY/NULL]',
                    'Email' => $user->email ?: '[NONE]',
                    'Phone' => $phone,
                    'Phone Verified' => $user->phone_verified_at ? 'YES' : 'NO',
                    'Created At' => (string)$user->created_at,
                ];
            }

            if ($phone !== 'NONE' && !empty($phone)) {
                if (!isset($phoneMap[$phone])) {
                    $phoneMap[$phone] = [];
                }
                $phoneMap[$phone][] = [
                    'ID' => (string)$user->id,
                    'Name' => $name ?: '[EMPTY]',
                    'Email' => $user->email ?: '[NONE]',
                ];
            }
        }

        foreach ($phoneMap as $phone => $records) {
            if (count($records) > 1) {
                foreach ($records as $r) {
                    $duplicates[] = array_merge(['Phone' => $phone], $r);
                }
            }
        }

        $this->info("\n--- 1. PLACEHOLDER / UNNAMED USERS (" . count($placeholders) . ") ---");
        if (!empty($placeholders)) {
            $this->table(['ID', 'Name', 'Email', 'Phone', 'Phone Verified', 'Created At'], $placeholders);
        } else {
            $this->line("No placeholder users found.");
        }

        $this->info("\n--- 2. DUPLICATE PHONE NUMBERS (" . count($duplicates) . ") ---");
        if (!empty($duplicates)) {
            $this->table(['Phone', 'ID', 'Name', 'Email'], $duplicates);
        } else {
            $this->line("No duplicate phone numbers found.");
        }

        $this->info("\nCompleted audit safely. Zero records were modified.");
        return 0;
    }
}
