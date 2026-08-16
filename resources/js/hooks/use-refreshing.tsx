import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

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

    const value = useMemo<RefreshingContextValue>(
        () => ({
            refreshing,
            beginRefresh: () => setRefreshing(true),
            endRefresh: () => setRefreshing(false),
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
