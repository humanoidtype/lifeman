import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { DueReminder } from '@/types';

const SCHEDULED_KEY = 'lifeman.scheduled_notifications';

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
): Promise<void> {
    if (!isNativePlatform()) {
        return;
    }

    await ensureNotificationPermission();

    const liveIds = new Set(reminders.map((reminder) => reminder.id));
    const scheduled = readScheduledMap();

    const staleIds = Object.keys(scheduled).filter(
        (id) => !liveIds.has(Number(id)),
    );

    for (const id of staleIds) {
        try {
            await LocalNotifications.cancel({
                notifications: [{ id: scheduled[id] }],
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
                        body:
                            reminder.body ??
                            (reminder.type === 'time'
                                ? 'Ingatkan waktu'
                                : 'Ingatkan task'),
                        schedule: { at },
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
