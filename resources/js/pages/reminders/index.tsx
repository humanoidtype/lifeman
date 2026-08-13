import { Head, router, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { formatDateTime } from '@/lib/format';
import { toUrl } from '@/lib/utils';
import { store, update, destroy, done } from '@/routes/reminders';
import type { PaginatedData, Reminder } from '@/types';

type Props = {
    reminders: PaginatedData<Reminder>;
};

type ReminderForm = {
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

export default function RemindersIndex({ reminders }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Reminder | null>(null);

    return (
        <>
            <Head title="Ingetin" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Ingetin
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pengingat akan muncul sebagai notifikasi.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Tambah
                    </Button>
                </div>

                <div className="flex flex-col gap-3">
                    {reminders.data.length === 0 && (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            Belum ada ingetin. Tambahkan yang baru untuk mulai.
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
                title="Tambah Ingetin"
                description="Buat pengingat baru."
            />

            <ReminderFormDialog
                key={editing?.id}
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                reminder={editing ?? undefined}
                title="Ubah Ingetin"
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
    function markDone(): void {
        router.patch(toUrl(done({ reminder: reminder.id })));
    }

    function remove(): void {
        if (window.confirm(`Hapus ingetin "${reminder.title}"?`)) {
            router.delete(toUrl(destroy({ reminder: reminder.id })));
        }
    }

    return (
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
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
                    <p className="font-semibold">{reminder.title}</p>
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
    const { data, setData, errors, processing, post, put, reset, transform } =
        useForm<ReminderForm>({
            title: reminder?.title ?? '',
            body: reminder?.body ?? '',
            remind_at: toDateTimeLocal(reminder?.remind_at),
        });

    transform((values) => ({
        ...values,
        remind_at: values.remind_at
            ? new Date(values.remind_at).toISOString()
            : '',
    }));

    function submit(): void {
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
