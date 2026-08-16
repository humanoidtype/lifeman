import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useRefreshing } from '@/hooks/use-refreshing';

const SHOW_DELAY_MS = 400;
const SAFETY_TIMEOUT_MS = 15_000;

export function LoadingOverlay() {
    const [visible, setVisible] = useState(false);
    const { refreshing } = useRefreshing();
    const refreshingRef = useRef(refreshing);

    useEffect(() => {
        refreshingRef.current = refreshing;
    }, [refreshing]);

    useEffect(() => {
        let timer: number | undefined;
        let safetyTimer: number | undefined;

        const finish = (): void => {
            window.clearTimeout(timer);
            window.clearTimeout(safetyTimer);
            setVisible(false);
        };

        const start = (): void => {
            if (refreshingRef.current) {
                return;
            }

            finish();
            timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
            safetyTimer = window.setTimeout(finish, SAFETY_TIMEOUT_MS);
        };

        const offStart = router.on('start', start);
        const offFinish = router.on('finish', finish);
        const offError = router.on('error', finish);
        const offCancel = router.on('cancel', finish);
        const offHttpException = router.on('httpException', finish);
        const offNetworkError = router.on('networkError', finish);

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(safetyTimer);
            offStart();
            offFinish();
            offError();
            offCancel();
            offHttpException();
            offNetworkError();
        };
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div
            role="progressbar"
            aria-label="Memuat"
            className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
        >
            <div className="h-full w-1/3 animate-[loading-slide_1s_ease-in-out_infinite] rounded-full bg-primary shadow-sm shadow-primary/40" />
        </div>
    );
}
