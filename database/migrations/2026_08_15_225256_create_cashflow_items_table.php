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
        Schema::create('cashflow_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashflow_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('name');
            $table->decimal('amount', 14, 2);
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->index(['cashflow_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cashflow_items');
    }
};
