<?php

use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\SavingsPaymentController;
use App\Models\Reminder;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'stats' => [
                'pendingReminders' => Reminder::query()->whereBelongsTo(auth()->user())->pending()->count(),
                'activeGoals' => SavingsGoal::query()->whereBelongsTo(auth()->user())->active()->count(),
                'savedAmount' => (float) SavingsGoal::query()
                    ->whereBelongsTo(auth()->user())
                    ->withSum('payments as paid_amount', 'amount')
                    ->get()
                    ->sum('paid_amount'),
            ],
        ]);
    })->name('dashboard');

    Route::get('reminders/due', [ReminderController::class, 'due'])->name('reminders.due');
    Route::get('reminders/upcoming', [ReminderController::class, 'upcoming'])->name('reminders.upcoming');
    Route::post('reminders/{reminder}/notified', [ReminderController::class, 'notified'])->name('reminders.notified');
    Route::patch('reminders/{reminder}/done', [ReminderController::class, 'done'])->name('reminders.done');
    Route::resource('reminders', ReminderController::class)->except(['edit', 'create']);

    Route::resource('savings-goals', SavingsGoalController::class)->except(['edit', 'create']);
    Route::post('savings-goals/{savings_goal}/payments', [SavingsPaymentController::class, 'store'])->name('savings-payments.store');
    Route::delete('savings-payments/{savings_payment}', [SavingsPaymentController::class, 'destroy'])->name('savings-payments.destroy');
});

require __DIR__.'/settings.php';
