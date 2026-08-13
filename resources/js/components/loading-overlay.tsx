import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const SHOW_DELAY_MS = 150;

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
            role="status"
            aria-label="Memuat"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
            <div className="size-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
    );
}
