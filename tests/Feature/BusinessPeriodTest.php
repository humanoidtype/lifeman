<?php

use App\Models\Business;
use App\Models\BusinessTransaction;
use App\Models\User;
use App\Services\BusinessPeriodService;

beforeEach(function () {
    $this->service = new BusinessPeriodService;
});

test('weekly periods roll from the period start date', function () {
    $business = Business::factory()->create([
        'rekap_period' => Business::PERIOD_WEEKLY,
        'period_start' => '2026-08-17',
    ]);

    $bounds = $this->service->periodBounds($business, now()->parse('2026-08-19'));

    expect($bounds['start']->toDateString())->toBe('2026-08-17');
    expect($bounds['end']->toDateString())->toBe('2026-08-23');

    $bounds = $this->service->periodBounds($business, now()->parse('2026-08-24'));

    expect($bounds['start']->toDateString())->toBe('2026-08-24');
    expect($bounds['end']->toDateString())->toBe('2026-08-30');
});

test('monthly periods follow the calendar month', function () {
    $business = Business::factory()->create([
        'rekap_period' => Business::PERIOD_MONTHLY,
        'period_start' => '2026-08-17',
    ]);

    $bounds = $this->service->periodBounds($business, now()->parse('2026-08-19'));

    expect($bounds['start']->toDateString())->toBe('2026-08-01');
    expect($bounds['end']->toDateString())->toBe('2026-08-31');
});

test('yearly periods follow the calendar year', function () {
    $business = Business::factory()->create([
        'rekap_period' => Business::PERIOD_YEARLY,
        'period_start' => '2026-08-17',
    ]);

    $bounds = $this->service->periodBounds($business, now()->parse('2026-08-19'));

    expect($bounds['start']->toDateString())->toBe('2026-01-01');
    expect($bounds['end']->toDateString())->toBe('2026-12-31');
});

test('ledger keeps a running balance with daily modal as net zero', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $business->transactions()->create([
        'date' => '2026-08-17',
        'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
        'name' => 'Modal awal',
        'amount' => 50000000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_DAILY_MODAL,
        'name' => 'Modal harian',
        'amount' => 500000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_INCOME,
        'name' => 'Uang penjualan',
        'amount' => 1000000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_EXPENSE_SMALL,
        'name' => 'Belanja sayur',
        'category' => BusinessTransaction::CATEGORY_RAW_MATERIAL,
        'amount' => 150000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_EXPENSE_SMALL,
        'name' => 'Isi token listrik',
        'category' => BusinessTransaction::CATEGORY_OPERATIONAL,
        'amount' => 500000,
    ]);

    $ledger = $this->service->ledger($business);
    $rows = $ledger['rows'];

    expect($rows[0]['income'])->toBe(50000000.0);
    expect($rows[0]['balance'])->toBe(50000000.0);

    expect($rows[1]['income'])->toBe(500000.0);
    expect($rows[1]['expense'])->toBe(500000.0);
    expect($rows[1]['balance'])->toBe(50000000.0);

    expect($rows[2]['income'])->toBe(1000000.0);
    expect($rows[2]['balance'])->toBe(51000000.0);

    expect($rows[3]['expense'])->toBe(150000.0);
    expect($rows[3]['balance'])->toBe(50850000.0);

    expect($rows[4]['expense'])->toBe(500000.0);
    expect($rows[4]['balance'])->toBe(50350000.0);

    expect($ledger['days'])->toHaveCount(2);
    expect($ledger['days'][1]['balance'])->toBe(50350000.0);
});

test('lr compares actual percentages against the formula', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create([
        'formula_type' => Business::FORMULA_FB_A,
        'period_start' => '2026-08-01',
        'rekap_period' => Business::PERIOD_MONTHLY,
    ]);

    // Income 1.000.000
    $business->transactions()->create([
        'date' => '2026-08-10',
        'type' => BusinessTransaction::TYPE_INCOME,
        'name' => 'Pendapatan',
        'amount' => 1000000,
    ]);
    // Bahan baku 600.000 -> 60% (rumus 40%) -> melebihi
    $business->transactions()->create([
        'date' => '2026-08-11',
        'type' => BusinessTransaction::TYPE_EXPENSE_SMALL,
        'name' => 'Bahan',
        'category' => BusinessTransaction::CATEGORY_RAW_MATERIAL,
        'amount' => 600000,
    ]);
    // Operasional 350.000 -> 35% (rumus 35%) -> sesuai
    $business->transactions()->create([
        'date' => '2026-08-12',
        'type' => BusinessTransaction::TYPE_EXPENSE_BIG,
        'name' => 'Sewa',
        'category' => BusinessTransaction::CATEGORY_OPERATIONAL,
        'amount' => 350000,
    ]);

    $period = $this->service->periodBounds($business, now()->parse('2026-08-15'));
    $lr = $this->service->lr($business, $period);

    expect($lr['income'])->toBe(1000000.0);
    expect($lr['expenses']['raw_material'])->toBe(600000.0);
    expect($lr['profit'])->toBe(50000.0);

    $joined = implode(' ', $lr['analysis']);

    expect($joined)->toContain('Bahan baku');
    expect($joined)->toContain('melebihi rumus');
    expect($joined)->toContain('Operasional');
    expect($joined)->toContain('sesuai rumus');
});

test('lr warns when there is no income yet', function () {
    $business = Business::factory()->create();
    $period = $this->service->periodBounds($business, now()->parse('2026-08-19'));
    $lr = $this->service->lr($business, $period);

    expect($lr['income'])->toBe(0.0);
    expect($lr['analysis'][0])->toContain('Belum ada pendapatan');
});

test('lr reports a loss when expenses exceed income', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_INCOME,
        'name' => 'Pendapatan',
        'amount' => 100000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-19',
        'type' => BusinessTransaction::TYPE_EXPENSE_SMALL,
        'name' => 'Bahan',
        'category' => BusinessTransaction::CATEGORY_RAW_MATERIAL,
        'amount' => 120000,
    ]);

    $period = $this->service->periodBounds($business, now()->parse('2026-08-19'));
    $lr = $this->service->lr($business, $period);

    expect($lr['profit'])->toBe(-20000.0);
    expect(implode(' ', $lr['analysis']))->toContain('rugi');
});

test('daily balances expose closing balance per day', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $business->transactions()->create([
        'date' => now()->toDateString(),
        'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
        'name' => 'Modal awal',
        'amount' => 100000,
    ]);
    $business->transactions()->create([
        'date' => now()->toDateString(),
        'type' => BusinessTransaction::TYPE_INCOME,
        'name' => 'Pendapatan',
        'amount' => 50000,
    ]);

    $balances = $this->service->dailyBalances($business);

    expect($balances)->not->toBeEmpty();
    expect($balances[array_key_last($balances)]['balance'])->toBe(150000.0);
});

test('lr chart contains one entry per period', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create([
        'rekap_period' => Business::PERIOD_WEEKLY,
        'period_start' => now()->startOfDay()->subDays(14),
    ]);

    $chart = $this->service->lrChart($business);

    expect($chart)->toHaveCount(3);
    expect($chart[0])->toHaveKeys(['key', 'start', 'end', 'profit', 'target_profit', 'income']);
});

test('ledger and lr include pre-operational spending', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create([
        'formula_type' => Business::FORMULA_FB_A,
        'period_start' => '2026-08-01',
        'rekap_period' => Business::PERIOD_MONTHLY,
    ]);

    $business->transactions()->create([
        'date' => '2026-08-17',
        'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
        'name' => 'Modal awal',
        'amount' => 5000000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-17',
        'type' => BusinessTransaction::TYPE_EXPENSE_BIG,
        'name' => 'Modal pra-operasional',
        'category' => BusinessTransaction::CATEGORY_PRE_OPERATIONAL,
        'amount' => 700000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-20',
        'type' => BusinessTransaction::TYPE_INCOME,
        'name' => 'Pendapatan',
        'amount' => 2000000,
    ]);

    $ledger = $this->service->ledger($business);
    $rows = $ledger['rows'];

    expect($rows[0]['balance'])->toBe(5000000.0);
    expect($rows[1]['expense'])->toBe(700000.0);
    expect($rows[1]['balance'])->toBe(4300000.0);
    expect($rows[2]['balance'])->toBe(6300000.0);

    $period = $this->service->periodBounds($business, now()->parse('2026-08-25'));
    $lr = $this->service->lr($business, $period);

    expect($lr['expenses']['pre_operational'])->toBe(700000.0);
    expect($lr['total_expense'])->toBe(700000.0);
    expect($lr['profit'])->toBe(1300000.0);
});

test('ledger treats opening balance as a net-zero continuity marker', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();

    $business->transactions()->create([
        'date' => '2026-08-17',
        'type' => BusinessTransaction::TYPE_INITIAL_CAPITAL,
        'name' => 'Modal awal',
        'amount' => 1000000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_INCOME,
        'name' => 'Pendapatan',
        'amount' => 200000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_OPENING_BALANCE,
        'name' => 'Saldo awal kas',
        'amount' => 1200000,
    ]);
    $business->transactions()->create([
        'date' => '2026-08-18',
        'type' => BusinessTransaction::TYPE_EXPENSE_SMALL,
        'name' => 'Bahan',
        'category' => BusinessTransaction::CATEGORY_RAW_MATERIAL,
        'amount' => 100000,
    ]);

    $ledger = $this->service->ledger($business);
    $opening = collect($ledger['rows'])->firstWhere('type', BusinessTransaction::TYPE_OPENING_BALANCE);
    $last = collect($ledger['rows'])->last();

    expect($opening['income'])->toBe(1200000.0);
    expect($opening['balance'])->toBe(1200000.0);
    expect($last['balance'])->toBe(1100000.0);

    $day = collect($ledger['days'])->firstWhere('date', '2026-08-18');
    expect($day['income'])->toBe(200000.0);
    expect($day['expense'])->toBe(100000.0);
    expect($day['balance'])->toBe(1100000.0);
});
