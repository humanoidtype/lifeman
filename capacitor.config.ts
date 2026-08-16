import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.lifeman.app',
    appName: 'Life Man',
    webDir: 'public',
    appendUserAgent: 'LIFEMAN_APP',
    server: {
        url: process.env.LIFEMAN_APP_URL ?? 'http://localhost:8000',
        cleartext: false,
    },
    android: {
        allowMixedContent: false,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 0,
            launchAutoHide: true,
            launchFadeOutDuration: 300,
            backgroundColor: '#E17100',
            showSpinner: false,
        },
    },
};

export default config;
