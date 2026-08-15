<?php

use App\Models\Cashflow;
use App\Models\CashflowItem;
use App\Models\User;

test('users can create a cashflow', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('cashflows.store'), [
            'title' => 'Bulan Agustus',
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'notes' => 'Catatan bulanan.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('cashflows', [
        'user_id' => $user->id,
        'title' => 'Bulan Agustus',
    ]);
});

test('cashflow validation requires title and valid period', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('cashflows.store'), [
            'title' => '',
            'period_start' => now()->addDay()->toDateString(),
            'period_end' => now()->toDateString(),
        ])
        ->assertSessionHasErrors(['title', 'period_end']);
});

test('users can view only their own cashflow', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $cashflow = Cashflow::factory()->for($other)->create();

    $this->actingAs($user)
        ->get(route('cashflows.show', $cashflow))
        ->assertForbidden();
});

test('cashflow index shows totals per type', function () {
    $user = User::factory()->create();
    $cashflow = Cashflow::factory()->for($user)->create();
    CashflowItem::factory()->for($cashflow)->income()->create(['amount' => 1_000_000]);
    CashflowItem::factory()->for($cashflow)->expense()->create(['amount' => 300_000]);
    CashflowItem::factory()->for($cashflow)->expense()->create(['amount' => 200_000]);

    $this->actingAs($user)
        ->get(route('cashflows.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cashflows/index')
            ->has('cashflows.data', 1)
            ->where('cashflows.data.0.income_total', 1000000)
            ->where('cashflows.data.0.expense_total', 500000));
});

test('cashflows can be searched and sorted', function () {
    $user = User::factory()->create();
    $agustus = Cashflow::factory()->for($user)->create(['title' => 'Bulan Agustus']);
    Cashflow::factory()->for($user)->create(['title' => 'Bulan September']);

    $this->actingAs($user);

    $this->get(route('cashflows.index', ['search' => 'Agustus']))
        ->assertInertia(fn ($page) => $page
            ->has('cashflows.data', 1)
            ->where('cashflows.data.0.title', 'Bulan Agustus')
            ->where('filters.search', 'Agustus'));

    $this->get(route('cashflows.index', ['sort' => 'oldest']))
        ->assertInertia(fn ($page) => $page
            ->where('cashflows.data.0.id', $agustus->id)
            ->where('filters.sort', 'oldest'));
});

test('users can update and delete their own cashflow only', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $cashflow = Cashflow::factory()->for($user)->create();
    $otherCashflow = Cashflow::factory()->for($other)->create();

    $this->actingAs($user);
    $this->patch(route('cashflows.update', $cashflow), ['title' => 'Diubah'])->assertRedirect();
    $this->patch(route('cashflows.update', $otherCashflow), ['title' => 'X'])->assertForbidden();
    $this->delete(route('cashflows.destroy', $cashflow))->assertRedirect();
    $this->delete(route('cashflows.destroy', $otherCashflow))->assertForbidden();

    expect(Cashflow::find($cashflow->id))->toBeNull()
        ->and(Cashflow::find($otherCashflow->id))->not->toBeNull();
});
