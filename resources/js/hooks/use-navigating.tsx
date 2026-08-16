import { router } from '@inertiajs/react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

const NAVIGATION_DELAY_MS = 250;

const NavigatingContext = createContext(false);

export function NavigatingProvider({ children }: PropsWithChildren) {
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        let timer: number | undefined;

        const start = (): void => {
            window.clearTimeout(timer);
            timer = window.setTimeout(
                () => setNavigating(true),
                NAVIGATION_DELAY_MS,
            );
        };

        const finish = (): void => {
            window.clearTimeout(timer);
            setNavigating(false);
        };

        const offStart = router.on('start', start);
        const offFinish = router.on('finish', finish);
        const offError = router.on('error', finish);
        const offCancel = router.on('cancel', finish);
        const offHttpException = router.on('httpException', finish);
        const offNetworkError = router.on('networkError', finish);

        return () => {
            window.clearTimeout(timer);
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
