import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { AlarmClock, Home, PiggyBank, User, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as cashflowsIndex } from '@/routes/cashflows';
import profile from '@/routes/profile';
import { index as remindersIndex } from '@/routes/reminders';
import { index as savingsIndex } from '@/routes/savings-goals';

const items = [
    { title: 'Beranda', icon: Home, href: dashboard() },
    { title: 'Ingetin', icon: AlarmClock, href: remindersIndex() },
    { title: 'Kas', icon: Wallet, href: cashflowsIndex() },
    { title: 'Nabung', icon: PiggyBank, href: savingsIndex() },
    { title: 'Profil', icon: User, href: profile.edit() },
];

const baseUrl = 'http://life-man.test';

export function BottomNav() {
    const page = usePage();
    const pathname = new URL(page.url, baseUrl).pathname;

    function isActive(href: string): boolean {
        const target = new URL(href, baseUrl);

        return pathname === target.pathname;
    }

    return (
        <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
            <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                {items.map((item) => (
                    <Link
                        key={item.title}
                        href={toUrl(item.href)}
                        prefetch
                        className={cn(
                            'flex flex-col items-center gap-0.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground sm:px-5',
                            isActive(toUrl(item.href)) &&
                                'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:text-primary-foreground',
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
