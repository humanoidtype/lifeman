import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlarmClock,
    Check,
    ListTodo,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/format';
import { toUrl } from '@/lib/utils';
import { index, store, update, destroy, done } from '@/routes/reminders';
import type { PaginatedData, Reminder, ReminderType } from '@/types';

type Props = {
    reminders: PaginatedData<Reminder>;
    filter: ReminderType | null;
};

const tabs: Array<{ label: string; value: ReminderType | null }> = [
    { label: 'Semua', value: null },
    { label: 'Waktu', value: 'time' },
    { label: 'Task', value: 'task' },
];

type ReminderForm = {
    type: ReminderType;
    title: string;
    body: string;
    remind_at: string;
};

function toDateTimeLocal(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const pad = (part: number) => String(part).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function RemindersIndex({ reminders, filter }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Reminder | null>(null);

    return (
        <>
            <Head title="Ingatkan" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Ingatkan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pengingat waktu dan task akan muncul sebagai
                            notifikasi.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Tambah
                    </Button>
                </div>

                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.label}
                            href={toUrl(
                                index({
                                    query: tab.value
                                        ? { type: tab.value }
                                        : undefined,
                                }),
                            )}
                            className={
                                filter === tab.value
                                    ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground'
                                    : 'rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground'
                            }
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    {reminders.data.length === 0 && (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            Belum ada ingatkan. Tambahkan yang baru untuk mulai.
                        </p>
                    )}

                    {reminders.data.map((reminder) => (
                        <ReminderCard
                            key={reminder.id}
                            reminder={reminder}
                            onEdit={() => setEditing(reminder)}
                        />
                    ))}
                </div>
            </div>

            <ReminderFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                title="Tambah Ingatkan"
                description="Buat pengingat baru."
            />

            <ReminderFormDialog
                key={editing?.id}
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                reminder={editing ?? undefined}
                title="Ubah Ingatkan"
                description="Perbarui detail pengingat."
            />
        </>
    );
}

function ReminderCard({
    reminder,
    onEdit,
}: {
    reminder: Reminder;
    onEdit: () => void;
}) {
    const isTime = reminder.type === 'time';
    const Icon = isTime ? AlarmClock : ListTodo;

    function markDone(): void {
        router.patch(toUrl(done({ reminder: reminder.id })));
    }

    function remove(): void {
        if (window.confirm(`Hapus ingatkan "${reminder.title}"?`)) {
            router.delete(toUrl(destroy({ reminder: reminder.id })));
        }
    }

    return (
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
                {' '}
                <Button
                    size="icon"
                    variant="outline"
                    className="size-9 shrink-0 rounded-full"
                    onClick={markDone}
                    title="Tandai selesai"
                >
                    <Check className="size-4" />
                </Button>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{reminder.title}</p>
                        <Badge variant={isTime ? 'default' : 'secondary'}>
                            <Icon className="mr-1 size-3" />
                            {isTime ? 'Waktu' : 'Task'}
                        </Badge>
                    </div>
                    {reminder.body && (
                        <p className="truncate text-sm text-muted-foreground">
                            {reminder.body}
                        </p>
                    )}
                    {reminder.remind_at && (
                        <p className="text-xs text-muted-foreground">
                            {formatDateTime(reminder.remind_at)}
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" onClick={onEdit}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={remove}>
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ReminderFormDialog({
    open,
    onOpenChange,
    reminder,
    title,
    description,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reminder?: Reminder;
    title: string;
    description: string;
}) {
    const isEditing = reminder !== undefined;
    const { data, setData, errors, processing, post, put, reset } =
        useForm<ReminderForm>({
            type: reminder?.type ?? 'time',
            title: reminder?.title ?? '',
            body: reminder?.body ?? '',
            remind_at: toDateTimeLocal(reminder?.remind_at),
        });

    function submit(): void {
        if (data.type !== 'time') {
            setData('remind_at', '');
        }

        const onSuccess = () => {
            onOpenChange(false);
            reset();
        };

        if (isEditing && reminder) {
            put(toUrl(update({ reminder: reminder.id })), { onSuccess });
        } else {
            post(toUrl(store()), { onSuccess });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="reminder-type">Tipe</Label>
                        <Select
                            value={data.type}
                            onValueChange={(value) =>
                                setData('type', value as ReminderType)
                            }
                        >
                            <SelectTrigger id="reminder-type">
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="time">
                                    Ingatkan Waktu
                                </SelectItem>
                                <SelectItem value="task">
                                    Ingatkan Task
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reminder-title">Judul</Label>
                        <Input
                            id="reminder-title"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            placeholder="Contoh: Minum obat"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {data.type === 'time' && (
                        <div className="grid gap-2">
                            <Label htmlFor="reminder-at">Kapan</Label>
                            <Input
                                id="reminder-at"
                                type="datetime-local"
                                value={data.remind_at}
                                onChange={(event) =>
                                    setData('remind_at', event.target.value)
                                }
                            />
                            {errors.remind_at && (
                                <p className="text-sm text-destructive">
                                    {errors.remind_at}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="reminder-body">
                            Catatan (opsional)
                        </Label>
                        <Input
                            id="reminder-body"
                            value={data.body}
                            onChange={(event) =>
                                setData('body', event.target.value)
                            }
                            placeholder="Detail tambahan"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            reset();
                        }}
                    >
                        Batal
                    </Button>
                    <Button onClick={submit} disabled={processing}>
                        {isEditing ? 'Simpan' : 'Tambah'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
