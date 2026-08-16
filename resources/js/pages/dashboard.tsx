import { Head, Link } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import {
    AlarmClock,
    ArrowRight,
    PiggyBank,
    Target,
    Wallet,
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { NettoBadge } from '@/components/netto-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRefreshing } from '@/hooks/use-refreshing';
import { formatMoney } from '@/lib/format';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as cashflowsIndex } from '@/routes/cashflows';
import { index as remindersIndex } from '@/routes/reminders';
import { index as savingsIndex } from '@/routes/savings-goals';
import type { Auth } from '@/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
);

type Props = {
    auth: Auth;
    stats: {
        pendingReminders: number;
        overdueReminders: number;
        activeGoals: number;
        savedAmount: number;
        latestCashflow: {
            title: string;
            incomeTotal: number;
            expenseTotal: number;
        } | null;
    };
    charts: {
        goalsProgress: {
            id: number;
            title: string;
            paid: number;
            target: number;
            percent: number;
        }[];
        monthlySavings: { month: string; amount: number }[];
        remindersCompleted: { week: string; count: number }[];
    };
};

export default function Dashboard({ auth, stats, charts }: Props) {
    const firstName = auth.user.name.split(' ')[0];
    const { refreshing } = useRefreshing();
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const cashflowNetto = stats.latestCashflow
        ? stats.latestCashflow.incomeTotal - stats.latestCashflow.expenseTotal
        : 0;
    const hasSavings = charts.monthlySavings.some((entry) => entry.amount > 0);
    const hasCompleted = charts.remindersCompleted.some(
        (entry) => entry.count > 0,
    );

    return (
        <>
            <Head title="Beranda" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Halo, <span className="text-gradient">{firstName}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">{today}</p>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-lg shadow-primary/20">
                    <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/15 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-10 size-40 rounded-full bg-black/10 blur-2xl" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-80">
                                Apa yang mau kamu kelola hari ini?
                            </p>
                            <p className="mt-1 text-xl font-bold tracking-tight">
                                Kelola pengingat & tabunganmu di satu tempat
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button
                                asChild
                                variant="secondary"
                                className="shadow-sm"
                            >
                                <Link href={toUrl(remindersIndex())}>
                                    <AlarmClock className="size-4" />
                                    Ingetin
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="secondary"
                                className="shadow-sm"
                            >
                                <Link href={toUrl(savingsIndex())}>
                                    <PiggyBank className="size-4" />
                                    Nabung
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {refreshing ? (
                    <StatSkeletonGrid />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Card
                            className={cn(
                                'h-full',
                                stats.overdueReminders > 0 &&
                                    'border-destructive/40 bg-destructive/5',
                            )}
                        >
                            <CardHeader className="pb-2">
                                <div className="mb-2 flex items-center justify-between">
                                    <div
                                        className={cn(
                                            'flex size-9 items-center justify-center rounded-xl',
                                            stats.overdueReminders > 0
                                                ? 'bg-destructive/10 text-destructive'
                                                : 'bg-primary/10 text-primary',
                                        )}
                                    >
                                        <AlarmClock className="size-4" />
                                    </div>
                                    {stats.overdueReminders > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="font-medium"
                                        >
                                            {stats.overdueReminders} terlewat
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Ingetin aktif
                                </p>
                                <CardTitle className="text-3xl">
                                    {stats.pendingReminders}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <Target className="size-4" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Target nabung aktif
                                </p>
                                <CardTitle className="text-3xl">
                                    {stats.activeGoals}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Wallet className="size-4" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Total terkumpul
                                </p>
                                <CardTitle className="text-3xl">
                                    {formatMoney(stats.savedAmount)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                    <Wallet className="size-4" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Netto kas terakhir
                                </p>
                                <CardTitle className="text-3xl">
                                    {stats.latestCashflow
                                        ? formatMoney(cashflowNetto)
                                        : '—'}
                                </CardTitle>
                                {stats.latestCashflow ? (
                                    <NettoBadge netto={cashflowNetto} />
                                ) : (
                                    <CardDescription className="text-xs">
                                        Belum ada catatan kas
                                    </CardDescription>
                                )}
                            </CardHeader>
                        </Card>
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    <FeatureCard
                        icon={AlarmClock}
                        title="Ingetin"
                        description={
                            stats.pendingReminders > 0
                                ? `${stats.pendingReminders} ingatan aktif${
                                      stats.overdueReminders > 0
                                          ? `, ${stats.overdueReminders} terlewat`
                                          : ''
                                  }`
                                : 'Buat pengingat pertama mu'
                        }
                        href={toUrl(remindersIndex())}
                    />
                    <FeatureCard
                        icon={PiggyBank}
                        title="Nabung"
                        description={
                            stats.activeGoals > 0
                                ? `${formatMoney(stats.savedAmount)} terkumpul dari ${stats.activeGoals} target`
                                : 'Mulai target tabungan pertama mu'
                        }
                        href={toUrl(savingsIndex())}
                    />
                    <FeatureCard
                        icon={Wallet}
                        title="Kas"
                        description={
                            stats.latestCashflow
                                ? `${formatMoney(
                                      stats.latestCashflow.incomeTotal -
                                          stats.latestCashflow.expenseTotal,
                                  )} netto dari ${stats.latestCashflow.title}`
                                : 'Catat pemasukan & pengeluaranmu'
                        }
                        href={toUrl(cashflowsIndex())}
                    />
                </div>

                {refreshing ? (
                    <ChartSkeletonGrid />
                ) : (
                    (charts.goalsProgress.length > 0 ||
                        hasSavings ||
                        hasCompleted) && (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {charts.goalsProgress.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Progress Nabung
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <Bar
                                                data={{
                                                    labels: charts.goalsProgress.map(
                                                        (goal) => goal.title,
                                                    ),
                                                    datasets: [
                                                        {
                                                            label: 'Terkumpul',
                                                            data: charts.goalsProgress.map(
                                                                (goal) =>
                                                                    goal.percent,
                                                            ),
                                                            backgroundColor:
                                                                charts.goalsProgress.map(
                                                                    (goal) =>
                                                                        goal.percent >=
                                                                        100
                                                                            ? 'hsl(var(--chart-2))'
                                                                            : 'hsl(var(--primary))',
                                                                ),
                                                            borderRadius: 6,
                                                            maxBarThickness: 22,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    indexAxis: 'y',
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: false,
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (
                                                                    context,
                                                                ) =>
                                                                    `${context.parsed.x}% terkumpul`,
                                                            },
                                                        },
                                                    },
                                                    scales: {
                                                        x: {
                                                            max: 100,
                                                            ticks: {
                                                                callback: (
                                                                    value,
                                                                ) =>
                                                                    `${value}%`,
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {hasSavings && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Tabungan 6 Bulan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <Line
                                                data={{
                                                    labels: charts.monthlySavings.map(
                                                        (entry) =>
                                                            formatMonthLabel(
                                                                entry.month,
                                                            ),
                                                    ),
                                                    datasets: [
                                                        {
                                                            label: 'Total disimpan',
                                                            data: charts.monthlySavings.map(
                                                                (entry) =>
                                                                    entry.amount,
                                                            ),
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
                                                        legend: {
                                                            display: false,
                                                        },
                                                    },
                                                    scales: {
                                                        y: {
                                                            ticks: {
                                                                callback: (
                                                                    value,
                                                                ) =>
                                                                    compactNumber(
                                                                        Number(
                                                                            value,
                                                                        ),
                                                                    ),
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {hasCompleted && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Ingetin Selesai
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <Bar
                                                data={{
                                                    labels: charts.remindersCompleted.map(
                                                        (entry) =>
                                                            formatWeekLabel(
                                                                entry.week,
                                                            ),
                                                    ),
                                                    datasets: [
                                                        {
                                                            label: 'Selesai',
                                                            data: charts.remindersCompleted.map(
                                                                (entry) =>
                                                                    entry.count,
                                                            ),
                                                            backgroundColor:
                                                                'hsl(var(--chart-2))',
                                                            borderRadius: 6,
                                                            maxBarThickness: 28,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: false,
                                                        },
                                                    },
                                                    scales: {
                                                        y: {
                                                            ticks: {
                                                                stepSize: 1,
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )
                )}
            </div>
        </>
    );
}

function formatMonthLabel(month: string): string {
    return new Date(`${month}-01T00:00:00`).toLocaleDateString('id-ID', {
        month: 'short',
        year: '2-digit',
    });
}

function formatWeekLabel(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
    });
}

function compactNumber(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
    }).format(value);
}

function StatSkeletonGrid() {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
                <Card key={index} className="h-full border-border/60">
                    <CardHeader className="pb-2">
                        <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-muted">
                            <Skeleton className="size-4" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="mt-1 h-8 w-16" />
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}

function ChartSkeletonGrid() {
    return (
        <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
                <Card key={index} className="border-border/60">
                    <CardHeader>
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: typeof AlarmClock;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            prefetch="mount"
            cacheFor="60s"
            className="group block h-full"
        >
            <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                <CardHeader className="pb-2">
                    <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
                        <Icon className="size-5" />
                    </div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        {title}
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    {description}
                </CardContent>
            </Card>
        </Link>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Beranda',
            href: dashboard(),
        },
    ],
};
