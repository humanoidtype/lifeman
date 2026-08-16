import type { ReactNode } from 'react';
import { useFreshData } from '@/hooks/use-fresh-data';

export default function GlobalChromeLayout({
    children,
}: {
    children: ReactNode;
}) {
    useFreshData();

    return <>{children}</>;
}
