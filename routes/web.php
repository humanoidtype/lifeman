<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\BusinessTransactionController;
use App\Http\Controllers\CashflowController;
use App\Http\Controllers\CashflowItemController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\SavingsPaymentController;
use App\Models\Cashflow;
use App\Models\Reminder;
use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : Inertia::render('welcome');
})->name('home');

Route::get('/diagnose-assets', function () {
    $manifestPath = public_path('build/manifest.json');

    if (! is_file($manifestPath)) {
        return response()->json(['entry' => null, 'total' => 0, 'missing' => [], 'ok' => false]);
    }

    $manifest = json_decode((string) file_get_contents($manifestPath), true) ?: [];
    $missing = [];

    foreach ($manifest as $chunk) {
        $file = $chunk['file'] ?? null;

        if ($file !== null && ! is_file(public_path('build/'.$file))) {
            $missing[] = $file;
        }
    }

    return response()->json([
        'entry' => $manifest['resources/js/app.tsx']['file'] ?? null,
        'total' => count($manifest),
        'missing' => $missing,
        'ok' => $missing === [],
    ]);
})->name('diagnose-assets');

Route::get('/app/update-check', function () {
    $response = Cache::remember('update-check', 600, function () {
        $response = Http::timeout(8)
            ->withHeaders([
                'Accept' => 'application/vnd.github+json',
                'User-Agent' => 'LifeMan/1.0',
            ])
            ->get('https://api.github.com/repos/humanoidtype/lifeman/releases/latest');

        if ($response->failed()) {
            return ['error' => 'HTTP '.$response->status()];
        }

        $data = $response->json();
        $release = is_array($data) ? $data : [];
        $downloadUrl = null;

        foreach ($release['assets'] ?? [] as $asset) {
            if (
                is_array($asset)
                && str_ends_with((string) ($asset['name'] ?? ''), '.apk')
            ) {
                $downloadUrl = $asset['browser_download_url'] ?? null;

                break;
            }
        }

        return [
            'tag_name' => $release['tag_name'] ?? null,
            'body' => $release['body'] ?? null,
            'html_url' => $release['html_url'] ?? null,
            'download_url' => $downloadUrl,
        ];
    });

    if (isset($response['error'])) {
        return response()->json($response, 502);
    }

    return response()->json($response);
})->name('update-check');

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

    Route::get('personal', fn () => Inertia::render('personal/index'))->name('personal.index');

    Route::resource('businesses', BusinessController::class)->except(['edit']);
    Route::post('businesses/{business}/transactions', [BusinessTransactionController::class, 'store'])->name('business-transactions.store');
    Route::post('businesses/{business}/close', [BusinessController::class, 'close'])->name('businesses.close');
    Route::patch('business-transactions/{business_transaction}', [BusinessTransactionController::class, 'update'])->name('business-transactions.update');
    Route::delete('business-transactions/{business_transaction}', [BusinessTransactionController::class, 'destroy'])->name('business-transactions.destroy');
});

require __DIR__.'/settings.php';
