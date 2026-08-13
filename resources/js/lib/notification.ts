import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { httpJson } from '@/lib/http';
import { toUrl } from '@/lib/utils';
import { upcoming } from '@/routes/reminders';
import type { DueReminder } from '@/types';

const SCHEDULED_KEY = 'lifeman.scheduled_notifications';
const CHANNEL_KEY = 'lifeman.notification_channel';
const CHANNEL_ID = 'ingetin';

export const SOUNDS: Array<{ id: string; label: string }> = [
    { id: 'default', label: 'Default (sistem)' },
    { id: 'chime', label: 'Chime' },
    { id: 'beep', label: 'Beep' },
    { id: 'melody', label: 'Melody' },
];

type ScheduledMap = Record<string, number>;

export function isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
}

function readScheduledMap(): ScheduledMap {
    try {
        return JSON.parse(
            localStorage.getItem(SCHEDULED_KEY) ?? '{}',
        ) as ScheduledMap;
    } catch {
        return {};
    }
}

function writeScheduledMap(map: ScheduledMap): void {
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(map));
}

export async function ensureNotificationPermission(): Promise<boolean> {
    if (!isNativePlatform()) {
        return Notification.permission === 'granted';
    }

    const status = await LocalNotifications.requestPermissions();

    return status.display === 'granted';
}

export async function ensureNotificationChannel(
    soundId: string,
): Promise<void> {
    if (!isNativePlatform()) {
        return;
    }

    const sound = soundId !== 'default' ? soundId : undefined;

    if (localStorage.getItem(CHANNEL_KEY) === (sound ?? 'default')) {
        return;
    }

    try {
        await LocalNotifications.deleteChannel({ id: CHANNEL_ID });
    } catch {
        // channel may not exist yet
    }

    await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'Ingetin',
        description: 'Notifikasi pengingat',
        sound,
        importance: 5,
        vibration: true,
    });

    localStorage.setItem(CHANNEL_KEY, sound ?? 'default');
}

export async function cancelReminderNotification(
    reminderId: number,
): Promise<void> {
    if (!isNativePlatform()) {
        return;
    }

    const scheduled = readScheduledMap();

    if (scheduled[reminderId] === undefined) {
        return;
    }

    await LocalNotifications.cancel({
        notifications: [{ id: scheduled[reminderId] }],
    });

    delete scheduled[reminderId];
    writeScheduledMap(scheduled);
}

export async function syncUpcomingReminders(
    reminders: DueReminder[],
    soundId = 'default',
): Promise<void> {
    if (!isNativePlatform()) {
        return;
    }

    await ensureNotificationPermission();
    await ensureNotificationChannel(soundId);

    const liveIds = new Set(reminders.map((reminder) => reminder.id));
    const scheduled = readScheduledMap();

    const staleIds = Object.keys(scheduled).filter(
        (id) => !liveIds.has(Number(id)),
    );

    for (const id of staleIds) {
        const staleId = scheduled[id];

        if (staleId === undefined) {
            continue;
        }

        try {
            await LocalNotifications.cancel({
                notifications: [{ id: staleId }],
            });
        } catch {
            return;
        }

        delete scheduled[id];
    }

    for (const reminder of reminders) {
        if (scheduled[reminder.id] !== undefined || !reminder.remind_at) {
            continue;
        }

        const at = new Date(reminder.remind_at);

        if (at.getTime() <= Date.now()) {
            continue;
        }

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: reminder.id,
                        title: reminder.title,
                        body: reminder.body ?? '',
                        schedule: { at },
                        channelId: CHANNEL_ID,
                    },
                ],
            });
            scheduled[reminder.id] = reminder.id;
        } catch {
            return;
        }
    }

    writeScheduledMap(scheduled);
}

export async function rescheduleUpcomingReminders(
    soundId = 'default',
): Promise<void> {
    if (!isNativePlatform()) {
        return;
    }

    const reminders = await httpJson<DueReminder[]>(toUrl(upcoming()));

    const scheduled = readScheduledMap();

    for (const id of Object.keys(scheduled)) {
        try {
            await LocalNotifications.cancel({
                notifications: [{ id: scheduled[id] }],
            });
        } catch {
            return;
        }
    }

    writeScheduledMap({});
    await syncUpcomingReminders(reminders, soundId);
}
