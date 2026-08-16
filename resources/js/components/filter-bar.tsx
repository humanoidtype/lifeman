import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type FilterOption = {
    value: string;
    label: string;
};

type Props = {
    url: string;
    search?: string;
    status?: string;
    sort?: string;
    statusOptions?: FilterOption[];
    sortOptions?: FilterOption[];
    statusPlaceholder?: string;
    sortPlaceholder?: string;
};

export function FilterBar({
    url,
    search: initialSearch = '',
    status: initialStatus = '',
    sort: initialSort = '',
    statusOptions = [],
    sortOptions = [],
    statusPlaceholder = 'Semua status',
    sortPlaceholder = 'Urutan',
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    const [sort, setSort] = useState(initialSort);
    const [synced, setSynced] = useState({
        search: initialSearch,
        status: initialStatus,
        sort: initialSort,
    });

    if (
        synced.search !== initialSearch ||
        synced.status !== initialStatus ||
        synced.sort !== initialSort
    ) {
        setSynced({
            search: initialSearch,
            status: initialStatus,
            sort: initialSort,
        });
        setSearch(initialSearch);
        setStatus(initialStatus);
        setSort(initialSort);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                url,
                {
                    search: search || undefined,
                    status: status || undefined,
                    sort: sort || undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search, status, sort, url]);

    return (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari…"
                    className="pl-9"
                />
            </div>

            {statusOptions.length > 0 && (
                <div className="grid gap-1.5">
                    <Label className="sr-only">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder={statusPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {statusPlaceholder}
                            </SelectItem>
                            {statusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {sortOptions.length > 0 && (
                <div className="grid gap-1.5">
                    <Label className="sr-only">Urutan</Label>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder={sortPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">
                                {sortPlaceholder}
                            </SelectItem>
                            {sortOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
