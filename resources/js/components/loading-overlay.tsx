import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const SHOW_DELAY_MS = 400;

export function LoadingOverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer: number | undefined;

        const start = (): void => {
            timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        };

        const finish = (): void => {
            window.clearTimeout(timer);
            setVisible(false);
        };

        const offStart = router.on('start', start);
        const offFinish = router.on('finish', finish);
        const offError = router.on('error', finish);

        return () => {
            window.clearTimeout(timer);
            offStart();
            offFinish();
            offError();
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