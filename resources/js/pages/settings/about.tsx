import { Head, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    ExternalLink,
    Heart,
    Info,
    LoaderCircle,
    RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkForUpdates } from '@/lib/update-check';
import type { UpdateInfo } from '@/lib/update-check';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Life Man';
const DEVELOPER_NAME = 'HumanoidType';
const SUPPORT_URL = 'https://saweria.co/';
const MIN_CHECK_MS = 600;

function openExternal(url: string): void {
    window.open(url, '_system');
}

export default function About() {
    const { appVersion } = usePage().props;
    const [update, setUpdate] = useState<UpdateInfo | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        void checkForUpdates(appVersion).then(async (info) => {
            await new Promise((resolve) => setTimeout(resolve, MIN_CHECK_MS));

            if (!cancelled) {
                setUpdate(info);
                setChecking(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [appVersion]);

    function recheck(): void {
        setChecking(true);
        const started = Date.now();

        checkForUpdates(appVersion, true).then((info) => {
            const elapsed = Date.now() - started;

            if (elapsed >= MIN_CHECK_MS) {
                setUpdate(info);
                setChecking(false);

                return;
            }

            window.setTimeout(() => {
                setUpdate(info);
                setChecking(false);
            }, MIN_CHECK_MS - elapsed);
        });
    }

    const checkedLabel = update?.checkedAt
        ? new Date(update.checkedAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;
    const releaseUrl = update?.releaseUrl;

    return (
        <>
            <Head title="Versi App" />

            <h1 className="sr-only">Versi aplikasi</h1>

            <div className="space-y-4">
                <Heading
                    variant="small"
                    title="Versi App"
                    description="Info aplikasi, pembaruan, dan dukungan developer"
                />

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Info className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Info aplikasi
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="size-14 rounded-2xl" />
                            <div className="min-w-0">
                                <p className="text-lg font-semibold">
                                    {APP_NAME}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Versi {appVersion}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Dikembangkan oleh {DEVELOPER_NAME}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Download className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Pembaruan
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                        {checking ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <LoaderCircle className="size-4 animate-spin" />
                                Memeriksa pembaruan...
                            </div>
                        ) : update?.failed ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="size-4 text-destructive" />
                                    Tidak dapat memeriksa pembaruan. Pastikan
                                    koneksi internetmu aktif.
                                </div>
                                {update.errorMessage && (
                                    <p className="text-xs text-muted-foreground">
                                        Detail: {update.errorMessage}
                                    </p>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={recheck}
                                >
                                    <RefreshCw className="size-4" />
                                    Coba Lagi
                                </Button>
                            </div>
                        ) : update?.updateAvailable ? (
                            <div className="space-y-3">
                                <Badge variant="destructive">
                                    Update tersedia
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Versi {update.latestVersion} sudah tersedia.
                                    Kamu menggunakan versi {appVersion}.
                                </p>
                                <Button
                                    onClick={() =>
                                        openExternal(
                                            update.downloadUrl ??
                                                update.releaseUrl ??
                                                '',
                                        )
                                    }
                                >
                                    <Download className="size-4" />
                                    Update Aplikasi
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Badge
                                    variant="secondary"
                                    className="bg-emerald-100 text-emerald-700"
                                >
                                    <CheckCircle2 className="size-3.5" />
                                    Sudah versi terbaru
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Kamu menggunakan versi {appVersion}.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 border-t pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={recheck}
                                disabled={checking}
                            >
                                <RefreshCw className="size-4" />
                                Periksa Update
                            </Button>
                            {checkedLabel && (
                                <span className="text-xs text-muted-foreground">
                                    Terakhir diperiksa {checkedLabel}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Download className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Changelog
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        {update?.changelog ? (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Versi {update.latestVersion ?? appVersion}
                                </p>
                                <p className="max-h-56 overflow-y-auto text-sm whitespace-pre-wrap">
                                    {update.changelog}
                                </p>
                                {releaseUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openExternal(releaseUrl)}
                                    >
                                        <ExternalLink className="size-4" />
                                        Lihat semua rilis
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {update?.failed
                                    ? 'Changelog tidak tersedia — periksa pembaruan gagal.'
                                    : 'Belum ada changelog untuk versi ini.'}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Heart className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Dukung developer
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                        <p className="text-sm text-muted-foreground">
                            Suka menggunakan {APP_NAME}? Dukung pengembangan{' '}
                            {APP_NAME} melalui Saweria.
                        </p>
                        <Button onClick={() => openExternal(SUPPORT_URL)}>
                            <Heart className="size-4" />
                            Dukung di Saweria
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
