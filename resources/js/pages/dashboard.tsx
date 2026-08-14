import { Head, Link } from '@inertiajs/react';
import {
    AlarmClock,
    ArrowRight,
    PiggyBank,
    Target,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/lib/format';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as remindersIndex } from '@/routes/reminders';
import { index as savingsIndex } from '@/routes/savings-goals';
import type { Auth } from '@/types';

type Props = {
    auth: Auth;
    stats: {
        pendingReminders: number;
        overdueReminders: number;
        activeGoals: number;
        savedAmount: number;
    };
};

export default function Dashboard({ auth, stats }: Props) {
    const firstName = auth.user.name.split(' ')[0];
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

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

                <div className="grid gap-3 sm:grid-cols-3">
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
                </div>

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
                </div>
            </div>
        </>
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
        <Link href={href} prefetch className="group block h-full">
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
