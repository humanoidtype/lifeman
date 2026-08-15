<?php

namespace Database\Seeders;

use App\Models\Cashflow;
use App\Models\CashflowItem;
use App\Models\Reminder;
use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        if (Reminder::query()->where('user_id', $user->id)->exists()) {
            return;
        }

        Reminder::create([
            'user_id' => $user->id,
            'title' => 'Minum air putih',
            'body' => 'Jangan lupa hidrasi, ya!',
            'remind_at' => now()->subMinutes(5),
        ]);

        Reminder::create([
            'user_id' => $user->id,
            'title' => 'Rapat tim sore',
            'body' => 'Siapkan bahan meeting.',
            'remind_at' => now()->addHours(3),
        ]);

        Reminder::create([
            'user_id' => $user->id,
            'title' => 'Kerjakan laporan bulanan',
            'body' => 'Serahkan sebelum hari Jumat.',
            'remind_at' => now()->endOfDay(),
        ]);

        $hp = SavingsGoal::create([
            'user_id' => $user->id,
            'title' => 'Ganti HP Baru',
            'target_amount' => 5_000_000,
            'start_date' => now()->subDays(30)->toDateString(),
            'end_date' => now()->addDays(60)->toDateString(),
            'notes' => 'Tabungan DP HP baru.',
        ]);

        $this->payment($hp, 500_000, now()->subDays(30));
        $this->payment($hp, 400_000, now()->subDays(20));
        $this->payment($hp, 1_100_000, now()->subDays(10));

        $dana = SavingsGoal::create([
            'user_id' => $user->id,
            'title' => 'Dana Darurat',
            'target_amount' => 2_000_000,
            'start_date' => now()->subDays(14)->toDateString(),
            'end_date' => now()->addMonths(6)->toDateString(),
            'notes' => 'Cicil tiap bulan.',
        ]);

        $this->payment($dana, 500_000, now()->subDays(7));

        $liburan = SavingsGoal::create([
            'user_id' => $user->id,
            'title' => 'Liburan Bali',
            'target_amount' => 3_000_000,
            'start_date' => now()->subMonths(2)->toDateString(),
            'end_date' => now()->subWeek()->toDateString(),
            'notes' => 'Terkumpul penuh.',
        ]);

        $this->payment($liburan, 1_000_000, now()->subMonths(2));
        $this->payment($liburan, 1_000_000, now()->subMonth()->addDays(3));
        $this->payment($liburan, 1_000_000, now()->subWeeks(2));

        $kas = Cashflow::create([
            'user_id' => $user->id,
            'title' => 'Bulan '.now()->format('F Y'),
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'notes' => 'Catatan keuangan bulan berjalan.',
        ]);

        $this->item($kas, CashflowItem::TYPE_INCOME, 'Gaji bulanan', 4_500_000, 1);
        $this->item($kas, CashflowItem::TYPE_EXPENSE, 'Kos', 750_000, 1);
        $this->item($kas, CashflowItem::TYPE_EXPENSE, 'Kebutuhan bulanan', 850_000, 1);
        $this->item($kas, CashflowItem::TYPE_EXPENSE, 'Bensin motor', 100_000, 2);
        $this->item($kas, CashflowItem::TYPE_EXPENSE, 'Wifi & pulsa', 300_000, 1);
    }

    private function payment(SavingsGoal $goal, int $amount, CarbonInterface $paidAt): void
    {
        SavingsPayment::create([
            'savings_goal_id' => $goal->id,
            'amount' => $amount,
            'paid_at' => $paidAt->toDateString(),
            'note' => null,
        ]);
    }

    private function item(Cashflow $cashflow, string $type, string $name, int $amount, int $quantity): void
    {
        CashflowItem::create([
            'cashflow_id' => $cashflow->id,
            'type' => $type,
            'name' => $name,
            'amount' => $amount,
            'quantity' => $quantity,
        ]);
    }
}
