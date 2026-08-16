import { Head, router, usePage } from '@inertiajs/react';
import { Bell, Check, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import { SettingsPageSkeleton } from '@/components/page-skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigating } from '@/hooks/use-navigating';
import {
    SOUNDS,
    isNativePlatform,
    rescheduleUpcomingReminders,
} from '@/lib/notification';
import { cn } from '@/lib/utils';
import { edit as editNotifications } from '@/routes/notifications';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Notifications() {
    const { auth } = usePage<PageProps>().props;
    const [selected, setSelected] = useState(
        auth.user.notification_sound ?? 'default',
    );
    const [saving, setSaving] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(
        () => () => {
            audioRef.current?.pause();
        },
        [],
    );

    const navigating = useNavigating();

    if (navigating) {
        return <SettingsPageSkeleton />;
    }

    function preview(soundId: string): void {
        if (soundId === 'default') {
            return;
        }

        if (audioRef.current && playingId === soundId) {
            audioRef.current.pause();
            setPlayingId(null);

            return;
        }

        audioRef.current?.pause();
        const audio = new Audio(`/sounds/${soundId}.wav`);
        audio.onplay = () => setPlayingId(soundId);
        audio.onended = () => setPlayingId(null);
        audio.onpause = () => setPlayingId(null);
        audioRef.current = audio;
        void audio.play();
    }

    function choose(soundId: string): void {
        if (soundId === selected || saving) {
            return;
        }

        setSelected(soundId);
        setSaving(true);

        router.put(
            editNotifications(),
            { notification_sound: soundId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (isNativePlatform()) {
                        void rescheduleUpcomingReminders(soundId);
                    }
                },
                onFinish: () => setSaving(false),
            },
        );
    }

    return (
        <>
            <Head title="Notifikasi" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Notifikasi"
                    description="Pilih suara untuk notifikasi pengingat."
                />

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-5 py-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Bell className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Suara pengingat
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 p-5">
                        {SOUNDS.map((sound) => {
                            const isSelected = selected === sound.id;
                            const isDefault = sound.id === 'default';
                            const isPlaying = playingId === sound.id;

                            return (
                                <Card
                                    key={sound.id}
                                    className={cn(
                                        'cursor-pointer rounded-xl transition-all duration-200',
                                        isSelected &&
                                            'border-primary shadow-md',
                                    )}
                                    onClick={() => choose(sound.id)}
                                >
                                    <CardContent className="flex items-center gap-3 p-3.5">
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                isSelected
                                                    ? 'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            <Volume2 className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">
                                                {sound.label}
                                            </p>
                                            {isDefault && (
                                                <p className="text-xs text-muted-foreground">
                                                    Mengikuti suara notifikasi
                                                    default perangkat.
                                                </p>
                                            )}
                                        </div>

                                        {isPlaying ? (
                                            <div
                                                className="flex h-4 shrink-0 items-end gap-0.5"
                                                aria-label="Memutar preview"
                                            >
                                                {[0, 1, 2].map((i) => (
                                                    <span
                                                        key={i}
                                                        className="w-1 animate-pulse rounded-full bg-primary"
                                                        style={{
                                                            height: `${6 + i * 4}px`,
                                                            animationDelay: `${i * 0.18}s`,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            !isDefault && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-8 shrink-0 rounded-full"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        preview(sound.id);
                                                    }}
                                                    title={`Putar ${sound.label}`}
                                                >
                                                    <Volume2 className="size-4" />
                                                </Button>
                                            )
                                        )}

                                        <span
                                            className={cn(
                                                'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                                                isSelected
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-muted-foreground/40',
                                            )}
                                        >
                                            {isSelected && (
                                                <Check className="size-3" />
                                            )}
                                        </span>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Notifications.layout = {
    breadcrumbs: [
        {
            title: 'Notifikasi',
            href: editNotifications(),
        },
    ],
};
