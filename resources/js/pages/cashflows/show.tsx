import { Head, router, useForm } from '@inertiajs/react';
import { Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NettoBadge } from '@/components/netto-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, formatMoney } from '@/lib/format';
import { toUrl } from '@/lib/utils';
import {
    store as storeItem,
    update as updateItem,
    destroy as destroyItem,
} from '@/routes/cashflow-items';
import { index } from '@/routes/cashflows';
import type { Cashflow, CashflowItem } from '@/types';

type Props = {
    cashflow: Cashflow;
    items: CashflowItem[];
};

type AddForm = {
    type: 'income' | 'expense';
    name: string;
    amount: string;
    quantity: string;
};

type EditForm = {
    type: 'income' | 'expense';
    name: string;
    amount: string;
    quantity: string;
};

export default function CashflowsShow({ cashflow, items }: Props) {
    const incomeItems = items.filter((item) => item.type === 'income');
    const expenseItems = items.filter((item) => item.type === 'expense');

    const incomeTotal = incomeItems.reduce(
        (sum, item) => sum + Number(item.amount) * item.quantity,
        0,
    );
    const expenseTotal = expenseItems.reduce(
        (sum, item) => sum + Number(item.amount) * item.quantity,
        0,
    );
    const netto = incomeTotal - expenseTotal;

    const [editing, setEditing] = useState<CashflowItem | null>(null);

    return (
        <>
            <Head title={cashflow.title} />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {cashflow.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {(cashflow.period_start &&
                            formatDate(cashflow.period_start)) ||
                            'Mulai kapan saja'}
                        {cashflow.period_end
                            ? ` – ${formatDate(cashflow.period_end)}`
                            : ''}
                        {cashflow.notes ? ` · ${cashflow.notes}` : ''}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Pemasukan</CardDescription>
                            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
                                +{formatMoney(incomeTotal)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Pengeluaran</CardDescription>
                            <CardTitle className="text-2xl text-destructive">
                                −{formatMoney(expenseTotal)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardDescription>Netto</CardDescription>
                            <CardTitle className="text-2xl">
                                {formatMoney(netto)}
                            </CardTitle>
                            <NettoBadge netto={netto} />
                        </CardHeader>
                    </Card>
                </div>

                <IncomeSection cashflowId={cashflow.id} items={incomeItems} onEdit={setEditing} />
                <ExpenseSection cashflowId={cashflow.id} items={expenseItems} onEdit={setEditing} />
            </div>

            {editing && (
                <EditItemDialog
                    item={editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}

function IncomeSection({
    cashflowId,
    items,
    onEdit,
}: {
    cashflowId: number;
    items: CashflowItem[];
    onEdit: (item: CashflowItem) => void;
}) {
    const { data, setData, errors, processing, post, reset } =
        useForm<AddForm>({
            type: 'income',
            name: '',
            amount: '',
            quantity: '1',
        });

    function addItem(): void {
        post(toUrl(storeItem({ cashflow: cashflowId })), {
            onSuccess: () => reset(),
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Pemasukan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {errors.type && (
                    <p className="text-sm text-destructive">{errors.type}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="income-name">Nama</Label>
                        <Input
                            id="income-name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder="Contoh: Gaji"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="income-amount">Nominal</Label>
                        <Input
                            id="income-amount"
                            type="number"
                            min="1"
                            inputMode="numeric"
                            value={data.amount}
                            onChange={(event) =>
                                setData('amount', event.target.value)
                            }
                            placeholder="250000"
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">
                                {errors.amount}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={addItem}
                        disabled={processing}
                        className="self-end"
                    >
                        <Plus className="size-4" />
                        Tambah
                    </Button>
                </div>

                <ItemList
                    items={items}
                    onEdit={onEdit}
                    sign="+"
                    showQuantity={false}
                />
            </CardContent>
        </Card>
    );
}

function ExpenseSection({
    cashflowId,
    items,
    onEdit,
}: {
    cashflowId: number;
    items: CashflowItem[];
    onEdit: (item: CashflowItem) => void;
}) {
    const { data, setData, errors, processing, post, reset } =
        useForm<AddForm>({
            type: 'expense',
            name: '',
            amount: '',
            quantity: '1',
        });

    function addItem(): void {
        post(toUrl(storeItem({ cashflow: cashflowId })), {
            onSuccess: () => reset(),
        });
    }

    function stepQuantity(step: number): void {
        const next = Math.max(Number(data.quantity) + step, 1);

        setData('quantity', String(next));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {errors.type && (
                    <p className="text-sm text-destructive">{errors.type}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="expense-name">Nama</Label>
                        <Input
                            id="expense-name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder="Contoh: Bensin"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="expense-amount">Nominal</Label>
                        <Input
                            id="expense-amount"
                            type="number"
                            min="1"
                            inputMode="numeric"
                            value={data.amount}
                            onChange={(event) =>
                                setData('amount', event.target.value)
                            }
                            placeholder="50000"
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">
                                {errors.amount}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="expense-quantity">Jumlah</Label>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="size-9 shrink-0"
                                onClick={() => stepQuantity(-1)}
                            >
                                <Minus className="size-4" />
                            </Button>
                            <Input
                                id="expense-quantity"
                                type="number"
                                min="1"
                                inputMode="numeric"
                                value={data.quantity}
                                onChange={(event) =>
                                    setData('quantity', event.target.value)
                                }
                                className="w-16 text-center"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="size-9 shrink-0"
                                onClick={() => stepQuantity(1)}
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        {errors.quantity && (
                            <p className="text-sm text-destructive">
                                {errors.quantity}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={addItem}
                        disabled={processing}
                        className="self-end"
                    >
                        <Plus className="size-4" />
                        Tambah
                    </Button>
                </div>

                <ItemList
                    items={items}
                    onEdit={onEdit}
                    sign="−"
                    showQuantity
                />
            </CardContent>
        </Card>
    );
}

function ItemList({
    items,
    onEdit,
    sign,
    showQuantity,
}: {
    items: CashflowItem[];
    onEdit: (item: CashflowItem) => void;
    sign: string;
    showQuantity: boolean;
}) {
    function removeItem(item: CashflowItem): void {
        if (window.confirm(`Hapus item "${item.name}"?`)) {
            router.delete(toUrl(destroyItem({ cashflow_item: item.id })));
        }
    }

    if (items.length === 0) {
        return (
            <p className="py-2 text-sm text-muted-foreground">
                Belum ada item. Tambahkan di atas.
            </p>
        );
    }

    return (
        <div className="grid gap-2">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors duration-200 hover:bg-muted/50"
                >
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {showQuantity &&
                                `${item.quantity} × `}
                            {sign}
                            {formatMoney(item.amount)}
                            {showQuantity &&
                                item.quantity > 1 &&
                                ` = ${sign}${formatMoney(
                                    Number(item.amount) * item.quantity,
                                )}`}
                        </p>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(item)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item)}
                    >
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            ))}
        </div>
    );
}

function EditItemDialog({
    item,
    onClose,
}: {
    item: CashflowItem;
    onClose: () => void;
}) {
    const { data, setData, errors, processing, patch } = useForm<EditForm>({
        type: item.type,
        name: item.name,
        amount: String(Number(item.amount)),
        quantity: String(item.quantity),
    });

    function submit(): void {
        patch(toUrl(updateItem({ cashflow_item: item.id })), {
            onSuccess: onClose,
        });
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Nama</Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">Nominal</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                min="1"
                                inputMode="numeric"
                                value={data.amount}
                                onChange={(event) =>
                                    setData('amount', event.target.value)
                                }
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">
                                    {errors.amount}
                                </p>
                            )}
                        </div>
                        {item.type === 'expense' && (
                            <div className="grid gap-2">
                                <Label htmlFor="edit-quantity">Jumlah</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    min="1"
                                    inputMode="numeric"
                                    value={data.quantity}
                                    onChange={(event) =>
                                        setData(
                                            'quantity',
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-destructive">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button onClick={submit} disabled={processing}>
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

CashflowsShow.layout = {
    breadcrumbs: [
        {
            title: 'Kas',
            href: toUrl(index()),
        },
    ],
};