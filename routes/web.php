<?php

use App\Http\Controllers\CashflowController;
use App\Http\Controllers\CashflowItemController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\SavingsPaymentController;
use App\Models\Cashflow;
use App\Models\Reminder;
use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();

        $latestCashflow = Cashflow::query()
            ->whereBelongsTo($user)
            ->withSum(['items as income_total' => fn ($query) => $query->income()], 'amount')
            ->withSum(['items as expense_total' => fn ($query) => $query->expense()], 'amount')
            ->latest()
            ->first();

        $goalsProgress = SavingsGoal::query()
            ->whereBelongsTo($user)
            ->withSum('payments as paid_amount', 'amount')
            ->get()
            ->map(fn (SavingsGoal $goal) => [
                'id' => $goal->id,
                'title' => $goal->title,
                'paid' => (float) $goal->paid_amount,
                'target' => (float) $goal->target_amount,
                'percent' => $goal->target_amount > 0
                    ? min(round(((float) $goal->paid_amount / (float) $goal->target_amount) * 100, 1), 100)
                    : 0,
            ])
            ->sortByDesc('percent')
            ->take(6)
            ->values();

        $monthlySavings = collect(range(5, 0))->map(function (int $i) use ($user) {
            $start = now()->subMonths($i)->startOfMonth();
            $end = now()->subMonths($i)->endOfMonth();

            $total = SavingsPayment::query()
                ->whereHas('savingsGoal', fn ($query) => $query->whereBelongsTo($user))
                ->whereBetween('paid_at', [$start->toDateString(), $end->toDateString()])
                ->sum('amount');

            return [
                'month' => $start->format('Y-m'),
                'amount' => (float) $total,
            ];
        });

        $remindersCompleted = collect(range(7, 0))->map(function (int $i) use ($user) {
            $start = now()->subWeeks($i)->startOfWeek();
            $end = now()->subWeeks($i)->endOfWeek();

            $count = Reminder::query()
                ->whereBelongsTo($user)
                ->whereNotNull('done_at')
                ->whereBetween('done_at', [$start, $end])
                ->count();

            return [
                'week' => $start->toDateString(),
                'count' => $count,
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => [
                'pendingReminders' => Reminder::query()->whereBelongsTo($user)->pending()->count(),
                'overdueReminders' => Reminder::query()->whereBelongsTo($user)->overdue()->count(),
                'activeGoals' => SavingsGoal::query()->whereBelongsTo($user)->active()->count(),
                'savedAmount' => (float) SavingsGoal::query()
                    ->whereBelongsTo($user)
                    ->withSum('payments as paid_amount', 'amount')
                    ->get()
                    ->sum('paid_amount'),
                'latestCashflow' => $latestCashflow
                    ? [
                        'title' => $latestCashflow->title,
                        'incomeTotal' => (float) $latestCashflow->income_total,
                        'expenseTotal' => (float) $latestCashflow->expense_total,
                    ]
                    : null,
            ],
            'charts' => [
                'goalsProgress' => $goalsProgress,
                'monthlySavings' => $monthlySavings,
                'remindersCompleted' => $remindersCompleted,
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
    Route::patch('savings-payments/{savings_payment}', [SavingsPaymentController::class, 'update'])->name('savings-payments.update');
    Route::delete('savings-payments/{savings_payment}', [SavingsPaymentController::class, 'destroy'])->name('savings-payments.destroy');

    Route::resource('cashflows', CashflowController::class)->except(['edit', 'create']);
    Route::post('cashflows/{cashflow}/items', [CashflowItemController::class, 'store'])->name('cashflow-items.store');
    Route::patch('cashflow-items/{cashflow_item}', [CashflowItemController::class, 'update'])->name('cashflow-items.update');
    Route::delete('cashflow-items/{cashflow_item}', [CashflowItemController::class, 'destroy'])->name('cashflow-items.destroy');
});

require __DIR__.'/settings.php';
