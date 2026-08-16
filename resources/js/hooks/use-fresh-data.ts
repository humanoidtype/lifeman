import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useRefreshing } from '@/hooks/use-refreshing';

export function useFreshData(): void {
    const { url } = usePage();
    const { beginRefresh, endRefresh } = useRefreshing();
    const inFlightRef = useRef(false);
    const refreshingRef = useRef(false);
    const lastUrlRef = useRef(url);
    const freshUrlRef = useRef(url);

    useEffect(() => {
        const offStart = router.on('start', () => {
            inFlightRef.current = true;
        });

        const offFinish = router.on('finish', (event) => {
            inFlightRef.current = false;

            if (refreshingRef.current) {
                refreshingRef.current = false;
                endRefresh();
            }

            freshUrlRef.current =
                event.detail.visit.url.pathname + event.detail.visit.url.search;
        });

        const onVisibility = (): void => {
            if (
                document.visibilityState === 'visible' &&
                !inFlightRef.current &&
                !refreshingRef.current
            ) {
                refreshingRef.current = true;
                beginRefresh();
                router.reload();
            }
        };

        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            offStart();
            offFinish();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [beginRefresh, endRefresh]);

    useEffect(() => {
        if (url === lastUrlRef.current) {
            return;
        }

        lastUrlRef.current = url;

        if (url === freshUrlRef.current || refreshingRef.current) {
            return;
        }

        refreshingRef.current = true;
        beginRefresh();
        router.reload();
    }, [url, beginRefresh]);
}
