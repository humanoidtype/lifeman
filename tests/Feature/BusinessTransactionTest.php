<?php

use App\Models\Business;
use App\Models\BusinessTransaction;
use App\Models\User;

test('initial capital can be recorded once', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
            'date' => '2026-08-17',
            'name' => 'Modal awal',
            'amount' => 50000000,
        ])
        ->assertRedirect();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
            'date' => '2026-08-17',
            'name' => 'Modal awal',
            'amount' => 10000000,
        ])
        ->assertSessionHasErrors('initial_capital');

    expect($business->transactions()->where('type', BusinessTransaction::TYPE_INITIAL_CAPITAL)->count())->toBe(1);
});

test('daily modal is unique per day', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $payload = [
        'type' => BusinessTransaction::TYPE_DAILY_MODAL,
        'date' => '2026-08-18',
        'name' => 'Modal harian',
        'amount' => 500000,
    ];

    $this->actingAs($user)->post(route('business-transactions.store', $business), $payload)->assertRedirect();
    $this->actingAs($user)->post(route('business-transactions.store', $business), $payload)->assertSessionHasErrors('daily_modal');

    expect($business->transactions()->where('type', BusinessTransaction::TYPE_DAILY_MODAL)->count())->toBe(1);
});

test('expenses require a category', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_EXPENSE_SMALL,
            'date' => '2026-08-18',
            'name' => 'Belanja sayur',
            'amount' => 150000,
        ])
        ->assertSessionHasErrors('category');
});

test('expense category must be valid', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_EXPENSE_BIG,
            'date' => '2026-08-18',
            'name' => 'Sewa kios',
            'category' => 'investasi',
            'amount' => 2000000,
        ])
        ->assertSessionHasErrors('category');
});

test('income transaction can be recorded', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_INCOME,
            'date' => '2026-08-18',
            'name' => 'Uang penjualan',
            'amount' => 1000000,
        ])
        ->assertRedirect();

    $transaction = $business->transactions()->first();

    expect($transaction->type)->toBe(BusinessTransaction::TYPE_INCOME);
    expect((float) $transaction->amount)->toBe(1000000.0);
});

test('users cannot add transactions to another users business', function () {
    $owner = User::factory()->create();
    $business = Business::factory()->for($owner)->create();

    $this->actingAs(User::factory()->create())
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_INCOME,
            'date' => '2026-08-18',
            'name' => 'Pendapatan',
            'amount' => 100000,
        ])
        ->assertForbidden();
});

test('transaction can be updated and deleted by the owner', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();
    $transaction = BusinessTransaction::factory()->for($business)->create([
        'type' => BusinessTransaction::TYPE_EXPENSE_SMALL,
        'category' => BusinessTransaction::CATEGORY_OPERATIONAL,
        'name' => 'Isi token',
        'amount' => 100000,
    ]);

    $this->actingAs($user)
        ->patch(route('business-transactions.update', $transaction), [
            'amount' => 250000,
            'category' => BusinessTransaction::CATEGORY_RAW_MATERIAL,
        ])
        ->assertRedirect();

    $transaction->refresh();

    expect((float) $transaction->amount)->toBe(250000.0);
    expect($transaction->category)->toBe(BusinessTransaction::CATEGORY_RAW_MATERIAL);

    $this->actingAs($user)
        ->delete(route('business-transactions.destroy', $transaction))
        ->assertRedirect();

    expect(BusinessTransaction::find($transaction->id))->toBeNull();
});

test('users cannot update another users transaction', function () {
    $owner = User::factory()->create();
    $business = Business::factory()->for($owner)->create();
    $transaction = BusinessTransaction::factory()->for($business)->create();

    $this->actingAs(User::factory()->create())
        ->patch(route('business-transactions.update', $transaction), ['amount' => 1])
        ->assertForbidden();
});

test('pre-operational amount creates an additional expense transaction', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
            'date' => '2026-08-17',
            'name' => 'Modal awal',
            'amount' => 5000000,
            'pre_operational_amount' => 700000,
        ])
        ->assertRedirect();

    $transactions = $business->transactions()->orderBy('id')->get();

    expect($transactions)->toHaveCount(2);
    expect($transactions[0]->type)->toBe(BusinessTransaction::TYPE_INITIAL_CAPITAL);
    expect((float) $transactions[0]->amount)->toBe(5000000.0);

    expect($transactions[1]->type)->toBe(BusinessTransaction::TYPE_EXPENSE_BIG);
    expect($transactions[1]->category)->toBe(BusinessTransaction::CATEGORY_PRE_OPERATIONAL);
    expect($transactions[1]->name)->toBe('Modal pra-operasional');
    expect((float) $transactions[1]->amount)->toBe(700000.0);
    expect($transactions[1]->date->toDateString())->toBe('2026-08-17');
});

test('pre-operational amount is optional when recording initial capital', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
            'date' => '2026-08-17',
            'name' => 'Modal awal',
            'amount' => 5000000,
        ])
        ->assertRedirect();

    expect($business->transactions()->count())->toBe(1);
});

test('pre-operational amount is rejected outside initial capital', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('business-transactions.store', $business), [
            'type' => BusinessTransaction::TYPE_INCOME,
            'date' => '2026-08-18',
            'name' => 'Pendapatan',
            'amount' => 100000,
            'pre_operational_amount' => 50000,
        ])
        ->assertSessionHasErrors('pre_operational_amount');
});
