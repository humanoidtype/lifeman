<?php

use App\Models\SavingsGoal;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('savings-goals.index'))->assertRedirect(route('login'));
});

test('authenticated users can list their savings goals', function () {
    $user = User::factory()->create();
    SavingsGoal::factory()->count(2)->for($user)->create();

    $this->actingAs($user)
        ->get(route('savings-goals.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('savings/index')
            ->has('goals.data', 2));
});

test('users can create a savings goal', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('savings-goals.store'), [
            'title' => 'Liburan Bali',
            'target_amount' => 5_000_000,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(2)->toDateString(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('savings_goals', [
        'user_id' => $user->id,
        'title' => 'Liburan Bali',
        'target_amount' => '5000000.00',
    ]);
});

test('savings goal validation rejects invalid data', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('savings-goals.store'), [
            'title' => '',
            'target_amount' => 0,
            'end_date' => now()->subDay()->toDateString(),
        ])
        ->assertSessionHasErrors(['title', 'target_amount']);
});

test('users can view their savings goal progress', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();

    $this->actingAs($user)
        ->get(route('savings-goals.show', $goal))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('savings/show')
            ->where('goal.id', $goal->id));
});

test('users cannot view or modify savings goals of other users', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $goal = SavingsGoal::factory()->for($other)->create();

    $this->actingAs($user);
    $this->get(route('savings-goals.show', $goal))->assertForbidden();
    $this->patch(route('savings-goals.update', $goal), ['title' => 'Hacked'])->assertForbidden();
    $this->delete(route('savings-goals.destroy', $goal))->assertForbidden();
});
