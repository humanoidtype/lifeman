import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { PropsWithChildren } from 'react';

const MIN_DISPLAY_MS = 1000;

type RefreshingContextValue = {
    refreshing: boolean;
    beginRefresh: () => void;
    endRefresh: () => void;
};

const RefreshingContext = createContext<RefreshingContextValue>({
    refreshing: false,
    beginRefresh: () => {},
    endRefresh: () => {},
});

export function RefreshingProvider({ children }: PropsWithChildren) {
    const [refreshing, setRefreshing] = useState(false);
    const startedAtRef = useRef(0);
    const clearTimerRef = useRef<number | undefined>(undefined);

    useEffect(
        () => () => {
            window.clearTimeout(clearTimerRef.current);
        },
        [],
    );

    const value = useMemo<RefreshingContextValue>(
        () => ({
            refreshing,
            beginRefresh: () => {
                window.clearTimeout(clearTimerRef.current);
                startedAtRef.current = Date.now();
                setRefreshing(true);
            },
            endRefresh: () => {
                window.clearTimeout(clearTimerRef.current);

                if (startedAtRef.current === 0) {
                    setRefreshing(false);

                    return;
                }

                const remaining =
                    MIN_DISPLAY_MS - (Date.now() - startedAtRef.current);

                if (remaining <= 0) {
                    startedAtRef.current = 0;
                    setRefreshing(false);

                    return;
                }

                clearTimerRef.current = window.setTimeout(() => {
                    startedAtRef.current = 0;
                    setRefreshing(false);
                }, remaining);
            },
        }),
        [refreshing],
    );

    return (
        <RefreshingContext.Provider value={value}>
            {children}
        </RefreshingContext.Provider>
    );
}

export function useRefreshing(): RefreshingContextValue {
    return useContext(RefreshingContext);
}
