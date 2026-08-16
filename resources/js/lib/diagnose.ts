import { checkAssets } from '@/lib/asset-check';
import type { AssetSyncResult } from '@/lib/asset-check';

let initialized = false;
let panel: HTMLDivElement | null = null;
let panelText: HTMLDivElement | null = null;
let reactMounted = false;
let assetSync: AssetSyncResult = { status: 'checking', detail: 'memeriksa...' };

function renderPanel(): void {
    if (panelText === null) {
        return;
    }

    panelText.textContent = [
        'LIFEMAN BOOT DIAG (TEMP)',
        `JS: ok | React: ${reactMounted ? 'MOUNT' : 'menunggu'}`,
        `Assets: ${assetSync.status} - ${assetSync.detail}`,
        `URL: ${window.location.href}`,
        `UA: ${navigator.userAgent}`,
    ].join('\n');
}

function showErrorOverlay(
    kind: string,
    message: string,
    detail?: string,
): void {
    const overlay = document.createElement('div');
    overlay.style.cssText =
        'position:fixed;inset:0;z-index:2147483647;background:rgba(90,0,0,.95);color:#ffe0e0;font:12px/1.6 ui-monospace,SFMono-Regular,monospace;padding:16px;overflow:auto;';

    const pre = document.createElement('pre');
    pre.style.cssText =
        'white-space:pre-wrap;word-break:break-all;margin:0 0 16px;';
    pre.textContent = [
        `[${kind}]`,
        message,
        detail ? `\n${detail}` : '',
        `\nURL: ${window.location.href}`,
        `UA: ${navigator.userAgent}`,
    ].join('\n');

    const close = document.createElement('button');
    close.textContent = 'Tutup';
    close.style.cssText =
        'position:fixed;top:12px;right:12px;padding:6px 14px;border:0;border-radius:6px;background:#fff;color:#111;font:600 12px ui-monospace,monospace;';
    close.addEventListener('click', () => overlay.remove());

    overlay.append(pre, close);
    document.body.appendChild(overlay);
}

export function initBootDiag(): void {
    if (initialized || typeof window === 'undefined') {
        return;
    }

    initialized = true;

    panel = document.createElement('div');
    panel.style.cssText =
        'position:fixed;left:8px;bottom:8px;z-index:2147483646;max-width:min(92vw,440px);background:rgba(0,0,0,.85);color:#eee;font:11px/1.5 ui-monospace,SFMono-Regular,monospace;padding:8px 10px;border-radius:8px;pointer-events:none;white-space:pre-wrap;word-break:break-all;';
    panelText = document.createElement('div');
    panel.appendChild(panelText);
    document.body.appendChild(panel);
    renderPanel();

    window.addEventListener(
        'error',
        (event) => {
            const target = event.target;

            if (
                target instanceof HTMLScriptElement ||
                target instanceof HTMLLinkElement
            ) {
                const url =
                    target instanceof HTMLScriptElement
                        ? target.src
                        : target.href;

                showErrorOverlay(
                    'ASSET GAGAL DIMUAT',
                    url || event.message,
                    `type: ${event.type}`,
                );

                return;
            }

            showErrorOverlay(
                'JS ERROR',
                event.message || 'unknown error',
                event.error instanceof Error
                    ? event.error.stack
                    : `${event.filename}:${event.lineno}:${event.colno}`,
            );
        },
        true,
    );

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;

        showErrorOverlay(
            'UNHANDLED REJECTION',
            reason instanceof Error ? reason.message : String(reason),
            reason instanceof Error ? reason.stack : undefined,
        );
    });

    void checkAssets().then((result) => {
        assetSync = result;
        renderPanel();
    });

    window.setTimeout(() => panel?.remove(), 12000);
}

export function markReactMounted(): void {
    reactMounted = true;
    renderPanel();
}
