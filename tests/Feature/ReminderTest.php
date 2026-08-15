<?php

use App\Models\Reminder;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('reminders.index'))->assertRedirect(route('login'));
    $this->get(route('reminders.due'))->assertRedirect(route('login'));
});

test('authenticated users can list their reminders', function () {
    $user = User::factory()->create();
    Reminder::factory()->count(3)->for($user)->create();

    $this->actingAs($user)
        ->get(route('reminders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reminders/index')
            ->has('reminders.data', 3));
});

test('reminders can be searched and filtered by status', function () {
    $user = User::factory()->create();
    Reminder::factory()->for($user)->create(['title' => 'Minum obat', 'remind_at' => now()->addDay()]);
    Reminder::factory()->for($user)->create(['title' => 'Rapat tim', 'remind_at' => now()->addDay(), 'done_at' => now()]);
    Reminder::factory()->for($user)->create(['title' => 'Bayar tagihan', 'remind_at' => now()->subDay()]);

    $this->actingAs($user);

    $this->get(route('reminders.index', ['search' => 'obat']))
        ->assertInertia(fn ($page) => $page
            ->has('reminders.data', 1)
            ->where('reminders.data.0.title', 'Minum obat')
            ->where('filters.search', 'obat'));

    $this->get(route('reminders.index', ['status' => 'done']))
        ->assertInertia(fn ($page) => $page
            ->has('reminders.data', 1)
            ->where('reminders.data.0.title', 'Rapat tim'));

    $this->get(route('reminders.index', ['status' => 'overdue']))
        ->assertInertia(fn ($page) => $page
            ->has('reminders.data', 1)
            ->where('reminders.data.0.title', 'Bayar tagihan'));

    $this->get(route('reminders.index', ['sort' => 'title', 'dir' => 'asc']))
        ->assertInertia(fn ($page) => $page
            ->where('reminders.data.0.title', 'Bayar tagihan'));
});

test('users can create a reminder', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('reminders.store'), [
            'title' => 'Minum obat',
            'body' => 'Jangan lupa',
            'remind_at' => now()->addHour()->format('Y-m-d H:i'),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('reminders', [
        'user_id' => $user->id,
        'title' => 'Minum obat',
    ]);
});

test('reminder validation requires title and a future remind_at', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('reminders.store'), [
            'title' => '',
            'remind_at' => now()->subDay()->format('Y-m-d H:i'),
        ])
        ->assertSessionHasErrors(['title', 'remind_at']);

    $this->actingAs($user)
        ->post(route('reminders.store'), [
            'title' => 'Tanpa waktu',
        ])
        ->assertSessionHasErrors(['remind_at']);
});

test('users cannot see or modify reminders of other users', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $reminder = Reminder::factory()->for($other)->create();

    $this->actingAs($user);
    $this->patch(route('reminders.update', $reminder), ['title' => 'Hacked'])->assertForbidden();
    $this->patch(route('reminders.done', $reminder))->assertForbidden();
    $this->delete(route('reminders.destroy', $reminder))->assertForbidden();

    expect($reminder->fresh()->title)->not->toBe('Hacked');
});

test('due endpoint only returns due reminders of the user', function () {
    $user = User::factory()->create();
    Reminder::factory()->for($user)->create(['remind_at' => now()->subMinute()]);
    $future = Reminder::factory()->for($user)->create(['remind_at' => now()->addDay()]);
    Reminder::factory()->for($user)->create(['remind_at' => now()->subMinute(), 'notified_at' => now()]);

    $response = $this->actingAs($user)->getJson(route('reminders.due'))->assertOk();

    expect($response->json())->toHaveCount(1)
        ->and($response->json('0.id'))->not->toBe($future->id);
});

test('notified endpoint marks a reminder as notified', function () {
    $user = User::factory()->create();
    $reminder = Reminder::factory()->for($user)->create(['remind_at' => now()->subMinute()]);

    $this->actingAs($user)
        ->post(route('reminders.notified', $reminder))
        ->assertRedirect();

    expect($reminder->fresh()->notified_at)->not->toBeNull();
});

test('done endpoint marks a reminder as done', function () {
    $user = User::factory()->create();
    $reminder = Reminder::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('reminders.done', $reminder))
        ->assertRedirect();

    expect($reminder->fresh()->done_at)->not->toBeNull()
        ->and($reminder->fresh()->notified_at)->not->toBeNull();
});
