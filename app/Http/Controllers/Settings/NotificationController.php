<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\NotificationUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Show the user's notification settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/notifications');
    }

    /**
     * Update the user's notification settings.
     */
    public function update(NotificationUpdateRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notification settings updated.')]);

        return to_route('notifications.edit');
    }
}
