import { Head, Link, usePage } from '@inertiajs/react';
import { AlarmClock, ArrowRight, PiggyBank, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import { Button } from '@/components/ui/button';
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
        description: 'Pengingat yang muncul sebagai notifikasi tepat waktu.',
        icon: AlarmClock,
        href: toUrl(remindersIndex()),
    },
    {
        title: 'Nabung',
        description: 'Target tabungan dengan progress dan saran cicilan.',
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
                    <span className="flex items-center gap-2 font-semibold tracking-tight">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
                            <Sparkles className="size-4" />
                        </span>
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
                        <nav className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm">
                                <Link href={login()}>Masuk</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href={register()}>Daftar</Link>
                            </Button>
                        </nav>
                    )}
                </header>

                <main className="mx-auto flex w-full max-w-3xl flex-col gap-10">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                            <Sparkles className="size-3.5" />
                            Kelola hidupmu, lebih tenang
                        </span>
                        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Hidup{' '}
                            <span className="text-gradient">lebih teratur</span>{' '}
                            dengan Life Man
                        </h1>
                        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                            Ingetin pengingat waktu dan tabungan target dalam
                            satu aplikasi. Pantau progress, sisihkan cicilan,
                            dan jangan lewatkan momen penting.
                        </p>
                        {!auth.user && (
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <Link href={register()}>
                                        Mulai Gratis
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl"
                                >
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                            </div>
                        )}
                        {auth.user && (
                            <Button
                                asChild
                                size="lg"
                                className="mt-2 rounded-xl shadow-lg shadow-primary/25"
                            >
                                <Link href={dashboard()}>
                                    Buka dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {features.map((feature) => (
                            <Link
                                key={feature.title}
                                href={feature.href}
                                prefetch
                                className="group block h-full"
                            >
                                <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                                    <CardHeader className="pb-2">
                                        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
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
                </main>
            </div>
        </>
    );
}
