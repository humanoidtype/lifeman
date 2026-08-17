<?php

namespace App\Services;

use App\Models\Business;
use App\Models\BusinessTransaction;
use Carbon\CarbonInterface;

class BusinessPeriodService
{
    /**
     * The bounds of the rekap period that contains the given date.
     *
     * @return array{start: CarbonInterface, end: CarbonInterface}
     */
    public function periodBounds(Business $business, CarbonInterface $date): array
    {
        $day = $date->copy()->startOfDay();

        return match ($business->rekap_period) {
            Business::PERIOD_WEEKLY => $this->weeklyBounds($business, $day),
            Business::PERIOD_MONTHLY => [
                'start' => $day->copy()->startOfMonth(),
                'end' => $day->copy()->endOfMonth(),
            ],
            Business::PERIOD_YEARLY => [
                'start' => $day->copy()->startOfYear(),
                'end' => $day->copy()->endOfYear(),
            ],
            default => [
                'start' => $day->copy(),
                'end' => $day->copy(),
            ],
        };
    }

    /**
     * The bounds of the current (active) period.
     *
     * @return array{start: CarbonInterface, end: CarbonInterface}
     */
    public function currentPeriod(Business $business): array
    {
        return $this->periodBounds($business, now());
    }

    /**
     * All periods from the business' start until today, newest first.
     *
     * @return list<array{key: string, start: CarbonInterface, end: CarbonInterface, active: bool, completed: bool}>
     */
    public function periods(Business $business): array
    {
        $anchor = $business->period_start->copy()->startOfDay();
        $today = now()->startOfDay();

        $periods = [];
        $cursor = $anchor->copy();

        while ($cursor->lte($today)) {
            $end = match ($business->rekap_period) {
                Business::PERIOD_WEEKLY => $cursor->copy()->addDays(6),
                Business::PERIOD_MONTHLY => $cursor->copy()->endOfMonth(),
                Business::PERIOD_YEARLY => $cursor->copy()->endOfYear(),
                default => $cursor->copy(),
            };

            $periods[] = [
                'key' => $cursor->format('Y-m-d'),
                'start' => $cursor->copy(),
                'end' => $end,
                'active' => $end->gte($today),
                'completed' => $end->lt($today),
            ];

            $cursor = match ($business->rekap_period) {
                Business::PERIOD_WEEKLY => $cursor->addDays(7),
                Business::PERIOD_MONTHLY => $cursor->addMonth()->startOfMonth(),
                Business::PERIOD_YEARLY => $cursor->addYear()->startOfYear(),
                default => $cursor->addDay(),
            };
        }

        return array_reverse($periods);
    }

    /**
     * The ledger rows with running balance, grouped per day.
     *
     * @return array{rows: list<array<string, mixed>>, days: list<array<string, mixed>>}
     */
    public function ledger(Business $business): array
    {
        $transactions = $business->transactions()
            ->orderBy('date')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $balance = 0.0;
        $rows = [];
        $days = [];
        $dayTotals = [];

        foreach ($transactions as $transaction) {
            $dateKey = $transaction->date->format('Y-m-d');
            $amount = (float) $transaction->amount;
            $isExpense = $transaction->isExpense();

            if ($transaction->type === BusinessTransaction::TYPE_INITIAL_CAPITAL) {
                $income = $amount;
                $expense = 0.0;
            } elseif ($transaction->type === BusinessTransaction::TYPE_DAILY_MODAL) {
                $income = $amount;
                $expense = $amount;
            } elseif ($transaction->type === BusinessTransaction::TYPE_OPENING_BALANCE) {
                $income = $amount;
                $expense = 0.0;
            } elseif ($isExpense) {
                $income = 0.0;
                $expense = $amount;
            } else {
                $income = $amount;
                $expense = 0.0;
            }

            if ($transaction->type === BusinessTransaction::TYPE_OPENING_BALANCE) {
                // Continuity marker between kas sessions: shown as "masuk"
                // but net-zero on the running balance and day totals.
            } else {
                $balance += $income - $expense;

                $dayTotals[$dateKey] ??= ['income' => 0.0, 'expense' => 0.0, 'balance' => 0.0];
                $dayTotals[$dateKey]['income'] += $income;
                $dayTotals[$dateKey]['expense'] += $expense;
                $dayTotals[$dateKey]['balance'] = $balance;
            }

            $rows[] = [
                'id' => $transaction->id,
                'date' => $transaction->date->format('Y-m-d'),
                'name' => $transaction->name,
                'type' => $transaction->type,
                'category' => $transaction->category,
                'income' => $income,
                'expense' => $expense,
                'balance' => round($balance, 2),
            ];
        }

        foreach ($dayTotals as $dateKey => $totals) {
            $days[] = [
                'date' => $dateKey,
                'income' => round($totals['income'], 2),
                'expense' => round($totals['expense'], 2),
                'balance' => round($totals['balance'], 2),
            ];
        }

        return ['rows' => $rows, 'days' => $days];
    }

    /**
     * The daily closing balances for the cash flow chart.
     *
     * @return list<array{date: string, balance: float}>
     */
    public function dailyBalances(Business $business, int $days = 30): array
    {
        $ledger = $this->ledger($business);
        $balances = [];

        foreach ($ledger['days'] as $day) {
            $balances[$day['date']] = $day['balance'];
        }

        $result = [];
        $from = now()->startOfDay()->subDays($days - 1);

        foreach ($balances as $date => $balance) {
            if ($date >= $from->format('Y-m-d')) {
                $result[] = ['date' => $date, 'balance' => $balance];
            }
        }

        return $result;
    }

    /**
     * The current closing balance of the kas (all rows up to today).
     */
    public function closingBalance(Business $business, CarbonInterface $today): float
    {
        $balance = 0.0;

        foreach ($this->ledger($business)['rows'] as $row) {
            if ($row['date'] > $today->format('Y-m-d')) {
                break;
            }

            $balance = $row['balance'];
        }

        return $balance;
    }

    /**
     * The date the current kas session was opened (last opening balance or initial capital).
     */
    public function kasOpenedAt(Business $business): ?string
    {
        $transactions = $business->transactions()
            ->whereIn('type', [
                BusinessTransaction::TYPE_OPENING_BALANCE,
                BusinessTransaction::TYPE_INITIAL_CAPITAL,
            ])
            ->orderByDesc('date')
            ->first();

        return $transactions?->date->format('Y-m-d');
    }

    /**
     * The L/R calculation for a period compared against the business formula.
     *
     * @param  array{start: CarbonInterface, end: CarbonInterface}  $period
     * @return array<string, mixed>
     */
    public function lr(Business $business, array $period): array
    {
        $start = $period['start']->copy()->startOfDay();
        $end = $period['end']->copy()->endOfDay();

        $transactions = $business->transactions()
            ->whereBetween('date', [$start, $end])
            ->get();

        $income = 0.0;
        $categories = [
            BusinessTransaction::CATEGORY_RAW_MATERIAL => 0.0,
            BusinessTransaction::CATEGORY_OPERATIONAL => 0.0,
            BusinessTransaction::CATEGORY_MARKETING => 0.0,
            BusinessTransaction::CATEGORY_PRE_OPERATIONAL => 0.0,
        ];

        foreach ($transactions as $transaction) {
            if ($transaction->type === BusinessTransaction::TYPE_INCOME) {
                $income += (float) $transaction->amount;
            } elseif ($transaction->isExpense() && $transaction->category) {
                $categories[$transaction->category] += (float) $transaction->amount;
            }
        }

        $totalExpense = array_sum($categories);
        $profit = $income - $totalExpense;
        $formula = $business->formulaPercentages();

        $analysis = [];

        if ($income <= 0) {
            $analysis[] = 'Belum ada pendapatan di periode ini, analisis L/R belum dapat dihitung.';
        } else {
            $comparisons = [
                'raw_material' => ['label' => 'Bahan baku', 'expected' => $formula['raw_material'], 'hint' => 'pertimbangkan negosiasi harga supplier atau kurangi pemborosan bahan'],
                'operational' => ['label' => 'Operasional', 'expected' => $formula['operational'], 'hint' => 'evaluasi kembali biaya operasional harian'],
                'marketing' => ['label' => 'Marketing', 'expected' => $formula['marketing'], 'hint' => 'ukur efektivitas promosi sebelum menambah anggaran'],
            ];

            foreach ($comparisons as $key => $meta) {
                $actualPct = ($categories[$key] / $income) * 100;
                $diff = $actualPct - $meta['expected'];

                if (abs($diff) <= 2) {
                    $analysis[] = "{$meta['label']} {$this->pct($actualPct)} sesuai rumus {$this->pct($meta['expected'])}.";
                } elseif ($diff > 0) {
                    $analysis[] = "{$meta['label']} {$this->pct($actualPct)} melebihi rumus {$this->pct($meta['expected'])} (+{$this->pct($diff)}) — {$meta['hint']}.";
                } else {
                    $analysis[] = "{$meta['label']} {$this->pct($actualPct)} di bawah rumus {$this->pct($meta['expected'])} ({$this->pct($diff)}).";
                }
            }

            $profitPct = $income > 0 ? ($profit / $income) * 100 : 0;
            $diffProfit = $profitPct - $formula['profit'];

            if ($profit >= 0 && $diffProfit >= -2) {
                $analysis[] = "Laba {$this->pct($profitPct)} sesuai/mencapai target rumus {$this->pct($formula['profit'])}.";
            } elseif ($profit >= 0) {
                $analysis[] = "Laba {$this->pct($profitPct)} di bawah target rumus {$this->pct($formula['profit'])} ({$this->pct($diffProfit)}) — tinjau kembali kategori yang melebihi rumus.";
            } else {
                $analysis[] = 'Periode ini mengalami rugi Rp '.number_format(abs($profit), 0, ',', '.').' — segera evaluasi pendapatan dan pengeluaran.';
            }
        }

        return [
            'start' => $start->format('Y-m-d'),
            'end' => $end->format('Y-m-d'),
            'income' => round($income, 2),
            'expenses' => [
                'raw_material' => round($categories[BusinessTransaction::CATEGORY_RAW_MATERIAL], 2),
                'operational' => round($categories[BusinessTransaction::CATEGORY_OPERATIONAL], 2),
                'marketing' => round($categories[BusinessTransaction::CATEGORY_MARKETING], 2),
                'pre_operational' => round($categories[BusinessTransaction::CATEGORY_PRE_OPERATIONAL], 2),
            ],
            'total_expense' => round($totalExpense, 2),
            'profit' => round($profit, 2),
            'formula' => $formula,
            'analysis' => $analysis,
        ];
    }

    /**
     * Per-period profit for the L/R chart, newest first.
     *
     * @return list<array{key: string, start: string, end: string, profit: float, target_profit: float, income: float}>
     */
    public function lrChart(Business $business): array
    {
        $chart = [];

        foreach ($this->periods($business) as $period) {
            $lr = $this->lr($business, $period);
            $targetProfit = $lr['income'] > 0
                ? $lr['income'] * ((float) $business->formulaPercentages()['profit'] / 100)
                : 0.0;

            $chart[] = [
                'key' => $period['key'],
                'start' => $period['start']->format('Y-m-d'),
                'end' => $period['end']->format('Y-m-d'),
                'profit' => $lr['profit'],
                'target_profit' => round($targetProfit, 2),
                'income' => $lr['income'],
            ];
        }

        return $chart;
    }

    /**
     * @return array{start: CarbonInterface, end: CarbonInterface}
     */
    private function weeklyBounds(Business $business, CarbonInterface $day): array
    {
        $anchor = $business->period_start->copy()->startOfDay();
        $daysFromAnchor = (int) $anchor->diffInDays($day);
        $weekIndex = (int) floor($daysFromAnchor / 7);
        $start = $anchor->copy()->addDays($weekIndex * 7);

        return [
            'start' => $start,
            'end' => $start->copy()->addDays(6),
        ];
    }

    private function pct(float $value): string
    {
        return number_format($value, 1).'%';
    }
}
