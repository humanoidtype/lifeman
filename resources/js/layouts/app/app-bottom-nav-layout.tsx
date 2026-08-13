import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { BottomNav } from '@/components/bottom-nav';
import { ReminderBanner } from '@/components/reminders/reminder-banner';
import { usePageFlash } from '@/hooks/use-page-flash';
import type { AppLayoutProps } from '@/types';

export default function AppBottomNavLayout({ children }: AppLayoutProps) {
    usePageFlash();

    return (
        <AppShell variant="header">
            <AppContent variant="header" className="h-auto pt-6 pb-28">
                {children}
            </AppContent>
            <ReminderBanner />
            <BottomNav />
        </AppShell>
    );
}
