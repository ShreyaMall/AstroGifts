<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Support MongoDB index creation
        if (config('database.default') === 'mongodb') {
            try {
                Schema::connection('mongodb')->table('addresses', function (Blueprint $collection) {
                    $collection->index('user_id');
                    $collection->index(['user_id' => 1, 'is_default' => -1]);
                    $collection->index('deleted_at');
                });
            } catch (\Throwable $e) {
                // Collection might be indexed dynamically or not exist yet
            }
        }

        // Support SQL schema if running in relational database
        if (Schema::hasTable('addresses')) {
            Schema::table('addresses', function (Blueprint $table) {
                if (!Schema::hasColumn('addresses', 'full_name')) {
                    $table->string('full_name')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('addresses', 'line1')) {
                    $table->string('line1')->nullable()->after('phone');
                }
                if (!Schema::hasColumn('addresses', 'line2')) {
                    $table->string('line2')->nullable()->after('line1');
                }
                if (!Schema::hasColumn('addresses', 'landmark')) {
                    $table->string('landmark')->nullable()->after('line2');
                }
                if (!Schema::hasColumn('addresses', 'country')) {
                    $table->string('country')->default('India')->after('state');
                }
                if (!Schema::hasColumn('addresses', 'label')) {
                    $table->string('label')->nullable()->after('country');
                }
                if (!Schema::hasColumn('addresses', 'deleted_at')) {
                    $table->softDeletes()->after('updated_at');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') === 'mongodb') {
            try {
                Schema::connection('mongodb')->table('addresses', function (Blueprint $collection) {
                    $collection->dropIndex('user_id_1');
                });
            } catch (\Throwable $e) {
                // Ignore
            }
        }
    }
};
