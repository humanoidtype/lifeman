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
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('rekap_period');
            $table->date('period_start');
            $table->string('formula_type');
            $table->decimal('raw_material_pct', 5, 2);
            $table->decimal('operational_pct', 5, 2);
            $table->decimal('marketing_pct', 5, 2);
            $table->decimal('profit_pct', 5, 2);
            $table->timestamps();

            $table->index(['user_id', 'period_start']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
