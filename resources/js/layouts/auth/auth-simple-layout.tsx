import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
                <div className="flex flex-col items-center gap-4">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-2 font-medium"
                    >
                        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-background shadow-lg ring-1 ring-border/50">
                            <AppLogoIcon className="size-8 fill-current text-[var(--foreground)] dark:text-white" />
                        </div>
                        <span className="sr-only">{title}</span>
                    </Link>

                    <div className="space-y-1.5 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border bg-card/80 p-6 shadow-2xl ring-1 shadow-black/5 ring-border/50 backdrop-blur-xl sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
