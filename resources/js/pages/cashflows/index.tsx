import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CalendarClock, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { FilterBar } from '@/components/filter-bar';
import { NettoBadge } from '@/components/netto-badge';
import { Pagination } from '@/components/pagination';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useRefreshing } from '@/hooks/use-refreshing';
import { formatDate, formatMoney } from '@/lib/format';
import { toUrl } from '@/lib/utils';
import { show, store, index } from '@/routes/cashflows';
import type { Cashflow, PaginatedData } from '@/types';

type Props = {
    cashflows: PaginatedData<Cashflow>;
    filters: {
        search: string;
        sort: string;
    };
};

type CashflowForm = {
    title: string;
    period_start: string;
    period_end: string;
    notes: string;
};

export default function CashflowsIndex({ cashflows, filters }: Props) {
    const [open, setOpen] = useState(false);
    const { refreshing } = useRefreshing();

    return (
        <>
            <Head title="Kas" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Kas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Catat pemasukan & pengeluaranmu per periode.
                        </p>
                    </div>
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="size-4" />
                        Kas Baru
                    </Button>
                </div>

                <FilterBar
                    url={toUrl(index())}
                    search={filters.search}
                    sort={filters.sort}
                    sortOptions={[
                        { value: 'latest', label: 'Terbaru' },
                        { value: 'oldest', label: 'Terlama' },
                    ]}
                    sortPlaceholder="Terbaru"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    {refreshing ? (
                        <CashflowSkeletonList />
                    ) : (
                        <>
                            {cashflows.data.length === 0 && (
                                <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                                    Tidak ada catatan kas yang cocok.
                                </p>
                            )}

                            {cashflows.data.map((cashflow) => (
                                <CashflowCard
                                    key={cashflow.id}
                                    cashflow={cashflow}
                                />
                            ))}
                        </>
                    )}
                </div>

                <Pagination links={cashflows.links} />
            </div>

            {refreshing && (
                <div className="sr-only" role="status" aria-live="polite">
                    Memperbarui data...
                </div>
            )}

            <CashflowFormDialog open={open} onOpenChange={setOpen} />
        </>
    );
}

function CashflowSkeletonList() {
    return (
        <>
            {Array.from({ length: 4 }, (_, index) => (
                <Card key={index} className="border-border/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-4 rounded-md" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="flex items-baseline justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}

function CashflowCard({ cashflow }: { cashflow: Cashflow }) {
    const income = Number(cashflow.income_total ?? 0);
    const expense = Number(cashflow.expense_total ?? 0);
    const netto = income - expense;

    return (
        <Link
            href={toUrl(show({ cashflow: cashflow.id }))}
            prefetch
            className="group"
        >
            <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Wallet className="size-4 text-primary" />
                            {cashflow.title}
                            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </CardTitle>
                        <NettoBadge netto={netto} />
                    </div>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="font-semibold">
                            {formatMoney(netto)}
                        </span>
                        <span className="text-muted-foreground">
                            {(cashflow.period_start &&
                                formatDate(cashflow.period_start)) ||
                                'Mulai kapan saja'}
                            {cashflow.period_end
                                ? ` – ${formatDate(cashflow.period_end)}`
                                : ''}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400">
                            Masuk {formatMoney(income)}
                        </span>
                        <span className="text-destructive">
                            Keluar {formatMoney(expense)}
                        </span>
                    </div>

                    {cashflow.period_end && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                            <CalendarClock className="size-3.5 shrink-0 text-primary" />
                            <span>
                                Periode berakhir{' '}
                                <span className="font-semibold text-foreground">
                                    {formatDate(cashflow.period_end)}
                                </span>
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}

function CashflowFormDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data, setData, errors, processing, post, reset } =
        useForm<CashflowForm>({
            title: '',
            period_start: new Date().toISOString().slice(0, 10),
            period_end: '',
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
                    <DialogTitle>Kas Baru</DialogTitle>
                    <DialogDescription>
                        Judul biasanya nama bulan atau periode.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="cashflow-title">Judul kas</Label>
                        <Input
                            id="cashflow-title"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            placeholder="Contoh: Bulan Agustus"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="cashflow-start">
                                Mulai periode
                            </Label>
                            <Input
                                id="cashflow-start"
                                type="date"
                                value={data.period_start}
                                onChange={(event) =>
                                    setData('period_start', event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cashflow-end">
                                Akhir periode (opsional)
                            </Label>
                            <Input
                                id="cashflow-end"
                                type="date"
                                value={data.period_end}
                                onChange={(event) =>
                                    setData('period_end', event.target.value)
                                }
                            />
                            {errors.period_end && (
                                <p className="text-sm text-destructive">
                                    {errors.period_end}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cashflow-notes">
                            Catatan (opsional)
                        </Label>
                        <Input
                            id="cashflow-notes"
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
                        Buat Kas
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
