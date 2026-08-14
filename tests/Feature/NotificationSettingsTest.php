<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('notifications.edit'))->assertRedirect(route('login'));
});

test('authenticated users can view notification settings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('notifications.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/notifications'));
});

test('users can update their notification sound', function () {
    $user = User::factory()->create(['notification_sound' => 'default']);

    $this->actingAs($user)
        ->put(route('notifications.update'), ['notification_sound' => 'chime'])
        ->assertRedirect(route('notifications.edit'));

    expect($user->fresh()->notification_sound)->toBe('chime');
});

test('notification sound must be a valid option', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('notifications.update'), ['notification_sound' => 'explosion.wav'])
        ->assertSessionHasErrors('notification_sound');

    expect($user->fresh()->notification_sound)->toBe('default');
});
