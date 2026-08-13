<?php

use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use App\Models\User;

test('users can add a payment to their savings goal', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('savings-payments.store', $goal), [
            'amount' => 250_000,
            'paid_at' => now()->toDateString(),
            'note' => 'Cicilan pertama',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('savings_payments', [
        'savings_goal_id' => $goal->id,
        'amount' => '250000.00',
    ]);
});

test('payment validation requires amount and paid_at', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('savings-payments.store', $goal), ['amount' => ''])
        ->assertSessionHasErrors(['amount', 'paid_at']);
});

test('users cannot add payments to goals of other users', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $goal = SavingsGoal::factory()->for($other)->create();

    $this->actingAs($user)
        ->post(route('savings-payments.store', $goal), [
            'amount' => 100_000,
            'paid_at' => now()->toDateString(),
        ])
        ->assertForbidden();
});

test('users can delete their own payment but not others', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $payment = SavingsPayment::factory()->for(
        SavingsGoal::factory()->for($user)
    )->create();
    $otherPayment = SavingsPayment::factory()->for(
        SavingsGoal::factory()->for($other)
    )->create();

    $this->actingAs($user);
    $this->delete(route('savings-payments.destroy', $payment))->assertRedirect();
    $this->delete(route('savings-payments.destroy', $otherPayment))->assertForbidden();

    expect(SavingsPayment::find($payment->id))->toBeNull()
        ->and(SavingsPayment::find($otherPayment->id))->not->toBeNull();
});
