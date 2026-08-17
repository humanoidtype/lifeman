import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import {
    ArrowLeft,
    Banknote,
    Check,
    Loader2,
    Lock,
    Pencil,
    Plus,
    Trash2,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDate, formatMoney, formatPercent } from '@/lib/format';
import { cn, toUrl } from '@/lib/utils';
import {
    destroy as destroyTransaction,
    store as storeTransaction,
    update as updateTransaction,
} from '@/routes/business-transactions';
import { close as closeBusiness, index } from '@/routes/businesses';
import type {
    Business,
    BusinessFormula,
    LedgerDay,
    LedgerRow,
    LrChartPoint,
    LrSummary,
} from '@/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
);

const typeLabels: Record<LedgerRow['type'], string> = {
    initial_capital: 'Modal awal',
    daily_modal: 'Modal harian',
    income: 'Pendapatan',
    expense_small: 'Pengeluaran kecil',
    expense_big: 'Pengeluaran besar',
    opening_balance: 'Saldo awal kas',
};

const categoryLabels: Record<string, string> = {
    raw_material: 'Bahan baku',
    operational: 'Operasional',
    marketing: 'Marketing',
    pre_operational: 'Modal pra-operasional',
};

const formulaLabels: Record<string, string> = {
    fb_a: 'F&B Opsi A',
    fb_b: 'F&B Opsi B',
    custom: 'Custom',
};

const rekapLabels: Record<string, string> = {
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
};

type Props = {
    business: Business & { formula: BusinessFormula };
    ledger: { rows: LedgerRow[]; days: LedgerDay[] };
    days: { date: string; balance: number }[];
    periods: {
        key: string;
        start: string;
        end: string;
        active: boolean;
        completed: boolean;
    }[];
    current_period: { start: string; end: string };
    lr: LrSummary;
    lr_chart: LrChartPoint[];
    kas_opened_at: string | null;
};

const reloadProps = {
    only: ['ledger', 'days', 'lr', 'lr_chart', 'kas_opened_at'],
    preserveScroll: true,
} satisfies { only: string[]; preserveScroll: boolean };

type AmountForm = {
    type: string;
    date: string;
    name: string;
    amount: string;
    initial_capital?: string;
    pre_operational_amount?: string;
};

type DailyForm = {
    type: string;
    date: string;
    name: string;
    amount: string;
};

type DailyModalForm = {
    type: string;
    date: string;
    name: string;
    amount: string;
    daily_modal?: string;
};

type ExpenseForm = {
    type: string;
    date: string;
    name: string;
    category: string;
    amount: string;
};

export default function BusinessesShow({
    business,
    ledger,
    days,
    periods,
    current_period,
    lr,
    lr_chart,
    kas_opened_at,
}: Props) {
    const today = new Date().toISOString().slice(0, 10);
    const [filterDate, setFilterDate] = useState<string | null>(null);
    const [editingCapital, setEditingCapital] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<LedgerRow | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [closeOpen, setCloseOpen] = useState(false);
    const [closing, setClosing] = useState(false);

    const initialCapital = ledger.rows.find(
        (row) => row.type === 'initial_capital',
    );
    const modalAwal = initialCapital?.income ?? 0;
    const totalLaba = lr_chart.reduce((sum, point) => sum + point.profit, 0);

    const rows = filterDate
        ? ledger.rows.filter((row) => row.date === filterDate)
        : ledger.rows;

    const dayGroups = useMemo(() => {
        const groups = new Map<string, LedgerRow[]>();

        rows.forEach((row) => {
            const group = groups.get(row.date) ?? [];
            group.push(row);
            groups.set(row.date, group);
        });

        return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    }, [rows]);

    const dayTotals = useMemo(() => {
        const totals = new Map<string, { income: number; expense: number }>();

        rows.forEach((row) => {
            const current = totals.get(row.date) ?? {
                income: 0,
                expense: 0,
            };
            totals.set(row.date, {
                income: current.income + row.income,
                expense: current.expense + row.expense,
            });
        });

        return totals;
    }, [rows]);

    const lastBalance = rows.length > 0 ? rows[rows.length - 1].balance : 0;

    function confirmDelete(): void {
        if (!pendingDelete) {
            return;
        }

        router.delete(
            toUrl(
                destroyTransaction({
                    business_transaction: pendingDelete.id,
                }),
            ),
            {
                ...reloadProps,
                onStart: () => setDeleting(true),
                onFinish: () => {
                    setDeleting(false);
                    setPendingDelete(null);
                },
            },
        );
    }

    function closeKas(): void {
        router.post(
            toUrl(closeBusiness({ business: business.id })),
            undefined,
            {
                ...reloadProps,
                onStart: () => setClosing(true),
                onFinish: () => {
                    setClosing(false);
                    setCloseOpen(false);
                },
            },
        );
    }

    return (
        <>
            <Head title={business.name} />

            <div className="flex flex-col gap-4">
                <div>
                    <Link
                        href={toUrl(index())}
                        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Manajemen Bisnis
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {business.name}
                        </h1>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="secondary">
                            Rekap {rekapLabels[business.rekap_period]}
                        </Badge>
                        <Badge variant="secondary">
                            {formulaLabels[business.formula_type ?? ''] ??
                                'Rumus'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Mulai {formatDate(business.period_start)} · Arus kas{' '}
                            {formatMoney(lastBalance)}
                        </span>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <InitialCapitalCard
                        business={business}
                        capital={initialCapital ?? null}
                        editing={editingCapital}
                        setEditing={setEditingCapital}
                    />
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Rumus Bisnis</CardDescription>
                            <CardTitle className="text-base">
                                {
                                    formulaLabels[
                                        business.formula_type ?? 'custom'
                                    ]
                                }
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Bahan baku {business.formula.raw_material}% ·
                                Operasional {business.formula.operational}% ·
                                Marketing {business.formula.marketing}% · Laba{' '}
                                {business.formula.profit}%
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Catat Harian
                        </CardTitle>
                        <CardDescription>
                            Isi modal harian, pendapatan, dan pengeluaran
                            kecilmu hari ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <DailyModalRow business={business} />
                        <IncomeRow business={business} />
                        <SmallExpenseRow business={business} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Pengeluaran Besar
                        </CardTitle>
                        <CardDescription>
                            Belanja material, sewa, atau biaya lain kapan saja.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BigExpenseRow business={business} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Kas Bisnis</CardTitle>
                        <CardDescription>
                            Buku besar berjalan — hanya bisa dihapus, tidak bisa
                            diedit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {ledger.days.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {ledger.days.map((day) => (
                                    <button
                                        key={day.date}
                                        type="button"
                                        onClick={() =>
                                            setFilterDate(
                                                filterDate === day.date
                                                    ? null
                                                    : day.date,
                                            )
                                        }
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-xs transition-colors duration-200',
                                            filterDate === day.date
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'hover:bg-muted/50',
                                        )}
                                    >
                                        {day.date === today
                                            ? 'Hari ini'
                                            : formatDate(day.date)}
                                    </button>
                                ))}
                                {filterDate && (
                                    <button
                                        type="button"
                                        onClick={() => setFilterDate(null)}
                                        className="rounded-full border px-3 py-1 text-xs font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        )}

                        {rows.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Belum ada transaksi tercatat.
                            </p>
                        ) : (
                            <div className="divide-y divide-border">
                                {dayGroups.map(([date, groupRows]) => {
                                    const totals = dayTotals.get(date);

                                    return (
                                        <div key={date} className="py-2">
                                            <div className="flex flex-wrap items-baseline justify-between gap-1 pb-1">
                                                <p className="text-xs font-semibold">
                                                    {date === today
                                                        ? 'Hari ini'
                                                        : formatDate(date)}
                                                </p>
                                                {totals && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Masuk{' '}
                                                        <span className="font-semibold text-emerald-600">
                                                            {formatMoney(
                                                                totals.income,
                                                            )}
                                                        </span>{' '}
                                                        · Keluar{' '}
                                                        <span className="font-semibold text-destructive">
                                                            {formatMoney(
                                                                totals.expense,
                                                            )}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="divide-y divide-border/60">
                                                {groupRows.map((row) => (
                                                    <div key={row.id}>
                                                        {row.type ===
                                                            'opening_balance' && (
                                                            <div className="flex items-center gap-2 py-2">
                                                                <div className="h-px flex-1 border-t border-dashed" />
                                                                <span className="text-[11px] font-medium text-muted-foreground">
                                                                    Kas baru
                                                                    dibuka ·
                                                                    saldo awal{' '}
                                                                    {formatMoney(
                                                                        row.income,
                                                                    )}
                                                                </span>
                                                                <div className="h-px flex-1 border-t border-dashed" />
                                                            </div>
                                                        )}
                                                        <LedgerItem
                                                            row={row}
                                                            onDelete={() =>
                                                                setPendingDelete(
                                                                    row,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Saldo akhir kas
                                </p>
                                <p
                                    className={cn(
                                        'text-2xl font-bold',
                                        lastBalance < 0 && 'text-destructive',
                                    )}
                                >
                                    {formatMoney(lastBalance)}
                                </p>
                                {kas_opened_at && (
                                    <p className="text-xs text-muted-foreground">
                                        Kas dibuka {formatDate(kas_opened_at)}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setCloseOpen(true)}
                                disabled={rows.length === 0}
                            >
                                <Lock className="size-4" />
                                Tutup Transaksi
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {days.length > 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Arus Kas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Line
                                    data={{
                                        labels: days.map((day) =>
                                            new Date(
                                                `${day.date}T00:00:00`,
                                            ).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                            }),
                                        ),
                                        datasets: [
                                            {
                                                label: 'Kas',
                                                data: days.map(
                                                    (day) => day.balance,
                                                ),
                                                borderColor:
                                                    'hsl(var(--primary))',
                                                backgroundColor:
                                                    'hsla(var(--primary) / 0.15)',
                                                fill: true,
                                                tension: 0.3,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                        },
                                        scales: {
                                            y: {
                                                ticks: {
                                                    callback: (value) =>
                                                        new Intl.NumberFormat(
                                                            'id-ID',
                                                            {
                                                                notation:
                                                                    'compact',
                                                            },
                                                        ).format(Number(value)),
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <LrCard
                    business={business}
                    ledgerRows={ledger.rows}
                    periods={periods}
                    current={current_period}
                    lr={lr}
                    lrChart={lr_chart}
                />

                <PaybackCard modalAwal={modalAwal} totalLaba={totalLaba} />
            </div>

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                title="Hapus transaksi"
                description={
                    pendingDelete
                        ? `Hapus "${pendingDelete.name}" ${formatMoney(Math.max(pendingDelete.income, pendingDelete.expense))}?`
                        : undefined
                }
                processing={deleting}
                onConfirm={confirmDelete}
            />

            <ConfirmDialog
                open={closeOpen}
                onOpenChange={setCloseOpen}
                title="Tutup Transaksi"
                description={`Kas akan ditutup dan kas baru dibuka dengan saldo awal ${formatMoney(lastBalance)}. Data kas sebelumnya tetap tersimpan.`}
                confirmLabel="Tutup Kas"
                destructive={false}
                processing={closing}
                onConfirm={closeKas}
            />
        </>
    );
}

function InitialCapitalCard({
    business,
    capital,
    editing,
    setEditing,
}: {
    business: Props['business'];
    capital: LedgerRow | null;
    editing: boolean;
    setEditing: (value: boolean) => void;
}) {
    const createForm = useForm<AmountForm>({
        type: 'initial_capital',
        date: new Date().toISOString().slice(0, 10),
        name: 'Modal awal',
        amount: '',
        pre_operational_amount: '',
    });
    const editForm = useForm<AmountForm>({
        type: 'initial_capital',
        date: new Date().toISOString().slice(0, 10),
        name: 'Modal awal',
        amount: capital ? String(Number(capital.income)) : '',
    });

    function submitCreate(): void {
        createForm.setData({
            ...createForm.data,
            date: new Date().toISOString().slice(0, 10),
        });
        createForm.post(toUrl(storeTransaction({ business: business.id })), {
            ...reloadProps,
            onSuccess: () => {
                createForm.reset();
                setEditing(false);
            },
        });
    }

    function submitEdit(): void {
        if (!capital) {
            return;
        }

        editForm.patch(
            toUrl(updateTransaction({ business_transaction: capital.id })),
            {
                ...reloadProps,
                onSuccess: () => setEditing(false),
            },
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardDescription>Modal Awal</CardDescription>
                <div className="flex items-center gap-2">
                    <CardTitle className="text-3xl">
                        {capital ? formatMoney(capital.income) : '—'}
                    </CardTitle>
                    {capital && (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditing(!editing)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                    )}
                </div>
                <CardDescription>
                    {capital
                        ? 'Uang yang kamu tanamkan di awal bisnis'
                        : 'Catat modal awal untuk mulai menghitung arus kas'}
                </CardDescription>
            </CardHeader>
            {!capital && (
                <CardContent className="grid gap-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="capital-amount">Modal awal</Label>
                            <Input
                                id="capital-amount"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder="1000000"
                                value={createForm.data.amount}
                                onChange={(event) =>
                                    createForm.setData(
                                        'amount',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="pre-operational-amount">
                                Modal pra-operasional (opsional)
                            </Label>
                            <Input
                                id="pre-operational-amount"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                placeholder="0"
                                value={createForm.data.pre_operational_amount}
                                onChange={(event) =>
                                    createForm.setData(
                                        'pre_operational_amount',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Bagian modal yang sudah dipakai untuk kebutuhan awal
                        (peralatan, izin, dsb.) — otomatis tercatat sebagai
                        pengeluaran supaya kas balance.
                    </p>
                    <Button
                        onClick={submitCreate}
                        disabled={
                            createForm.processing || !createForm.data.amount
                        }
                        className="justify-self-end"
                    >
                        {createForm.processing && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        Simpan
                    </Button>
                    {createForm.errors.amount && (
                        <p className="text-sm text-destructive">
                            {createForm.errors.amount}
                        </p>
                    )}
                    {createForm.errors.initial_capital && (
                        <p className="text-sm text-destructive">
                            {createForm.errors.initial_capital}
                        </p>
                    )}
                    {createForm.errors.pre_operational_amount && (
                        <p className="text-sm text-destructive">
                            {createForm.errors.pre_operational_amount}
                        </p>
                    )}
                </CardContent>
            )}
            {capital && editing && (
                <CardContent className="grid grid-cols-[1fr_auto] gap-2">
                    <Input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={editForm.data.amount}
                        onChange={(event) =>
                            editForm.setData('amount', event.target.value)
                        }
                    />
                    <Button onClick={submitEdit} disabled={editForm.processing}>
                        {editForm.processing && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        Ubah
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}

function DailyModalRow({ business }: { business: Props['business'] }) {
    const form = useForm<DailyModalForm>({
        type: 'daily_modal',
        date: new Date().toISOString().slice(0, 10),
        name: 'Modal harian',
        amount: '',
    });

    function submit(): void {
        form.setData({
            type: 'daily_modal',
            date: form.data.date,
            name: 'Modal harian',
            amount: form.data.amount,
        });
        form.post(toUrl(storeTransaction({ business: business.id })), {
            ...reloadProps,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <div className="grid items-end gap-2 rounded-xl bg-muted/40 p-3 sm:grid-cols-[auto_1fr_auto_auto]">
            <div className="flex items-center gap-2">
                <Wallet className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-semibold">Modal harian</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Input
                    type="date"
                    value={form.data.date}
                    onChange={(event) =>
                        form.setData('date', event.target.value)
                    }
                    className="h-9"
                />
                <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="500000"
                    value={form.data.amount}
                    onChange={(event) =>
                        form.setData('amount', event.target.value)
                    }
                    className="h-9"
                />
            </div>
            <Button
                size="sm"
                onClick={submit}
                disabled={form.processing || !form.data.amount}
            >
                {form.processing && <Loader2 className="size-4 animate-spin" />}
                Catat
            </Button>
            {(form.errors.amount || form.errors.daily_modal) && (
                <p className="col-span-full text-sm text-destructive">
                    {form.errors.daily_modal ?? form.errors.amount}
                </p>
            )}
        </div>
    );
}

function IncomeRow({ business }: { business: Props['business'] }) {
    const form = useForm<DailyForm>({
        type: 'income',
        date: new Date().toISOString().slice(0, 10),
        name: '',
        amount: '',
    });

    function submit(): void {
        form.setData({ ...form.data, type: 'income' });
        form.post(toUrl(storeTransaction({ business: business.id })), {
            ...reloadProps,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <div className="grid items-end gap-2 rounded-xl bg-muted/40 p-3 sm:grid-cols-[auto_1fr_auto_auto]">
            <div className="flex items-center gap-2">
                <TrendingUp className="size-4 shrink-0 text-emerald-600" />
                <span className="text-sm font-semibold">Pendapatan</span>
            </div>
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 sm:grid-cols-[1fr_auto_auto]">
                <Input
                    placeholder="Nama (mis. 50 porsi)"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    className="h-9"
                />
                <Input
                    type="date"
                    value={form.data.date}
                    onChange={(event) =>
                        form.setData('date', event.target.value)
                    }
                    className="h-9"
                />
                <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Nominal"
                    value={form.data.amount}
                    onChange={(event) =>
                        form.setData('amount', event.target.value)
                    }
                    className="h-9"
                />
            </div>
            <Button
                size="sm"
                onClick={submit}
                disabled={
                    form.processing || !form.data.name || !form.data.amount
                }
            >
                {form.processing && <Loader2 className="size-4 animate-spin" />}
                Catat
            </Button>
            {(form.errors.name || form.errors.amount) && (
                <p className="col-span-full text-sm text-destructive">
                    {form.errors.name ?? form.errors.amount}
                </p>
            )}
        </div>
    );
}

function SmallExpenseRow({ business }: { business: Props['business'] }) {
    const form = useForm<ExpenseForm>({
        type: 'expense_small',
        date: new Date().toISOString().slice(0, 10),
        name: '',
        category: '',
        amount: '',
    });

    function submit(): void {
        form.setData({ ...form.data, type: 'expense_small' });
        form.post(toUrl(storeTransaction({ business: business.id })), {
            ...reloadProps,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <div className="grid items-end gap-2 rounded-xl bg-muted/40 p-3 sm:grid-cols-[auto_1fr_auto_auto]">
            <div className="flex items-center gap-2">
                <Banknote className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-semibold">Pengeluaran kecil</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Input
                    placeholder="Nama"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    className="h-9"
                />
                <Select
                    value={form.data.category}
                    onValueChange={(value) => form.setData('category', value)}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(categoryLabels).map(
                            ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    value={form.data.date}
                    onChange={(event) =>
                        form.setData('date', event.target.value)
                    }
                    className="h-9"
                />
                <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Nominal"
                    value={form.data.amount}
                    onChange={(event) =>
                        form.setData('amount', event.target.value)
                    }
                    className="h-9"
                />
            </div>
            <Button
                size="sm"
                onClick={submit}
                disabled={
                    form.processing ||
                    !form.data.name ||
                    !form.data.amount ||
                    !form.data.category
                }
            >
                {form.processing && <Loader2 className="size-4 animate-spin" />}
                Catat
            </Button>
            {(form.errors.name ||
                form.errors.amount ||
                form.errors.category) && (
                <p className="col-span-full text-sm text-destructive">
                    {form.errors.name ??
                        form.errors.amount ??
                        form.errors.category}
                </p>
            )}
        </div>
    );
}

function BigExpenseRow({ business }: { business: Props['business'] }) {
    const form = useForm<ExpenseForm>({
        type: 'expense_big',
        date: new Date().toISOString().slice(0, 10),
        name: '',
        category: '',
        amount: '',
    });

    function submit(): void {
        form.setData({ ...form.data, type: 'expense_big' });
        form.post(toUrl(storeTransaction({ business: business.id })), {
            ...reloadProps,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <div className="grid items-end gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
            <Input
                placeholder="Nama (mis. Belanja bahan baku seminggu)"
                value={form.data.name}
                onChange={(event) => form.setData('name', event.target.value)}
            />
            <Select
                value={form.data.category}
                onValueChange={(value) => form.setData('category', value)}
            >
                <SelectTrigger className="sm:w-44">
                    <SelectValue placeholder="Jenis pengeluaran" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="date"
                value={form.data.date}
                onChange={(event) => form.setData('date', event.target.value)}
                className="sm:w-40"
            />
            <Input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Nominal"
                value={form.data.amount}
                onChange={(event) => form.setData('amount', event.target.value)}
                className="sm:w-40"
            />
            <Button
                onClick={submit}
                disabled={
                    form.processing ||
                    !form.data.name ||
                    !form.data.amount ||
                    !form.data.category
                }
            >
                {form.processing ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Plus className="size-4" />
                )}
                Catat
            </Button>
            {(form.errors.name ||
                form.errors.amount ||
                form.errors.category) && (
                <p className="col-span-full text-sm text-destructive">
                    {form.errors.name ??
                        form.errors.amount ??
                        form.errors.category}
                </p>
            )}
        </div>
    );
}

function LedgerItem({
    row,
    onDelete,
}: {
    row: LedgerRow;
    onDelete: () => void;
}) {
    const isBig = row.type === 'expense_big';
    const isCapital = row.type === 'initial_capital';
    const isDailyModal = row.type === 'daily_modal';
    const isOpening = row.type === 'opening_balance';

    return (
        <div
            className={cn(
                'flex items-center gap-2 py-2',
                (isBig || isCapital || isOpening) && 'font-semibold',
            )}
        >
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm">{row.name}</p>
                    <Badge
                        variant={
                            isCapital || isOpening ? 'default' : 'secondary'
                        }
                        className="text-[10px]"
                    >
                        {typeLabels[row.type]}
                    </Badge>
                    {row.category && (
                        <span className="text-[11px] text-muted-foreground">
                            {categoryLabels[row.category]}
                        </span>
                    )}
                </div>
            </div>
            <div className="text-right">
                {row.income > 0 && (
                    <p className="text-sm font-semibold text-emerald-600">
                        +{formatMoney(row.income)}
                    </p>
                )}
                {row.expense > 0 && (
                    <p className="text-sm">-{formatMoney(row.expense)}</p>
                )}
                {isDailyModal && (
                    <p className="text-[11px] text-muted-foreground">
                        netto 0 (keluar masuk kas)
                    </p>
                )}
                {isOpening && (
                    <p className="text-[11px] text-muted-foreground">
                        saldo mengalir dari kas sebelumnya
                    </p>
                )}
            </div>
            <div className="w-24 text-right">
                <p
                    className={cn(
                        'text-sm font-semibold',
                        row.balance < 0 && 'text-destructive',
                    )}
                >
                    {formatMoney(row.balance)}
                </p>
            </div>
            <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                className="size-8"
            >
                <Trash2 className="size-4 text-destructive" />
            </Button>
        </div>
    );
}

function PaybackCard({
    modalAwal,
    totalLaba,
}: {
    modalAwal: number;
    totalLaba: number;
}) {
    if (modalAwal <= 0) {
        return null;
    }

    const percent = Math.min(Math.max((totalLaba / modalAwal) * 100, 0), 100);
    const remaining = Math.max(modalAwal - totalLaba, 0);
    const reached = totalLaba >= modalAwal;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Balik Modal</CardTitle>
                <CardDescription>
                    Seberapa jauh laba sudah menutup modal awal{' '}
                    {formatMoney(modalAwal)}.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold">
                        {formatPercent(percent)}
                    </span>
                    <span className="text-muted-foreground">
                        {formatMoney(Math.max(totalLaba, 0))} dari{' '}
                        {formatMoney(modalAwal)}
                    </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-700',
                            reached ? 'bg-emerald-500' : 'bg-primary',
                        )}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p
                    className={cn(
                        'text-sm',
                        reached && 'font-medium text-emerald-600',
                    )}
                >
                    {reached
                        ? 'Sudah balik modal, mantap!'
                        : `Kurang ${formatMoney(remaining)} lagi`}
                </p>
            </CardContent>
        </Card>
    );
}

function LrCard({
    business,
    ledgerRows,
    periods,
    current,
    lr,
    lrChart,
}: {
    business: Props['business'];
    ledgerRows: LedgerRow[];
    periods: Props['periods'];
    current: Props['current_period'];
    lr: LrSummary;
    lrChart: LrChartPoint[];
}) {
    const [selected, setSelected] = useState<string>(current.start);
    const isCurrent = selected === current.start;

    const selectedPeriod =
        periods.find((period) => period.start === selected) ?? null;

    const displayed = useMemo(() => {
        if (isCurrent) {
            return lr;
        }

        return computeLr(
            ledgerRows,
            selectedPeriod?.start ?? selected,
            selectedPeriod?.end ?? selectedPeriod?.start ?? selected,
        );
    }, [isCurrent, selected, selectedPeriod, ledgerRows, lr]);

    const completedPeriods = periods.filter((period) => period.completed);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-base">Logic L/R</CardTitle>
                        <CardDescription>
                            {formatDate(displayed.start)} –{' '}
                            {formatDate(displayed.end)}
                        </CardDescription>
                    </div>
                    {completedPeriods.length > 0 && (
                        <Select value={selected} onValueChange={setSelected}>
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Pilih periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={current.start}>
                                    Periode berjalan
                                </SelectItem>
                                {completedPeriods.map((period) => (
                                    <SelectItem
                                        key={period.key}
                                        value={period.start}
                                    >
                                        {formatDate(period.start)} –{' '}
                                        {formatDate(period.end)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-3">
                        <p className="text-xs text-muted-foreground">
                            Pendapatan
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {formatMoney(displayed.income)}
                        </p>
                    </div>
                    <div className="rounded-xl border p-3">
                        <p className="text-xs text-muted-foreground">
                            Total pengeluaran
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                            {formatMoney(displayed.total_expense)}
                        </p>
                    </div>
                </div>

                <div className="grid gap-2">
                    {Object.entries(categoryLabels).map(([key, label]) => {
                        const actual =
                            displayed.expenses[
                                key as keyof typeof displayed.expenses
                            ];
                        const expected =
                            business.formula[key as keyof BusinessFormula] ?? 0;
                        const actualPct =
                            displayed.income > 0
                                ? (actual / displayed.income) * 100
                                : 0;
                        const diff = actualPct - expected;
                        const hasFormula = key in business.formula;

                        return (
                            <div
                                key={key}
                                className="flex items-center justify-between gap-2 text-sm"
                            >
                                <span className="text-muted-foreground">
                                    {label}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            'font-semibold',
                                            hasFormula &&
                                                displayed.income > 0 &&
                                                Math.abs(diff) > 2 &&
                                                (diff > 0
                                                    ? 'text-destructive'
                                                    : 'text-emerald-600'),
                                        )}
                                    >
                                        {formatMoney(actual)}
                                    </span>
                                    <span className="w-24 text-right text-xs text-muted-foreground">
                                        {hasFormula ? (
                                            <>
                                                {actualPct.toFixed(1)}% / rumus{' '}
                                                {expected}%
                                            </>
                                        ) : (
                                            `${actualPct.toFixed(1)}% dari pendapatan`
                                        )}
                                    </span>
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div
                    className={cn(
                        'flex items-center justify-between rounded-xl p-3',
                        displayed.profit >= 0
                            ? 'bg-emerald-500/10'
                            : 'bg-destructive/10',
                    )}
                >
                    <span className="text-sm font-medium">Laba / Rugi</span>
                    <span
                        className={cn(
                            'text-2xl font-bold',
                            displayed.profit >= 0
                                ? 'text-emerald-600'
                                : 'text-destructive',
                        )}
                    >
                        {formatMoney(displayed.profit)}
                    </span>
                </div>

                {isCurrent && displayed.analysis.length > 0 && (
                    <ul className="grid gap-1.5">
                        {displayed.analysis.map((line) => (
                            <li
                                key={line}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {line}
                            </li>
                        ))}
                    </ul>
                )}

                {lrChart.length > 1 && (
                    <div className="h-64">
                        <Line
                            data={{
                                labels: lrChart.map((point) =>
                                    new Date(
                                        `${point.start}T00:00:00`,
                                    ).toLocaleDateString('id-ID', {
                                        month: 'short',
                                        year: '2-digit',
                                    }),
                                ),
                                datasets: [
                                    {
                                        label: 'Laba aktual',
                                        data: lrChart.map(
                                            (point) => point.profit,
                                        ),
                                        borderColor: 'hsl(var(--primary))',
                                        backgroundColor:
                                            'hsla(var(--primary) / 0.15)',
                                        fill: true,
                                        tension: 0.3,
                                    },
                                    {
                                        label: 'Target laba',
                                        data: lrChart.map(
                                            (point) => point.target_profit,
                                        ),
                                        borderColor:
                                            'hsl(var(--muted-foreground))',
                                        borderDash: [5, 5],
                                        fill: false,
                                        tension: 0.3,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { boxWidth: 12 },
                                    },
                                },
                                scales: {
                                    y: {
                                        ticks: {
                                            callback: (value) =>
                                                new Intl.NumberFormat('id-ID', {
                                                    notation: 'compact',
                                                }).format(Number(value)),
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function computeLr(
    rows: LedgerRow[],
    start: string,
    end: string,
): Pick<
    LrSummary,
    | 'start'
    | 'end'
    | 'income'
    | 'expenses'
    | 'total_expense'
    | 'profit'
    | 'analysis'
> {
    let income = 0;
    const expenses = {
        raw_material: 0,
        operational: 0,
        marketing: 0,
        pre_operational: 0,
    };

    rows.forEach((row) => {
        if (row.date < start || row.date > end) {
            return;
        }

        if (row.type === 'income') {
            income += row.income;
        } else if (row.type === 'expense_small' || row.type === 'expense_big') {
            if (row.category) {
                expenses[row.category] += row.expense;
            }
        }
    });

    const total_expense =
        expenses.raw_material +
        expenses.operational +
        expenses.marketing +
        expenses.pre_operational;

    return {
        start,
        end,
        income: Math.round(income * 100) / 100,
        expenses: {
            raw_material: Math.round(expenses.raw_material * 100) / 100,
            operational: Math.round(expenses.operational * 100) / 100,
            marketing: Math.round(expenses.marketing * 100) / 100,
            pre_operational: Math.round(expenses.pre_operational * 100) / 100,
        },
        total_expense: Math.round(total_expense * 100) / 100,
        profit: Math.round((income - total_expense) * 100) / 100,
        analysis: [],
    };
}

BusinessesShow.layout = {
    breadcrumbs: [
        {
            title: 'Bisnis',
            href: toUrl(index()),
        },
    ],
};
