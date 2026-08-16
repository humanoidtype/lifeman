import { CheckCircle2, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { checkAssets } from '@/lib/asset-check';
import { cn } from '@/lib/utils';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Life Man';
const MIN_DURATION_MS = 1600;
const CHECK_TIMEOUT_MS = 4000;
const FADE_DURATION_MS = 400;
const RELOAD_FLAG_KEY = 'lifeman-asset-reload';

type SplashPhase = 'loading' | 'fading' | 'hidden';
type AssetStatus = 'checking' | 'match' | 'mismatch' | 'unavailable';

export function AppSplash({ appVersion }: { appVersion?: string }) {
    const [phase, setPhase] = useState<SplashPhase>('loading');
    const [assetStatus, setAssetStatus] = useState<AssetStatus>('checking');

    useEffect(() => {
        let fadeTimer: number | undefined;

        const settle = (): void => {
            setPhase('fading');
            fadeTimer = window.setTimeout(
                () => setPhase('hidden'),
                FADE_DURATION_MS,
            );
        };

        const check = (): Promise<void> =>
            checkAssets().then((result) => {
                setAssetStatus(result.status);

                if (result.status !== 'mismatch') {
                    return;
                }

                try {
                    if (sessionStorage.getItem(RELOAD_FLAG_KEY) !== null) {
                        return;
                    }

                    sessionStorage.setItem(RELOAD_FLAG_KEY, '1');
                } catch {
                    return;
                }

                window.setTimeout(() => {
                    const separator = window.location.href.includes('?')
                        ? '&'
                        : '?';

                    window.location.replace(
                        `${window.location.href}${separator}v=${Date.now()}`,
                    );
                }, 600);
            });

        void Promise.all([
            new Promise((resolve) => setTimeout(resolve, MIN_DURATION_MS)),
            Promise.race([
                check(),
                new Promise((resolve) => setTimeout(resolve, CHECK_TIMEOUT_MS)),
            ]),
        ]).then(settle);

        return () => {
            window.clearTimeout(fadeTimer);
        };
    }, []);

    if (phase === 'hidden') {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label={`Memuat ${APP_NAME}`}
            className={cn(
                'pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground transition-opacity duration-500',
                phase === 'fading' && 'opacity-0',
            )}
        >
            <div className="animate-pulse">
                <AppLogoIcon className="size-24 drop-shadow-lg" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-2xl font-bold tracking-tight">{APP_NAME}</p>
                <p className="text-sm opacity-80">Versi {appVersion}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium opacity-90">
                {assetStatus === 'checking' && (
                    <>
                        <LoaderCircle className="size-3.5 animate-spin" />
                        Checking assets library...
                    </>
                )}
                {assetStatus === 'match' && (
                    <>
                        <CheckCircle2 className="size-3.5" />
                        Assets OK
                    </>
                )}
                {assetStatus === 'mismatch' && (
                    <>
                        <TriangleAlert className="size-3.5" />
                        Menyesuaikan aset...
                    </>
                )}
                {assetStatus === 'unavailable' && (
                    <>
                        <TriangleAlert className="size-3.5" />
                        Cek aset tidak tersedia
                    </>
                )}
            </div>
        </div>
    );
}
