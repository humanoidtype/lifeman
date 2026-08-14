import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import type { Page, SharedPageProps } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/notification';

let currentPage: Page<SharedPageProps> | null = null;

export function useBackHandler(): void {
    useEffect(() => {
        if (!isNativePlatform()) {
            return;
        }

        const offNavigate = router.on('navigate', (event) => {
            currentPage = event.detail.page;
        });

        let handle: PluginListenerHandle | undefined;
        let cancelled = false;

        void App.addListener('backButton', ({ canGoBack }) => {
            const url = currentPage?.url ?? window.location.pathname;
            const authenticated = Boolean(currentPage?.props.auth?.user);

            if (!authenticated) {
                if (canGoBack) {
                    window.history.back();
                } else {
                    void App.minimizeApp();
                }

                return;
            }

            if (url === '/dashboard') {
                void App.minimizeApp();
            } else {
                void router.visit('/dashboard', { replace: true });
            }
        }).then((listener) => {
            if (cancelled) {
                listener.remove();
            } else {
                handle = listener;
            }
        });

        return () => {
            offNavigate();
            cancelled = true;
            handle?.remove();
        };
    }, []);
}
