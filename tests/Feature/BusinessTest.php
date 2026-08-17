<?php

use App\Models\Business;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('businesses.index'))->assertRedirect(route('login'));
});

test('authenticated users can view their businesses', function () {
    $user = User::factory()->create();
    Business::factory()->count(2)->for($user)->create();

    $this->actingAs($user)
        ->get(route('businesses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('businesses/index')
            ->has('businesses', 2));
});

test('users only see their own businesses', function () {
    $other = User::factory()->create();
    Business::factory()->for($other)->create();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('businesses.index'))
        ->assertInertia(fn ($page) => $page->has('businesses', 0));
});

test('business can be created with a preset formula', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('businesses.store'), [
            'name' => 'Warung Sederhana',
            'rekap_period' => Business::PERIOD_WEEKLY,
            'period_start' => '2026-08-17',
            'formula_type' => Business::FORMULA_FB_A,
        ])
        ->assertRedirect();

    $business = $user->businesses()->first();

    expect($business)->not->toBeNull();
    expect($business->name)->toBe('Warung Sederhana');
    expect((float) $business->raw_material_pct)->toBe(40.0);
    expect((float) $business->profit_pct)->toBe(20.0);
});

test('business can be created with a custom formula', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('businesses.store'), [
            'name' => 'Katering',
            'rekap_period' => Business::PERIOD_MONTHLY,
            'period_start' => '2026-08-01',
            'formula_type' => Business::FORMULA_CUSTOM,
            'raw_material_pct' => 35,
            'operational_pct' => 35,
            'marketing_pct' => 10,
            'profit_pct' => 20,
        ])
        ->assertRedirect();

    $business = $user->businesses()->first();

    expect((float) $business->marketing_pct)->toBe(10.0);
});

test('custom formula must total 100 percent', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('businesses.store'), [
            'name' => 'Katering',
            'rekap_period' => Business::PERIOD_MONTHLY,
            'period_start' => '2026-08-01',
            'formula_type' => Business::FORMULA_CUSTOM,
            'raw_material_pct' => 30,
            'operational_pct' => 30,
            'marketing_pct' => 10,
            'profit_pct' => 20,
        ])
        ->assertSessionHasErrors('profit_pct');
});

test('business name is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('businesses.store'), [
            'rekap_period' => Business::PERIOD_WEEKLY,
            'period_start' => '2026-08-17',
            'formula_type' => Business::FORMULA_FB_A,
        ])
        ->assertSessionHasErrors('name');
});

test('rekap period must be valid', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('businesses.store'), [
            'name' => 'Warung',
            'rekap_period' => 'hourly',
            'period_start' => '2026-08-17',
            'formula_type' => Business::FORMULA_FB_A,
        ])
        ->assertSessionHasErrors('rekap_period');
});

test('users cannot view another users business', function () {
    $owner = User::factory()->create();
    $business = Business::factory()->for($owner)->create();

    $this->actingAs(User::factory()->create())
        ->get(route('businesses.show', $business))
        ->assertForbidden();
});

test('users cannot delete another users business', function () {
    $owner = User::factory()->create();
    $business = Business::factory()->for($owner)->create();

    $this->actingAs(User::factory()->create())
        ->delete(route('businesses.destroy', $business))
        ->assertForbidden();

    expect(Business::find($business->id))->not->toBeNull();
});

test('owner can delete their business', function () {
    $owner = User::factory()->create();
    $business = Business::factory()->for($owner)->create();

    $this->actingAs($owner)
        ->delete(route('businesses.destroy', $business))
        ->assertRedirect(route('businesses.index'));

    expect(Business::find($business->id))->toBeNull();
});

test('show page renders ledger and lr data', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $this->actingAs($user)
        ->get(route('businesses.show', $business))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('businesses/show')
            ->has('business')
            ->has('ledger')
            ->has('periods')
            ->has('lr')
            ->has('lr_chart'));
});