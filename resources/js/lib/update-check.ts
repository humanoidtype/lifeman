export type UpdateInfo = {
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
    changelog: string | null;
    releaseUrl: string | null;
    downloadUrl: string | null;
    checkedAt: number | null;
    failed: boolean;
};

const REPO = 'humanoidtype/lifeman';
const CACHE_KEY = 'lifeman-update-check';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

let inFlight: Promise<UpdateInfo> | null = null;

function readCache(): UpdateInfo | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);

        return raw ? (JSON.parse(raw) as UpdateInfo) : null;
    } catch {
        return null;
    }
}

function writeCache(info: UpdateInfo): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(info));
    } catch {
        // cache tidak tersedia, abaikan
    }
}

function stripPrefix(version: string): string {
    return version.replace(/^v/i, '');
}

function compareVersions(a: string, b: string): number {
    const left = stripPrefix(a).split('.').map(Number);
    const right = stripPrefix(b).split('.').map(Number);
    const length = Math.max(left.length, right.length);

    for (let i = 0; i < length; i += 1) {
        const x = left[i] ?? 0;
        const y = right[i] ?? 0;

        if (x > y) {
            return 1;
        }

        if (x < y) {
            return -1;
        }
    }

    return 0;
}

async function fetchLatestRelease(currentVersion: string): Promise<UpdateInfo> {
    const failed: UpdateInfo = {
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        changelog: null,
        releaseUrl: null,
        downloadUrl: null,
        checkedAt: null,
        failed: true,
    };

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO}/releases/latest`,
            {
                headers: { Accept: 'application/vnd.github+json' },
            },
        );

        if (response.status === 404) {
            const info: UpdateInfo = {
                ...failed,
                checkedAt: Date.now(),
                failed: false,
            };
            writeCache(info);

            return info;
        }

        if (!response.ok) {
            throw new Error(`GitHub API responded with ${response.status}`);
        }

        const release = (await response.json()) as {
            tag_name?: string;
            body?: string | null;
            html_url?: string;
            assets?: Array<{ name?: string; browser_download_url?: string }>;
        };

        const latestVersion = stripPrefix(release.tag_name ?? '');
        const downloadAsset = (release.assets ?? []).find((asset) =>
            asset.name?.endsWith('.apk'),
        );

        const info: UpdateInfo = {
            currentVersion,
            latestVersion,
            updateAvailable:
                latestVersion !== '' &&
                compareVersions(latestVersion, currentVersion) > 0,
            changelog: release.body?.trim() || null,
            releaseUrl: release.html_url ?? null,
            downloadUrl: downloadAsset?.browser_download_url ?? null,
            checkedAt: Date.now(),
            failed: false,
        };

        writeCache(info);

        return info;
    } catch {
        return failed;
    }
}

export function checkForUpdates(
    currentVersion: string,
    force = false,
): Promise<UpdateInfo> {
    const cached = readCache();

    if (
        cached &&
        !force &&
        cached.checkedAt &&
        Date.now() - cached.checkedAt < CACHE_TTL_MS
    ) {
        return Promise.resolve(cached);
    }

    if (inFlight) {
        return inFlight;
    }

    inFlight = fetchLatestRelease(currentVersion).finally(() => {
        inFlight = null;
    });

    return inFlight;
}
