/**
 * Tiny analytics wrapper for tracking paywall performance and conversions.
 * Ready for drop-in Firebase / Mixpanel integration later.
 */

const IS_FIREBASE_ENABLED = false; // Toggle to true when @react-native-firebase/app is installed

export function track(eventName: string, props?: Record<string, any>) {
    if (__DEV__) {
        console.log(`[Analytics] Tracked ${eventName}`, props ? JSON.stringify(props) : '');
    }

    if (IS_FIREBASE_ENABLED) {
        // e.g., analytics().logEvent(eventName, props);
    }
}

export function logCrashAttribute(key: string, value: string) {
    if (__DEV__) {
        console.log(`[Crashlytics] Set attribute ${key}: ${value}`);
    }

    if (IS_FIREBASE_ENABLED) {
        // e.g., crashlytics().setAttribute(key, value);
    }
}

export function recordError(error: Error, contextualData?: Record<string, any>) {
    // In production, log only the message — never expose stack or contextualData to console
    if (__DEV__) {
        console.error(`[Error Recorded] ${error.message}`, contextualData);
    } else {
        console.error(`[Mentra] Error: ${error.message}`);
    }

    if (IS_FIREBASE_ENABLED) {
        // e.g., crashlytics().recordError(error);
    }
}

