<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Business>
 */
class BusinessFactory extends Factory
{
    protected $model = Business::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->company(),
            'rekap_period' => Business::PERIOD_WEEKLY,
            'period_start' => now()->startOfDay(),
            'formula_type' => Business::FORMULA_FB_A,
            'raw_material_pct' => 40,
            'operational_pct' => 35,
            'marketing_pct' => 5,
            'profit_pct' => 20,
        ];
    }
}
