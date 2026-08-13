<?php

namespace Database\Factories;

use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingsGoal>
 */
class SavingsGoalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->words(2, true),
            'target_amount' => fake()->numberBetween(100_000, 10_000_000),
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(3)->toDateString(),
            'notes' => fake()->sentence(),
        ];
    }

    public function reached(): static
    {
        return $this->state(fn (array $attributes) => [
            'end_date' => now()->subDay()->toDateString(),
        ]);
    }
}
