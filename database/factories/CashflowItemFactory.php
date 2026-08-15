<?php

namespace Database\Factories;

use App\Models\Cashflow;
use App\Models\CashflowItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CashflowItem>
 */
class CashflowItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cashflow_id' => Cashflow::factory(),
            'type' => fake()->randomElement([CashflowItem::TYPE_INCOME, CashflowItem::TYPE_EXPENSE]),
            'name' => fake()->word(),
            'amount' => fake()->numberBetween(10_000, 1_000_000),
            'quantity' => 1,
        ];
    }

    public function income(): static
    {
        return $this->state(fn (): array => [
            'type' => CashflowItem::TYPE_INCOME,
            'quantity' => 1,
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (): array => [
            'type' => CashflowItem::TYPE_EXPENSE,
        ]);
    }
}
