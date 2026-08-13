import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, PiggyBank, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatDate, formatMoney, formatPercent } from '@/lib/format';
import { toUrl } from '@/lib/utils';
import { show, store } from '@/routes/savings-goals';
import type { PaginatedData, SavingsGoal } from '@/types';

type Props = {
    goals: PaginatedData<SavingsGoal>;
};

type GoalForm = {
    title: string;
    target_amount: string;
    start_date: string;
    end_date: string;
    notes: string;
};

export default function SavingsIndex({ goals }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Head title="Nabung" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Ingatkan Nabung
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Target tabunganmu, pantau progress setiap cicilan.
                        </p>
                    </div>
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="size-4" />
                        Target Baru
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {goals.data.length === 0 && (
                        <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                            Belum ada target nabung. Buat target pertamamu.
                        </p>
                    )}

                    {goals.data.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} />
                    ))}
                </div>
            </div>

            <GoalFormDialog open={open} onOpenChange={setOpen} />
        </>
    );
}

function GoalCard({ goal }: { goal: SavingsGoal }) {
    const paid = Number(goal.paid_amount ?? 0);
    const target = Number(goal.target_amount);
    const percent = target > 0 ? (paid / target) * 100 : 0;
    const reached = paid >= target;

    return (
        <Link
            href={toUrl(show({ savings_goal: goal.id }))}
            prefetch
            className="group"
        >
            <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PiggyBank className="size-4 text-primary" />
                            {goal.title}
                            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </CardTitle>
                        <Badge variant={reached ? 'default' : 'secondary'}>
                            {reached ? 'Tercapai' : 'Berjalan'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="font-semibold">
                            {formatMoney(paid)}
                        </span>
                        <span className="text-muted-foreground">
                            dari {formatMoney(target)}
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatPercent(percent)} terkumpul</span>
                        <span>
                            {goal.start_date && formatDate(goal.start_date)}
                            {goal.end_date
                                ? ` – ${formatDate(goal.end_date)}`
                                : ''}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function GoalFormDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data, setData, errors, processing, post, reset } =
        useForm<GoalForm>({
            title: '',
            target_amount: '',
            start_date: new Date().toISOString().slice(0, 10),
            end_date: '',
            notes: '',
        });

    function submit(): void {
        post(toUrl(store()), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Target Nabung Baru</DialogTitle>
                    <DialogDescription>
                        Judul target akan menjadi judul card progress.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="goal-title">Judul target</Label>
                        <Input
                            id="goal-title"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            placeholder="Contoh: Liburan Bali"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="goal-target">Target nominal</Label>
                        <Input
                            id="goal-target"
                            type="number"
                            min="1"
                            inputMode="numeric"
                            value={data.target_amount}
                            onChange={(event) =>
                                setData('target_amount', event.target.value)
                            }
                            placeholder="5000000"
                        />
                        {errors.target_amount && (
                            <p className="text-sm text-destructive">
                                {errors.target_amount}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="goal-start">Mulai</Label>
                            <Input
                                id="goal-start"
                                type="date"
                                value={data.start_date}
                                onChange={(event) =>
                                    setData('start_date', event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="goal-end">
                                Target selesai (opsional)
                            </Label>
                            <Input
                                id="goal-end"
                                type="date"
                                value={data.end_date}
                                onChange={(event) =>
                                    setData('end_date', event.target.value)
                                }
                            />
                            {errors.end_date && (
                                <p className="text-sm text-destructive">
                                    {errors.end_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="goal-notes">Catatan (opsional)</Label>
                        <Input
                            id="goal-notes"
                            value={data.notes}
                            onChange={(event) =>
                                setData('notes', event.target.value)
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
                        Buat Target
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
