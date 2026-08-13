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
        Schema::create('savings_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('savings_goal_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->date('paid_at');
            $table->string('note')->nullable();
            $table->timestamps();

            $table->index(['savings_goal_id', 'paid_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_payments');
    }
};
