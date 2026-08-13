export function formatMoney(value: number | string | null | undefined): string {
    const amount = typeof value === 'string' ? Number(value) : (value ?? 0);

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('id-ID', {
        dateStyle: 'medium',
    });
}

export function formatPercent(value: number): string {
    return `${Math.min(Math.round(value), 100)}%`;
}
