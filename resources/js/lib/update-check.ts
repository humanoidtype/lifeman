export type UpdateInfo = {
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
    changelog: string | null;
    releaseUrl: string | null;
    downloadUrl: string | null;
    checkedAt: number | null;
    failed: boolean;
    errorMessage: string | null;
};

const REPO = 'humanoidtype/lifeman';
const CACHE_KEY = 'lifeman-update-check';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

let inFlight: Promise<UpdateInfo> | null = null;

type ReleaseData = {
    tag_name?: string;
    body?: string | null;
    html_url?: string;
    download_url?: string | null;
};

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

function buildInfo(
    currentVersion: string,
    release: ReleaseData | null,
): UpdateInfo {
    const latestVersion = release ? stripPrefix(release.tag_name ?? '') : '';

    return {
        currentVersion,
        latestVersion,
        updateAvailable:
            latestVersion !== '' &&
            compareVersions(latestVersion, currentVersion) > 0,
        changelog: release?.body?.trim() || null,
        releaseUrl: release?.html_url ?? null,
        downloadUrl: release?.download_url ?? null,
        checkedAt: Date.now(),
        failed: false,
        errorMessage: null,
    };
}

function failedInfo(
    currentVersion: string,
    errorMessage: string | null,
): UpdateInfo {
    return {
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        changelog: null,
        releaseUrl: null,
        downloadUrl: null,
        checkedAt: null,
        failed: true,
        errorMessage,
    };
}

async function fetchWithTimeout(
    url: string,
    options?: RequestInit,
): Promise<Response> {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        window.clearTimeout(timer);
    }
}

async function fetchFromProxy(): Promise<ReleaseData> {
    const response = await fetchWithTimeout('/app/update-check', {
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`proxy HTTP ${response.status}`);
    }

    const data = (await response.json()) as ReleaseData & { error?: string };

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
}

async function fetchFromGitHub(): Promise<ReleaseData | null> {
    const response = await fetchWithTimeout(
        `https://api.github.com/repos/${REPO}/releases/latest`,
        {
            headers: { Accept: 'application/vnd.github+json' },
        },
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`GitHub API HTTP ${response.status}`);
    }

    const release = (await response.json()) as {
        tag_name?: string;
        body?: string | null;
        html_url?: string;
        assets?: Array<{ name?: string; browser_download_url?: string }>;
    };

    const downloadAsset = (release.assets ?? []).find((asset) =>
        asset.name?.endsWith('.apk'),
    );

    return {
        tag_name: release.tag_name,
        body: release.body,
        html_url: release.html_url,
        download_url: downloadAsset?.browser_download_url,
    };
}

async function fetchLatestRelease(currentVersion: string): Promise<UpdateInfo> {
    const errors: string[] = [];

    try {
        const release = await fetchFromProxy();

        if (release.tag_name !== undefined) {
            const info = buildInfo(currentVersion, release);
            writeCache(info);

            return info;
        }
    } catch (error) {
        errors.push(
            `proxy: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    try {
        const release = await fetchFromGitHub();
        const info = buildInfo(currentVersion, release);
        writeCache(info);

        return info;
    } catch (error) {
        errors.push(
            `GitHub: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    return failedInfo(currentVersion, errors.join('; ') || null);
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
