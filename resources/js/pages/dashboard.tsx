import { Head, Link } from '@inertiajs/react';
import { AlarmClock, ArrowRight, PiggyBank } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatMoney } from '@/lib/format';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as remindersIndex } from '@/routes/reminders';
import { index as savingsIndex } from '@/routes/savings-goals';

type Props = {
    stats: {
        pendingReminders: number;
        activeGoals: number;
        savedAmount: number;
    };
};

const features = [
    {
        title: 'Ingetin',
        description: 'Pengingat yang muncul sebagai notifikasi.',
        icon: AlarmClock,
        href: toUrl(remindersIndex()),
    },
    {
        title: 'Nabung',
        description: 'Target tabungan dengan progress menarik.',
        icon: PiggyBank,
        href: toUrl(savingsIndex()),
    },
];

export default function Dashboard({ stats }: Props) {
    return (
        <>
            <Head title="Beranda" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Selamat datang di Life Man
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola pengingat waktu, task, dan tabunganmu dalam satu
                        tempat.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Ingatkan aktif</CardDescription>
                            <CardTitle className="text-3xl">
                                {stats.pendingReminders}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>
                                Target nabung aktif
                            </CardDescription>
                            <CardTitle className="text-3xl">
                                {stats.activeGoals}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Total terkumpul</CardDescription>
                            <CardTitle className="text-3xl">
                                {formatMoney(stats.savedAmount)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {features.map((feature) => (
                        <Link
                            key={feature.title}
                            href={feature.href}
                            prefetch
                            className="group block h-full"
                        >
                            <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                                        <feature.icon className="size-5" />
                                    </div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        {feature.title}
                                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    {feature.description}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </>
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
