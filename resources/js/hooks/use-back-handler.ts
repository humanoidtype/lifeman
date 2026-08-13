import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/notification';

export function useBackHandler(): void {
    const page = usePage();
    const url = page.url;
    const authenticated = Boolean(page.props.auth?.user);

    useEffect(() => {
        if (!isNativePlatform()) {
            return;
        }

        let handle: PluginListenerHandle | undefined;
        let cancelled = false;

        void App.addListener('backButton', ({ canGoBack }) => {
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
            cancelled = true;
            handle?.remove();
        };
    }, [url, authenticated]);
}
