import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { markReactMounted } from '@/lib/diagnose';

type AppErrorBoundaryProps = {
    label: string;
    children: ReactNode;
};

type AppErrorBoundaryState = {
    error: Error | null;
};

export class AppErrorBoundary extends Component<
    AppErrorBoundaryProps,
    AppErrorBoundaryState
> {
    state: AppErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return { error };
    }

    componentDidMount(): void {
        markReactMounted();
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error(
            `[error-boundary:${this.props.label}]`,
            error,
            info.componentStack,
        );
    }

    render(): ReactNode {
        const { error } = this.state;

        if (error === null) {
            return this.props.children;
        }

        return (
            <div className="fixed inset-0 z-[99999] flex flex-col gap-3 overflow-auto bg-red-950 p-6 font-mono text-xs text-red-100">
                <p className="text-base font-bold text-red-300">
                    ERROR DI {this.props.label.toUpperCase()}
                </p>
                <p>URL: {window.location.href}</p>
                <p>
                    {error.name}: {error.message}
                </p>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
                <button
                    type="button"
                    className="mt-2 w-fit rounded-md bg-white px-3 py-1.5 font-sans text-sm font-medium text-red-950"
                    onClick={() => this.setState({ error: null })}
                >
                    Tutup (coba lagi)
                </button>
            </div>
        );
    }
}
