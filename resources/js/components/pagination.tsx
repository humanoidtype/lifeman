import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types';

function decodeLabel(label: string): string {
    return label
        .replaceAll('&laquo;', '«')
        .replaceAll('&raquo;', '»')
        .replaceAll('&hellip;', '…');
}

export function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null;
    }

    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    return (
        <nav className="flex items-center justify-center gap-1">
            {prev.url ? (
                <Link
                    href={prev.url}
                    preserveScroll
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Sebelumnya"
                >
                    <ChevronLeft className="size-4" />
                </Link>
            ) : (
                <span className="flex size-9 cursor-not-allowed items-center justify-center rounded-lg text-muted-foreground/40">
                    <ChevronLeft className="size-4" />
                </span>
            )}

            {pages.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        preserveScroll
                        className={cn(
                            'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
                            link.active &&
                                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                        )}
                    >
                        {decodeLabel(link.label)}
                    </Link>
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="flex size-9 items-center justify-center text-sm text-muted-foreground"
                    >
                        {decodeLabel(link.label)}
                    </span>
                ),
            )}

            {next.url ? (
                <Link
                    href={next.url}
                    preserveScroll
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Berikutnya"
                >
                    <ChevronRight className="size-4" />
                </Link>
            ) : (
                <span className="flex size-9 cursor-not-allowed items-center justify-center rounded-lg text-muted-foreground/40">
                    <ChevronRight className="size-4" />
                </span>
            )}
        </nav>
    );
}
