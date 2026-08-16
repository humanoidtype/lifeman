import { createInertiaApp } from '@inertiajs/react';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { AppSplash } from '@/components/app-splash';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useBackHandler } from '@/hooks/use-back-handler';
import { NavigatingProvider } from '@/hooks/use-navigating';
import { RefreshingProvider } from '@/hooks/use-refreshing';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import GlobalChromeLayout from '@/layouts/global-chrome-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { initBootDiag } from '@/lib/diagnose';

const DIAGNOSE_ENABLED = import.meta.env.VITE_DIAGNOSE_ENABLED === 'true';

if (DIAGNOSE_ENABLED) {
    initBootDiag();
}

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
    withApp(app, { page }) {
        const appVersion =
            typeof page.props.appVersion === 'string'
                ? page.props.appVersion
                : undefined;

        return (
            <RefreshingProvider>
                <NavigatingProvider>
                    <TooltipProvider delayDuration={0}>
                        {DIAGNOSE_ENABLED ? (
                            <AppErrorBoundary label="APP">
                                <AppErrorBoundary label="HALAMAN">
                                    {app}
                                </AppErrorBoundary>
                                <Toaster />
                                <BackButtonHandler />
                            </AppErrorBoundary>
                        ) : (
                            <>
                                {app}
                                <Toaster />
                                <BackButtonHandler />
                            </>
                        )}
                        <AppSplash appVersion={appVersion} />
                    </TooltipProvider>
                </NavigatingProvider>
            </RefreshingProvider>
        );
    },
    progress: false,
});

// This will set light / dark mode on load...
initializeTheme();
