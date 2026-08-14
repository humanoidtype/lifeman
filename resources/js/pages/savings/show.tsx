import { Head, router, useForm } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, formatMoney, formatPercent } from '@/lib/format';
import { cn, toUrl } from '@/lib/utils';
import { index } from '@/routes/savings-goals';
import {
    store as storePayment,
    destroy as destroyPayment,
} from '@/routes/savings-payments';
import type { SavingsGoal, SavingsPayment } from '@/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
);

type Props = {
    goal: SavingsGoal;
    payments: SavingsPayment[];
};

type PaymentForm = {
    amount: string;
    paid_at: string;
    note: string;
};

export default function SavingsShow({ goal, payments }: Props) {
    const paid = Number(goal.paid_amount ?? 0);
    const target = Number(goal.target_amount);
    const percent = target > 0 ? (paid / target) * 100 : 0;
    const reached = paid >= target;
    const remaining = Math.max(target - paid, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = goal.end_date ? new Date(`${goal.end_date}T00:00:00`) : null;
    const missed = !reached && end !== null && end.getTime() < today.getTime();
    const daysLeft = end
        ? Math.max(Math.ceil((end.getTime() - today.getTime()) / 86_400_000), 0)
        : 0;
    const perDay =
        !reached && !missed && end !== null && daysLeft > 0
            ? Math.ceil(remaining / daysLeft)
            : 0;

    const { data, setData, errors, processing, post, reset } =
        useForm<PaymentForm>({
            amount: '',
            paid_at: new Date().toISOString().slice(0, 10),
            note: '',
        });

    function addPayment(): void {
        post(toUrl(storePayment({ savings_goal: goal.id })), {
            onSuccess: () => reset(),
        });
    }

    function removePayment(payment: SavingsPayment): void {
        if (window.confirm(`Hapus cicilan ${formatMoney(payment.amount)}?`)) {
            router.delete(
                toUrl(destroyPayment({ savings_payment: payment.id })),
            );
        }
    }

    const sortedPayments = [...payments].sort(
        (a, b) => new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime(),
    );
    const chartData = sortedPayments.reduce<number[]>((acc, payment) => {
        const previous = acc.length > 0 ? acc[acc.length - 1] : 0;

        acc.push(previous + Number(payment.amount));

        return acc;
    }, []);
    const chartLabels = sortedPayments.map((payment) =>
        new Date(payment.paid_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
        }),
    );

    return (
        <>
            <Head title={goal.title} />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {goal.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pantau progress dan catat cicilanmu.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Target</CardDescription>
                            <CardTitle className="text-3xl">
                                {formatMoney(target)}
                            </CardTitle>
                            <CardDescription>
                                {formatDate(goal.start_date)} –{' '}
                                {formatDate(goal.end_date)}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Terkumpul</CardDescription>
                            <CardTitle className="text-3xl">
                                {formatMoney(paid)}
                            </CardTitle>
                            {reached ? (
                                <CardDescription className="font-medium text-emerald-600">
                                    Target tercapai, bagus!
                                </CardDescription>
                            ) : (
                                <CardDescription
                                    className={
                                        missed
                                            ? 'font-medium text-destructive'
                                            : undefined
                                    }
                                >
                                    {missed
                                        ? `Terlewat — kurang ${formatMoney(remaining)}`
                                        : `Kurang ${formatMoney(remaining)} lagi`}
                                </CardDescription>
                            )}
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardContent className="grid gap-3 p-5">
                        <div className="flex items-baseline justify-between text-sm">
                            <span className="font-semibold">
                                {formatPercent(percent)}
                            </span>
                            <span className="text-muted-foreground">
                                {formatMoney(paid)} dari {formatMoney(target)}
                            </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-700',
                                    reached
                                        ? 'bg-emerald-500'
                                        : missed
                                          ? 'bg-destructive'
                                          : 'bg-gradient-to-r from-primary to-primary/60',
                                )}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                        </div>

                        {!reached && perDay > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
                                <CalendarClock className="size-4 shrink-0 text-primary" />
                                <span>
                                    Butuh cicilan{' '}
                                    <span className="font-semibold text-foreground">
                                        ±{formatMoney(perDay)}
                                    </span>
                                    /hari ·{' '}
                                    <span className="font-semibold text-foreground">
                                        ±{formatMoney(perDay * 7)}
                                    </span>
                                    /minggu ·{' '}
                                    <span className="font-semibold text-foreground">
                                        ±{formatMoney(perDay * 30)}
                                    </span>
                                    /bulan sampai{' '}
                                    {goal.end_date && formatDate(goal.end_date)}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {sortedPayments.length > 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Progress Cicilan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Line
                                    data={{
                                        labels: chartLabels,
                                        datasets: [
                                            {
                                                label: 'Total terkumpul',
                                                data: chartData,
                                                borderColor:
                                                    'hsl(var(--primary))',
                                                backgroundColor:
                                                    'hsla(var(--primary) / 0.15)',
                                                fill: true,
                                                tension: 0.3,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                        },
                                        scales: {
                                            y: {
                                                ticks: {
                                                    callback: (value) =>
                                                        new Intl.NumberFormat(
                                                            'id-ID',
                                                            {
                                                                notation:
                                                                    'compact',
                                                            },
                                                        ).format(Number(value)),
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Catat Cicilan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
                        <div className="grid gap-2">
                            <Label htmlFor="payment-amount">Nominal</Label>
                            <Input
                                id="payment-amount"
                                type="number"
                                min="1"
                                inputMode="numeric"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                                placeholder="250000"
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">
                                    {errors.amount}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="payment-date">Tanggal</Label>
                            <Input
                                id="payment-date"
                                type="date"
                                value={data.paid_at}
                                onChange={(event) =>
                                    setData('paid_at', event.target.value)
                                }
                            />
                            {errors.paid_at && (
                                <p className="text-sm text-destructive">
                                    {errors.paid_at}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="payment-note">
                                Catatan (opsional)
                            </Label>
                            <Input
                                id="payment-note"
                                value={data.note}
                                onChange={(event) =>
                                    setData('note', event.target.value)
                                }
                                placeholder="Cicilan pertama"
                            />
                        </div>
                        <Button
                            onClick={addPayment}
                            disabled={processing}
                            className="self-end"
                        >
                            <Plus className="size-4" />
                            Catat
                        </Button>
                    </CardContent>
                </Card>

                {sortedPayments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Riwayat Cicilan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {[...sortedPayments].reverse().map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors duration-200 hover:bg-muted/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold">
                                            {formatMoney(payment.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.note &&
                                                `${payment.note} · `}
                                            {formatDate(payment.paid_at)}
                                        </p>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => removePayment(payment)}
                                    >
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

SavingsShow.layout = {
    breadcrumbs: [
        {
            title: 'Nabung',
            href: toUrl(index()),
        },
    ],
};
