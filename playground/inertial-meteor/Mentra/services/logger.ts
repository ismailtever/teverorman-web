/**
 * Mentra Logger
 * production-safe logging utility.
 * 
 * Rules:
 * - __DEV__: All logs allowed.
 * - Production: Only errors are logged to console (for crash reporting tools to pick up).
 * - Debug logs are silenced to improve performance and reduce noise.
 */

// Native boolean for dev mode
const IS_DEV = __DEV__;

export const Logger = {
    log: (message: string, ...args: any[]) => {
        if (IS_DEV) {
            console.log(`[Mentra] ${message}`, ...args);
        }
    },

    warn: (message: string, ...args: any[]) => {
        if (IS_DEV) {
            console.warn(`[Mentra] WARN: ${message}`, ...args);
        }
    },

    error: (message: string, error?: any) => {
        // Always log errors, even in prod, so crashlytics/sentry can capture them via console breadcrumbs
        console.error(`[Mentra] ERROR: ${message}`, error);
    },

    debug: (message: string, data?: any) => {
        if (IS_DEV) {
            console.debug(`[Mentra Debug] ${message}`, data || '');
        }
    }
};
