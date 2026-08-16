<?php

use App\Models\Cashflow;
use App\Models\CashflowItem;
use App\Models\User;

test('users can add items to their cashflow', function () {
    $user = User::factory()->create();
    $cashflow = Cashflow::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('cashflow-items.store', $cashflow), [
            'type' => CashflowItem::TYPE_EXPENSE,
            'name' => 'Bensin',
            'amount' => 50_000,
            'quantity' => 2,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('cashflow_items', [
        'cashflow_id' => $cashflow->id,
        'type' => 'expense',
        'name' => 'Bensin',
        'amount' => '50000.00',
        'quantity' => 2,
    ]);
});

test('income items default to quantity one', function () {
    $user = User::factory()->create();
    $cashflow = Cashflow::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('cashflow-items.store', $cashflow), [
            'type' => CashflowItem::TYPE_INCOME,
            'name' => 'Gaji',
            'amount' => 4_500_000,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('cashflow_items', [
        'cashflow_id' => $cashflow->id,
        'name' => 'Gaji',
        'quantity' => 1,
    ]);
});

test('cashflow item validation requires type, name, and amount', function () {
    $user = User::factory()->create();
    $cashflow = Cashflow::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('cashflow-items.store', $cashflow), ['type' => 'invalid'])
        ->assertSessionHasErrors(['type', 'name', 'amount']);
});

test('cashflow item store rejects missing type', function () {
    $user = User::factory()->create();
    $cashflow = Cashflow::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('cashflow-items.store', $cashflow), [
            'name' => 'Bensin',
            'amount' => 50_000,
            'quantity' => 1,
        ])
        ->assertSessionHasErrors('type');

    expect(CashflowItem::query()->where('cashflow_id', $cashflow->id)->count())->toBe(0);
});

test('users cannot add items to cashflows of other users', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $cashflow = Cashflow::factory()->for($other)->create();

    $this->actingAs($user)
        ->post(route('cashflow-items.store', $cashflow), [
            'type' => CashflowItem::TYPE_INCOME,
            'name' => 'Gaji',
            'amount' => 100_000,
        ])
        ->assertForbidden();
});

test('users can update and delete their own items but not others', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $item = CashflowItem::factory()->for(
        Cashflow::factory()->for($user)
    )->create();
    $otherItem = CashflowItem::factory()->for(
        Cashflow::factory()->for($other)
    )->create();

    $this->actingAs($user);
    $this->patch(route('cashflow-items.update', $item), ['name' => 'Diubah'])->assertRedirect();
    $this->patch(route('cashflow-items.update', $otherItem), ['name' => 'X'])->assertForbidden();
    $this->delete(route('cashflow-items.destroy', $item))->assertRedirect();
    $this->delete(route('cashflow-items.destroy', $otherItem))->assertForbidden();

    expect(CashflowItem::find($item->id))->toBeNull()
        ->and(CashflowItem::find($otherItem->id))->not->toBeNull();
});
