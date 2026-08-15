<?php

use App\Models\Reminder;
use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard exposes analytics data', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create(['target_amount' => 1_000_000]);
    SavingsPayment::factory()->for($goal)->create(['amount' => 250_000, 'paid_at' => now()->toDateString()]);
    Reminder::factory()->for($user)->create(['remind_at' => now()->subDay(), 'done_at' => now()]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('charts.goalsProgress', 1)
            ->where('charts.goalsProgress.0.percent', 25)
            ->has('charts.monthlySavings', 6)
            ->where('charts.monthlySavings.5.amount', 250000)
            ->has('charts.remindersCompleted', 8)
            ->where('charts.remindersCompleted.7.count', 1));
});
