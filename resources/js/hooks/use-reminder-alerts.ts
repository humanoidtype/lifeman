import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { httpJson } from '@/lib/http';
import {
    cancelReminderNotification,
    syncUpcomingReminders,
    isNativePlatform,
} from '@/lib/notification';
import { toUrl } from '@/lib/utils';
import { due, notified, done, upcoming } from '@/routes/reminders';
import type { DueReminder } from '@/types';

const POLL_INTERVAL_MS = 60_000;

export function useReminderAlerts() {
    const page = usePage();
    const user = page.props.auth?.user;
    const [alerts, setAlerts] = useState<DueReminder[]>([]);

    useEffect(() => {
        if (!user) {
            return;
        }

        let cancelled = false;

        async function check(): Promise<void> {
            try {
                const upcomingReminders = await httpJson<DueReminder[]>(
                    toUrl(upcoming()),
                );

                if (isNativePlatform()) {
                    await syncUpcomingReminders(
                        upcomingReminders,
                        user.notification_sound ?? 'default',
                    );
                }

                const dueReminders = await httpJson<DueReminder[]>(
                    toUrl(due()),
                );

                if (cancelled) {
                    return;
                }

                setAlerts((current) => {
                    const merged = [...current];

                    for (const reminder of dueReminders) {
                        if (!merged.some((item) => item.id === reminder.id)) {
                            merged.push(reminder);
                        }
                    }

                    return merged;
                });
            } catch {
                return;
            }
        }

        void check();
        const interval = setInterval(check, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [user]);

    function dismiss(reminder: DueReminder): void {
        setAlerts((current) =>
            current.filter((item) => item.id !== reminder.id),
        );

        void cancelReminderNotification(reminder.id);
        void httpJson(toUrl(notified({ reminder: reminder.id })), {
            method: 'POST',
        }).catch(() => undefined);
    }

    function complete(reminder: DueReminder): void {
        setAlerts((current) =>
            current.filter((item) => item.id !== reminder.id),
        );

        void cancelReminderNotification(reminder.id);
        void httpJson(toUrl(done({ reminder: reminder.id })), {
            method: 'PATCH',
        }).catch(() => undefined);
    }

    return { alerts, dismiss, complete };
}
