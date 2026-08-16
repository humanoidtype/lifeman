import { router } from '@inertiajs/react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

const NAVIGATION_DELAY_MS = 250;
const MIN_DISPLAY_MS = 400;

const NavigatingContext = createContext(false);

export function NavigatingProvider({ children }: PropsWithChildren) {
    const [navigating, setNavigating] = useState(false);
    const shownAtRef = useRef(0);
    const hideTimerRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        let showTimer: number | undefined;

        const start = (): void => {
            window.clearTimeout(showTimer);
            window.clearTimeout(hideTimerRef.current);
            showTimer = window.setTimeout(() => {
                shownAtRef.current = Date.now();
                setNavigating(true);
            }, NAVIGATION_DELAY_MS);
        };

        const finish = (): void => {
            window.clearTimeout(showTimer);

            if (shownAtRef.current === 0) {
                setNavigating(false);

                return;
            }

            const remaining =
                MIN_DISPLAY_MS - (Date.now() - shownAtRef.current);

            if (remaining <= 0) {
                setNavigating(false);

                return;
            }

            hideTimerRef.current = window.setTimeout(() => {
                setNavigating(false);
                shownAtRef.current = 0;
            }, remaining);
        };

        const offStart = router.on('start', start);
        const offFinish = router.on('finish', finish);
        const offError = router.on('error', finish);
        const offCancel = router.on('cancel', finish);
        const offHttpException = router.on('httpException', finish);
        const offNetworkError = router.on('networkError', finish);

        return () => {
            window.clearTimeout(showTimer);
            window.clearTimeout(hideTimerRef.current);
            offStart();
            offFinish();
            offError();
            offCancel();
            offHttpException();
            offNetworkError();
        };
    }, []);

    return (
        <NavigatingContext.Provider value={navigating}>
            {children}
        </NavigatingContext.Provider>
    );
}

export function useNavigating(): boolean {
    return useContext(NavigatingContext);
}
