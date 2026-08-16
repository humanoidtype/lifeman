import { createInertiaApp } from '@inertiajs/react';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useBackHandler } from '@/hooks/use-back-handler';
import { useFreshData } from '@/hooks/use-fresh-data';
import { RefreshingProvider } from '@/hooks/use-refreshing';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function BackButtonHandler() {
    useBackHandler();

    return null;
}

function FreshDataHandler() {
    useFreshData();

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <RefreshingProvider>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                    <LoadingOverlay />
                    <BackButtonHandler />
                    <FreshDataHandler />
                </TooltipProvider>
            </RefreshingProvider>
        );
    },
    progress: false,
});

// This will set light / dark mode on load...
initializeTheme();
