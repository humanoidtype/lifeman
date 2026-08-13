import { Head, Link, usePage } from '@inertiajs/react';
import { AlarmClock, ArrowRight, PiggyBank } from 'lucide-react';
import type { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toUrl } from '@/lib/utils';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import { index as remindersIndex } from '@/routes/reminders';
import { index as savingsIndex } from '@/routes/savings-goals';

type Feature = {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    href: string;
};

const features: Feature[] = [
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

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Beranda" />

            <div className="flex min-h-dvh flex-col p-6 lg:justify-center lg:p-8">
                <header className="mx-auto mb-10 flex w-full max-w-3xl items-center justify-between">
                    <span className="font-semibold tracking-tight">
                        Life Man
                    </span>
                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Buka dashboard
                        </Link>
                    ) : (
                        <nav className="flex items-center gap-4">
                            <Link
                                href={login()}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={register()}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Daftar
                            </Link>
                        </nav>
                    )}
                </header>

                <main className="mx-auto flex w-full max-w-3xl flex-col gap-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Selamat datang di Life Man
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola pengingat waktu, task, dan tabunganmu dalam
                            satu tempat. Pilih fitur untuk memulai.
                        </p>
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

                    {!auth.user && (
                        <p className="text-center text-sm text-muted-foreground">
                            Klik fitur mana pun akan diarahkan ke halaman masuk.
                        </p>
                    )}
                </main>
            </div>
        </>
    );
}
