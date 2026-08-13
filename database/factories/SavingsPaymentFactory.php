<?php

namespace Database\Factories;

use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingsPayment>
 */
class SavingsPaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'savings_goal_id' => SavingsGoal::factory(),
            'amount' => fake()->numberBetween(10_000, 1_000_000),
            'paid_at' => now()->toDateString(),
            'note' => fake()->sentence(2),
        ];
    }
}
