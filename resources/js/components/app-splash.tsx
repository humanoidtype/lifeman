import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Life Man';
const MIN_DURATION_MS = 1600;
const FADE_DURATION_MS = 400;

export function AppSplash() {
    const page = usePage();
    const [visible, setVisible] = useState(true);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        let fadeTimer: number | undefined;

        Promise.all([
            document.fonts?.ready ?? Promise.resolve(),
            new Promise((resolve) => setTimeout(resolve, MIN_DURATION_MS)),
        ]).then(() => {
            setFading(true);
            fadeTimer = window.setTimeout(
                () => setVisible(false),
                FADE_DURATION_MS,
            );
        });

        return () => {
            window.clearTimeout(fadeTimer);
        };
    }, []);

    if (page.component === 'welcome') {
        return null;
    }

    if (!visible) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label={`Memuat ${APP_NAME}`}
            className={cn(
                'pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground transition-opacity duration-500',
                fading && 'opacity-0',
            )}
        >
            <div className="animate-pulse">
                <AppLogoIcon className="size-24 drop-shadow-lg" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-2xl font-bold tracking-tight">{APP_NAME}</p>
                <p className="text-sm opacity-80">
                    Versi {page.props.appVersion}
                </p>
            </div>
        </div>
    );
}
