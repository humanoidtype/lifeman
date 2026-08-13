import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.lifeman.app',
    appName: 'Life Man',
    webDir: 'public',
    server: {
        url: process.env.LIFEMAN_APP_URL ?? 'http://localhost:8000',
        cleartext: false,
    },
    android: {
        allowMixedContent: false,
    },
};

export default config;