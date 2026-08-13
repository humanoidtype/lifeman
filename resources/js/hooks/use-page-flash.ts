import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type Flash = {
    success?: string;
    error?: string;
};

export function usePageFlash() {
    const page = usePage();
    const flash = page.props.flash as Flash | undefined;
    const seen = useRef<string>('');

    useEffect(() => {
        const key = `${flash?.success ?? ''}|${flash?.error ?? ''}`;

        if (!key || key === '|' || seen.current === key) {
            return;
        }

        seen.current = key;

        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);
}
