<?php

use Illuminate\Http\Response;

beforeEach(function () {
    config([
        'app.web_access_allowed' => false,
        'app.web_redirect_url' => 'https://lxx.my.id',
    ]);
});

test('regular browsers are redirected to the landing page', function () {
    $this->get('/')->assertRedirect('https://lxx.my.id');
});

test('native app user agents can access the application', function () {
    $this->withHeader('User-Agent', 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile Safari/537.36 Capacitor/8.5.0')
        ->get('/')
        ->assertOk();
});

test('regular browsers are forbidden from JSON requests', function () {
    $this->getJson('/')
        ->assertStatus(Response::HTTP_FORBIDDEN);
});

test('access can be allowed for any user agent', function () {
    config(['app.web_access_allowed' => true]);

    $this->get('/')->assertOk();
});
