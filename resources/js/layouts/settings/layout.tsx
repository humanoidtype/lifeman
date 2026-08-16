import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronRight, Info, Lock, Palette, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { checkForUpdates } from '@/lib/update-check';
import type { UpdateInfo } from '@/lib/update-check';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAbout } from '@/routes/about';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editNotifications } from '@/routes/notifications';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Pengaturan',
        href: edit(),
        icon: User,
    },
    {
        title: 'Keamanan',
        href: editSecurity(),
        icon: Lock,
    },
    {
        title: 'Tampilan',
        href: editAppearance(),
        icon: Palette,
    },
    {
        title: 'Notifikasi',
        href: editNotifications(),
        icon: Bell,
    },
    {
        title: 'Versi App',
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
        <div className="px-4 py-6">
            <Heading
                title="Pengaturan"
                description="Kelola profil, keamanan, dan preferensi akunmu"
            />

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                <aside className="w-full shrink-0 lg:w-64">
                    <nav
                        className="flex flex-col gap-1 rounded-2xl border bg-card p-2 shadow-sm"
                        aria-label="Pengaturan"
                    >
                        {sidebarNavItems.map((item) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={toUrl(item.href)}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                                        active
                                            ? 'bg-primary/10 text-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {item.icon && (
                                        <span
                                            className={cn(
                                                'flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
                                                active
                                                    ? 'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            <item.icon className="size-4" />
                                        </span>
                                    )}
                                    <span className="flex-1 text-sm font-medium">
                                        {item.title}
                                    </span>
                                    {item.title === 'Versi App' &&
                                        update?.updateAvailable && (
                                            <span
                                                className="size-2 shrink-0 rounded-full bg-destructive"
                                                aria-label="Update tersedia"
                                            />
                                        )}
                                    <ChevronRight
                                        className={cn(
                                            'size-4 transition-all duration-200',
                                            active
                                                ? 'translate-x-0 text-primary'
                                                : '-translate-x-1 text-muted-foreground/50 group-hover:translate-x-0',
                                        )}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Life Man v{appVersion}
                    </p>
                </aside>

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-6">{children}</section>
                </div>
            </div>
        </div>
    );
}
