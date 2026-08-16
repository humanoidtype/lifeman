export type AssetSyncResult = {
    status: 'checking' | 'match' | 'mismatch' | 'unavailable';
    detail: string;
};

export async function checkAssets(): Promise<AssetSyncResult> {
    const entry =
        document
            .querySelector<HTMLScriptElement>(
                'script[type="module"][src*="/build/"]',
            )
            ?.src.split('/')
            .pop() ?? '(tidak ditemukan)';

    try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 8000);
        const response = await fetch('/diagnose-assets', {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });
        window.clearTimeout(timer);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data: { entry?: string; total?: number; missing?: string[] } =
            await response.json();
        const missing = data.missing ?? [];
        const match = data.entry === entry && missing.length === 0;

        return {
            status: match ? 'match' : 'mismatch',
            detail: `dipakai: ${entry} | manifest: ${data.entry ?? '?'} (${data.total ?? '?'})${missing.length > 0 ? ` | MISSING: ${missing.join(', ')}` : ''}`,
        };
    } catch (error) {
        return {
            status: 'unavailable',
            detail: `/diagnose-assets gagal: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
