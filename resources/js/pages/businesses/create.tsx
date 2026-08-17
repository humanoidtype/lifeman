import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Check } from 'lucide-react';
import { useState } from 'react';
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
import { cn, toUrl } from '@/lib/utils';
import { index, store } from '@/routes/businesses';
import type { BusinessFormula } from '@/types';

const PERIODS = [
    {
        value: 'weekly',
        label: 'Minggu',
        hint: '7 hari berjalan dari periode mulai',
    },
    { value: 'monthly', label: 'Bulan', hint: 'Mengikuti bulan kalender' },
    { value: 'yearly', label: 'Tahun', hint: 'Mengikuti tahun kalender' },
] as const;

const FORMULAS = [
    {
        value: 'fb_a',
        title: 'F&B Opsi A',
        description: 'Untuk usaha makanan/minuman skala kecil',
        preset: { raw_material: 40, operational: 35, marketing: 5, profit: 20 },
    },
    {
        value: 'fb_b',
        title: 'F&B Opsi B',
        description:
            'Untuk usaha makanan/minuman dengan bahan baku lebih besar',
        preset: {
            raw_material: 30,
            operational: 45,
            marketing: 10,
            profit: 15,
        },
    },
    {
        value: 'custom',
        title: 'Custom',
        description: 'Tentukan sendiri persentase rumusmu',
        preset: { raw_material: 40, operational: 35, marketing: 5, profit: 20 },
    },
] as const;

const disabledFormula = {
    value: 'service',
    title: 'Industri Jasa',
    description: 'Tersedia di update berikutnya',
};

const presetByType: Record<string, BusinessFormula> = Object.fromEntries(
    FORMULAS.map((f) => [f.value, f.preset]),
);

type CreateForm = {
    name: string;
    rekap_period: string;
    period_start: string;
    formula_type: string;
    raw_material_pct: string;
    operational_pct: string;
    marketing_pct: string;
    profit_pct: string;
};

function presetToForm(preset: BusinessFormula): CreateForm {
    return {
        name: '',
        rekap_period: 'weekly',
        period_start: new Date().toISOString().slice(0, 10),
        formula_type: 'fb_a',
        raw_material_pct: String(preset.raw_material),
        operational_pct: String(preset.operational),
        marketing_pct: String(preset.marketing),
        profit_pct: String(preset.profit),
    };
}

export default function BusinessesCreate() {
    const { data, setData, errors, processing, post } = useForm<CreateForm>(
        presetToForm(presetByType.fb_a),
    );

    const [customError, setCustomError] = useState<string | null>(null);

    const isCustom = data.formula_type === 'custom';
    const preset = presetByType[data.formula_type];

    const pctSum = [
        data.raw_material_pct,
        data.operational_pct,
        data.marketing_pct,
        data.profit_pct,
    ].reduce((sum, value) => sum + (Number(value) || 0), 0);

    const endDate = computeEndDate(data.rekap_period, data.period_start);

    function selectFormula(type: string): void {
        if (type === disabledFormula.value) {
            return;
        }

        setCustomError(null);

        if (type === 'custom') {
            const current =
                presetByType[data.formula_type] ?? presetByType.fb_a;
            setData({
                ...data,
                formula_type: 'custom',
                raw_material_pct: String(current.raw_material),
                operational_pct: String(current.operational),
                marketing_pct: String(current.marketing),
                profit_pct: String(current.profit),
            });

            return;
        }

        setData({ ...data, formula_type: type });
    }

    function submit(): void {
        if (isCustom && Math.abs(pctSum - 100) > 0.01) {
            setCustomError(
                `Total persentase rumus harus 100% (sekarang ${pctSum.toFixed(2)}%).`,
            );

            return;
        }

        post(toUrl(store()));
    }

    return (
        <>
            <Head title="Bisnis Baru" />

            <div className="flex flex-col gap-4">
                <div>
                    <Link
                        href={toUrl(index())}
                        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Manajemen Bisnis
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Bisnis Baru
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Siapkan nama, periode rekap, dan rumus bisnismu.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Informasi Bisnis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="business-name">Nama Bisnis</Label>
                            <Input
                                id="business-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Contoh: Warung Nasi Bu Ani"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Rekap data per?</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {PERIODS.map((period) => (
                                    <button
                                        key={period.value}
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'rekap_period',
                                                period.value,
                                            )
                                        }
                                        className={cn(
                                            'rounded-xl border p-3 text-left transition-colors duration-200',
                                            data.rekap_period === period.value
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:bg-muted/50',
                                        )}
                                    >
                                        <span className="text-sm font-semibold">
                                            {period.label}
                                        </span>
                                        <span className="mt-1 block text-[11px] text-muted-foreground">
                                            {period.hint}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="period-start">Periode mulai</Label>
                            <Input
                                id="period-start"
                                type="date"
                                value={data.period_start}
                                onChange={(event) =>
                                    setData('period_start', event.target.value)
                                }
                            />
                            {data.period_start && (
                                <p className="text-xs text-muted-foreground">
                                    Periode pertama:{' '}
                                    <span className="font-semibold text-foreground">
                                        {formatPeriodDate(data.period_start)} –{' '}
                                        {formatPeriodDate(endDate)}
                                    </span>
                                </p>
                            )}
                            {errors.period_start && (
                                <p className="text-sm text-destructive">
                                    {errors.period_start}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Rumus Bisnis
                        </CardTitle>
                        <CardDescription>
                            Perbandingan persentase pengeluaran terhadap
                            pendapatan, dipakai untuk analisis laba/rugi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                            {FORMULAS.map((formula) => (
                                <FormulaOption
                                    key={formula.value}
                                    title={formula.title}
                                    description={formula.description}
                                    preset={formula.preset}
                                    selected={
                                        data.formula_type === formula.value
                                    }
                                    disabled={false}
                                    onClick={() => selectFormula(formula.value)}
                                />
                            ))}
                            <FormulaOption
                                title={disabledFormula.title}
                                description={disabledFormula.description}
                                preset={null}
                                selected={false}
                                disabled
                                onClick={() =>
                                    selectFormula(disabledFormula.value)
                                }
                            />
                        </div>

                        {isCustom && (
                            <div className="grid gap-3 rounded-xl border bg-muted/30 p-3">
                                {[
                                    {
                                        key: 'raw_material_pct' as const,
                                        label: 'Bahan baku (%)',
                                    },
                                    {
                                        key: 'operational_pct' as const,
                                        label: 'Operasional (%)',
                                    },
                                    {
                                        key: 'marketing_pct' as const,
                                        label: 'Marketing (%)',
                                    },
                                    {
                                        key: 'profit_pct' as const,
                                        label: 'Laba (%)',
                                    },
                                ].map((field) => (
                                    <div
                                        key={field.key}
                                        className="grid grid-cols-2 items-center gap-2"
                                    >
                                        <Label
                                            htmlFor={`custom-${field.key}`}
                                            className="text-sm"
                                        >
                                            {field.label}
                                        </Label>
                                        <Input
                                            id={`custom-${field.key}`}
                                            type="number"
                                            min="0"
                                            max="100"
                                            inputMode="numeric"
                                            value={data[field.key]}
                                            onChange={(event) => {
                                                setData(
                                                    field.key,
                                                    event.target.value,
                                                );
                                                setCustomError(null);
                                            }}
                                        />
                                    </div>
                                ))}
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        Math.abs(pctSum - 100) > 0.01
                                            ? 'text-destructive'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    Total: {pctSum.toFixed(2)}%{' '}
                                    {Math.abs(pctSum - 100) <= 0.01 &&
                                        '— sudah 100%'}
                                </p>
                                {(customError || errors.profit_pct) && (
                                    <p className="text-sm text-destructive">
                                        {customError ?? errors.profit_pct}
                                    </p>
                                )}
                            </div>
                        )}

                        {!isCustom && preset && (
                            <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2.5 text-sm">
                                <Briefcase className="size-4 shrink-0 text-primary" />
                                <span className="text-muted-foreground">
                                    Persentase:{' '}
                                    <span className="font-semibold text-foreground">
                                        Bahan baku {preset.raw_material}% ·
                                        Operasional {preset.operational}% ·
                                        Marketing {preset.marketing}% · Laba{' '}
                                        {preset.profit}%
                                    </span>
                                </span>
                            </div>
                        )}

                        {errors.formula_type && (
                            <p className="text-sm text-destructive">
                                {errors.formula_type}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                        <Link href={toUrl(index())}>Batal</Link>
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={processing}
                        className="flex-1"
                    >
                        Buat Bisnis
                    </Button>
                </div>
            </div>
        </>
    );
}

function FormulaOption({
    title,
    description,
    preset,
    selected,
    disabled,
    onClick,
}: {
    title: string;
    description: string;
    preset: BusinessFormula | null;
    selected: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'relative rounded-xl border p-3 text-left transition-colors duration-200',
                selected
                    ? 'border-primary bg-primary/5'
                    : disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-muted/50',
            )}
        >
            {selected && (
                <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                </span>
            )}
            <span className="text-sm font-semibold">{title}</span>
            <span className="mt-1 block text-[11px] text-muted-foreground">
                {description}
            </span>
            {preset && (
                <span className="mt-2 block text-[11px] text-muted-foreground">
                    {preset.raw_material}/{preset.operational}/
                    {preset.marketing}/{preset.profit}
                </span>
            )}
        </button>
    );
}

function computeEndDate(period: string, start: string): string {
    if (!start) {
        return '';
    }

    const [year, month, day] = start.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (period === 'weekly') {
        date.setDate(date.getDate() + 6);
    } else if (period === 'monthly') {
        date.setMonth(date.getMonth() + 1, 0);
    } else if (period === 'yearly') {
        date.setMonth(11, 31);
    }

    return formatDateKey(date);
}

function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatPeriodDate(value: string): string {
    if (!value) {
        return '—';
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

BusinessesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Bisnis',
            href: toUrl(index()),
        },
    ],
};
