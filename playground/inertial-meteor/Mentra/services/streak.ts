/**
 * streak.ts — Daily Streak Service
 *
 * Manages the user's daily training streak:
 * - Increments streak when user completes a session today
 * - Resets streak if a day is missed
 * - Provides streak data for the Home screen widget
 *
 * Duolingo data: streak system alone drives ~40% improvement in D7 retention
 * (loss aversion psychology — users don't want to break the chain)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'mentra_streak_count';
const LAST_PLAYED_KEY = 'mentra_streak_last_played';
const LONGEST_STREAK_KEY = 'mentra_streak_longest';

export interface StreakData {
    current: number;        // current streak days
    longest: number;        // all-time best streak
    lastPlayed: string | null; // ISO date string YYYY-MM-DD
    playedToday: boolean;
    isAtRisk: boolean;      // true if last played was yesterday (must play today to keep streak)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

// ── Public API ────────────────────────────────────────────────────────────────

export const Streak = {
    /**
     * Load streak data from storage (call on app start / screen focus)
     */
    get: async (): Promise<StreakData> => {
        try {
            const [count, lastPlayed, longest] = await AsyncStorage.multiGet([
                STREAK_KEY, LAST_PLAYED_KEY, LONGEST_STREAK_KEY
            ]);
            const current = parseInt(count[1] ?? '0', 10);
            const last = lastPlayed[1] ?? null;
            const best = parseInt(longest[1] ?? '0', 10);
            const today = todayStr();
            const yesterday = yesterdayStr();

            // Streak is broken if last played was before yesterday
            if (last && last !== today && last !== yesterday) {
                // Missed a day — reset
                await AsyncStorage.multiSet([
                    [STREAK_KEY, '0'],
                    [LAST_PLAYED_KEY, ''],
                ]);
                return { current: 0, longest: best, lastPlayed: last, playedToday: false, isAtRisk: false };
            }

            return {
                current,
                longest: best,
                lastPlayed: last,
                playedToday: last === today,
                isAtRisk: last === yesterday,
            };
        } catch {
            return { current: 0, longest: 0, lastPlayed: null, playedToday: false, isAtRisk: false };
        }
    },

    /**
     * Record a completed training session (call after any game or journal entry)
     * Returns the new streak count
     */
    recordSession: async (): Promise<number> => {
        try {
            const today = todayStr();
            const yesterday = yesterdayStr();
            const [countVal, lastVal, longestVal] = await AsyncStorage.multiGet([
                STREAK_KEY, LAST_PLAYED_KEY, LONGEST_STREAK_KEY
            ]);

            const lastPlayed = lastVal[1] ?? '';
            let current = parseInt(countVal[1] ?? '0', 10);
            let longest = parseInt(longestVal[1] ?? '0', 10);

            // Already played today — no change
            if (lastPlayed === today) return current;

            // Continue streak if played yesterday, otherwise restart
            if (lastPlayed === yesterday) {
                current += 1;
            } else {
                current = 1; // reset or first ever
            }

            longest = Math.max(longest, current);

            await AsyncStorage.multiSet([
                [STREAK_KEY, String(current)],
                [LAST_PLAYED_KEY, today],
                [LONGEST_STREAK_KEY, String(longest)],
            ]);
            return current;
        } catch {
            return 0;
        }
    },
};
