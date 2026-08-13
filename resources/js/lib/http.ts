export async function httpJson<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const csrf = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    if (csrf) {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(csrf));
    }

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}
