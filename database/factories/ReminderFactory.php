<?php

namespace Database\Factories;

use App\Enums\ReminderType;
use App\Models\Reminder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reminder>
 */
class ReminderFactory extends Factory
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
            'type' => ReminderType::Time,
            'title' => fake()->sentence(3),
            'body' => fake()->sentence(),
            'remind_at' => now()->addDay(),
        ];
    }

    public function timeReminder(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => ReminderType::Time,
        ]);
    }

    public function taskReminder(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => ReminderType::Task,
            'remind_at' => null,
        ]);
    }

    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'done_at' => now(),
        ]);
    }

    public function notified(): static
    {
        return $this->state(fn (array $attributes) => [
            'notified_at' => now(),
        ]);
    }
}
