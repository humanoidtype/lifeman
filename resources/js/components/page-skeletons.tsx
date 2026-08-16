import { Skeleton } from '@/components/ui/skeleton';

export function SettingsPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
        </div>
    );
}

export function AuthPageSkeleton() {
    return (
        <div className="flex min-h-dvh items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-4">
                <div className="flex justify-center">
                    <Skeleton className="size-14 rounded-2xl" />
                </div>
                <Skeleton className="mx-auto h-6 w-32" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="mx-auto h-10 w-28" />
            </div>
        </div>
    );
}

export function ShowPageSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 rounded-2xl" />
            <div className="space-y-3">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
            </div>
        </div>
    );
}
