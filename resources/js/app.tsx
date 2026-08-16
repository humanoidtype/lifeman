import { createInertiaApp } from '@inertiajs/react';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useBackHandler } from '@/hooks/use-back-handler';
import { RefreshingProvider } from '@/hooks/use-refreshing';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import GlobalChromeLayout from '@/layouts/global-chrome-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { initBootDiag } from '@/lib/diagnose';

initBootDiag();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function BackButtonHandler() {
    useBackHandler();

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return [AuthLayout, GlobalChromeLayout];
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout, GlobalChromeLayout];
            default:
                return [AppLayout, GlobalChromeLayout];
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <RefreshingProvider>
                <TooltipProvider delayDuration={0}>
                    <AppErrorBoundary label="APP">
                        <AppErrorBoundary label="HALAMAN">
                            {app}
                        </AppErrorBoundary>
                        <Toaster />
                        <LoadingOverlay />
                        <BackButtonHandler />
                    </AppErrorBoundary>
                </TooltipProvider>
            </RefreshingProvider>
        );
    },
    progress: false,
});

// This will set light / dark mode on load...
initializeTheme();
