import { AlarmClock, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useReminderAlerts } from '@/hooks/use-reminder-alerts';
import { formatDateTime } from '@/lib/format';
import type { DueReminder } from '@/types';

export function ReminderBanner() {
    const { alerts, dismiss, complete } = useReminderAlerts();

    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
            <div className="flex w-full max-w-md flex-col gap-2">
                {alerts.slice(0, 2).map((reminder) => (
                    <ReminderBannerItem
                        key={reminder.id}
                        reminder={reminder}
                        onDismiss={() => dismiss(reminder)}
                        onComplete={() => complete(reminder)}
                    />
                ))}
            </div>
        </div>
    );
}

function ReminderBannerItem({
    reminder,
    onDismiss,
    onComplete,
}: {
    reminder: DueReminder;
    onDismiss: () => void;
    onComplete: () => void;
}) {
    const Icon = reminder.type === 'time' ? AlarmClock : ListTodo;

    return (
        <Card className="animate-in rounded-2xl border-border/70 shadow-lg shadow-black/5 fade-in slide-in-from-bottom-2">
            <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                        {reminder.title}
                    </p>
                    {reminder.body && (
                        <p className="truncate text-xs text-muted-foreground">
                            {reminder.body}
                        </p>
                    )}
                    {reminder.remind_at && (
                        <p className="text-xs text-muted-foreground">
                            {formatDateTime(reminder.remind_at)}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 gap-2">
                    {reminder.type === 'task' && (
                        <Button size="sm" onClick={onComplete}>
                            Selesai
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={onDismiss}>
                        Tutup
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
