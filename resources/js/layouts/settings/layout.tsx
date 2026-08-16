import { Link, usePage } from '@inertiajs/react';
import { Info, Palette, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { checkForUpdates } from '@/lib/update-check';
import type { UpdateInfo } from '@/lib/update-check';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAbout } from '@/routes/about';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Informasi Akun',
        href: edit(),
        icon: User,
    },
    {
        title: 'Tampilan & Suara',
        href: editAppearance(),
        icon: Palette,
    },
    {
        title: 'Tentang App',
        href: editAbout(),
        icon: Info,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { appVersion } = usePage().props;
    const [update, setUpdate] = useState<UpdateInfo | null>(null);

    useEffect(() => {
        let cancelled = false;

        checkForUpdates(appVersion).then((info) => {
            if (!cancelled) {
                setUpdate(info);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [appVersion]);

    return (
        <div className="px-3 py-4">
            <Heading
                title="Pengaturan"
                description="Kelola profil, keamanan, dan preferensi akunmu"
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:gap-12">
                <aside className="w-full shrink-0 lg:w-64">
                    <nav
                        className="grid grid-cols-3 gap-2 rounded-2xl border bg-card p-2 shadow-sm"
                        aria-label="Pengaturan"
                    >
                        {sidebarNavItems.map((item) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={toUrl(item.href)}
                                    href={item.href}
                                    prefetch="mount"
                                    cacheFor="60s"
                                    className={cn(
                                        'relative flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center text-[11px] font-medium transition-colors duration-200',
                                        active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="size-5" />
                                    )}
                                    <span>{item.title}</span>
                                    {item.title === 'Tentang App' &&
                                        update?.updateAvailable && (
                                            <span
                                                className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive"
                                                aria-label="Update tersedia"
                                            />
                                        )}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-4">{children}</section>
                </div>
            </div>
        </div>
    );
}
