import { Link, router, usePage } from '@inertiajs/react';
import { Briefcase, Home, Settings, User } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as businessesIndex } from '@/routes/businesses';
import { index as personalIndex } from '@/routes/personal';
import profile from '@/routes/profile';

const items = [
    { title: 'Beranda', icon: Home, href: dashboard() },
    { title: 'Pribadi', icon: User, href: personalIndex() },
    { title: 'Bisnis', icon: Briefcase, href: businessesIndex() },
    { title: 'Pengaturan', icon: Settings, href: profile.edit() },
];

const baseUrl = 'http://life-man.test';
const CACHE_FOR = '60s';

export function BottomNav() {
    const page = usePage();
    const pathname = new URL(page.url, baseUrl).pathname;
    const urlRef = useRef(page.url);

    useEffect(() => {
        urlRef.current = page.url;
    }, [page.url]);

    useEffect(() => {
        const offFinish = router.on('finish', () => {
            const currentPath = new URL(urlRef.current, baseUrl).pathname;

            items.forEach((item) => {
                const href = toUrl(item.href);
                const targetPath = new URL(href, baseUrl).pathname;

                if (targetPath !== currentPath) {
                    router.prefetch(href, {}, { cacheFor: CACHE_FOR });
                }
            });
        });

        return offFinish;
    }, []);

    function isActive(href: string): boolean {
        const target = new URL(href, baseUrl);

        return pathname === target.pathname;
    }

    return (
        <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
            <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1.5 shadow-sm">
                {items.map((item) => (
                    <Link
                        key={item.title}
                        href={toUrl(item.href)}
                        prefetch="mount"
                        cacheFor={CACHE_FOR}
                        className={cn(
                            'flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:px-5',
                            isActive(toUrl(item.href)) &&
                                'font-semibold text-amber-600 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-400',
                        )}
                    >
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
