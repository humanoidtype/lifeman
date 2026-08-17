import { Head, Link } from '@inertiajs/react';
import { AlarmClock, ArrowRight, PiggyBank, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as cashflowsIndex } from '@/routes/cashflows';
import { index as personalIndexRoute } from '@/routes/personal';
import { index as remindersIndex } from '@/routes/reminders';
import { index as savingsIndex } from '@/routes/savings-goals';

const items = [
    {
        title: 'Kas Pribadi',
        description: 'Catat pemasukan & pengeluaran harian',
        icon: Wallet,
        href: cashflowsIndex(),
        accent: 'bg-primary/10 text-primary',
    },
    {
        title: 'Nabung',
        description: 'Target tabungan dan cicilan',
        icon: PiggyBank,
        href: savingsIndex(),
        accent: 'bg-muted text-foreground',
    },
    {
        title: 'Ingetin',
        description: 'Pengingat tugas dan jadwal',
        icon: AlarmClock,
        href: remindersIndex(),
        accent: 'bg-muted text-foreground',
    },
];

export default function PersonalIndex() {
    return (
        <>
            <Head title="Pribadi" />

            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Pribadi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola kebutuhan personalmu di satu tempat.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Link
                            key={item.title}
                            href={toUrl(item.href)}
                            prefetch
                            cacheFor="60s"
                            className="group"
                        >
                            <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                                <CardHeader className="gap-3">
                                    <div
                                        className={cn(
                                            'flex size-10 items-center justify-center rounded-xl',
                                            item.accent,
                                        )}
                                    >
                                        <item.icon className="size-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            {item.title}
                                            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                        </CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                <Link
                    href={toUrl(dashboard())}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </>
    );
}

PersonalIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pribadi',
            href: toUrl(personalIndexRoute()),
        },
    ],
};
