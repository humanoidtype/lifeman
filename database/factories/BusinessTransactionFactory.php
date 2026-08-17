<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\BusinessTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BusinessTransaction>
 */
class BusinessTransactionFactory extends Factory
{
    protected $model = BusinessTransaction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'date' => now()->toDateString(),
            'type' => BusinessTransaction::TYPE_INCOME,
            'name' => 'Pendapatan',
            'category' => null,
            'amount' => fake()->randomFloat(2, 10000, 1000000),
        ];
    }
}
