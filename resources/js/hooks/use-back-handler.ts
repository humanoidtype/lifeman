import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/notification';

export function useBackHandler(): void {
    useEffect(() => {
        if (!isNativePlatform()) {
            return;
        }

        let handle: PluginListenerHandle | undefined;
        let cancelled = false;

        void App.addListener('backButton', ({ canGoBack }) => {
            const authenticated = Boolean(router.page.props.auth?.user);

            if (!authenticated) {
                if (canGoBack) {
                    window.history.back();
                } else {
                    void App.minimizeApp();
                }

                return;
            }

            if (router.page.url === '/dashboard') {
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
    }, []);
}
