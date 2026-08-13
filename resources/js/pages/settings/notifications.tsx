import { Head, router, usePage } from '@inertiajs/react';
import { Check, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    SOUNDS,
    isNativePlatform,
    rescheduleUpcomingReminders,
} from '@/lib/notification';
import { cn } from '@/lib/utils';
import { edit as editNotifications } from '@/routes/notifications';

export default function Notifications() {
    const { auth } = usePage().props;
    const [selected, setSelected] = useState(
        auth.user.notification_sound ?? 'default',
    );
    const [saving, setSaving] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(
        () => () => {
            audioRef.current?.pause();
        },
        [],
    );

    function preview(soundId: string): void {
        if (soundId === 'default') {
            return;
        }

        audioRef.current?.pause();
        const audio = new Audio(`/sounds/${soundId}.wav`);
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
            <Head title="Pengaturan Notifikasi" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Pengaturan Notifikasi"
                    description="Pilih suara untuk notifikasi pengingat."
                />

                <div className="flex flex-col gap-3">
                    {SOUNDS.map((sound) => {
                        const isSelected = selected === sound.id;
                        const isDefault = sound.id === 'default';

                        return (
                            <Card
                                key={sound.id}
                                className={cn(
                                    'cursor-pointer transition-all duration-200',
                                    isSelected && 'border-primary shadow-md',
                                )}
                                onClick={() => choose(sound.id)}
                            >
                                <CardContent className="flex items-center gap-3 p-4">
                                    <div
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                                            isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-muted-foreground/40',
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="size-3" />
                                        )}
                                    </div>
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
                                    {!isDefault && (
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
                                            <Play className="size-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

Notifications.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Notifikasi',
            href: editNotifications(),
        },
    ],
};
