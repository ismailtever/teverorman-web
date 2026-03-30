import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';
import { RawGameSession, CognitiveProfile } from './engine/types';

const USER_PROFILE_KEY = 'mentra_user_profile';
const GAME_STATS_KEY = 'mentra_game_stats_';
const SESSION_HISTORY_KEY = 'mentra_session_history';
const COGNITIVE_PROFILE_KEY = 'mentra_cognitive_profile';
const GLOBAL_SCORE_KEY = 'mentra_global_score';

export interface UserProfile {
    name: string;
    goal?: string; // Legacy
    identity?: string; // 5 Core Entities
    identityLevel?: string; // E.g., Structured Beginner
    consistencyScore?: number; // 0-100%
    flowDays?: number; // e.g., 4 (Day Flow)
    joinedDate: string;
    isOnboardingCompleted: boolean;
    isPro?: boolean;
    primaryChallenge?: 'brainFog' | 'stress' | 'focus' | 'memory' | 'sleep' | 'productivity';
    preferredLang?: string; // Saved during onboarding
    region?: 'mena' | 'tr' | 'us' | 'eu'; // Optional, for content personalization
}

export interface GameStats {
    highScore: number;
    totalPlays: number;
    lastPlayed: string;
}

export const Storage = {

    // --- Global Score ---
    async saveGlobalScore(score: number): Promise<void> {
        try {
            await AsyncStorage.setItem(GLOBAL_SCORE_KEY, String(score));
        } catch (e) { Logger.error('Failed to save global score', e); }
    },

    async getGlobalScore(): Promise<number> {
        try {
            const val = await AsyncStorage.getItem(GLOBAL_SCORE_KEY);
            return val ? parseInt(val, 10) : 72;
        } catch (e) { return 72; }
    },

    // --- User Profile ---
    async saveUserProfile(profile: UserProfile): Promise<void> {
        try {
            await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
        } catch (e) {
            Logger.error('Failed to save user profile', e);
        }
    },

    async getUserProfile(): Promise<UserProfile | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(USER_PROFILE_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            Logger.error('Failed to fetch user profile', e);
            return null;
        }
    },

    // --- Cognitive Profile ---
    async saveCognitiveProfile(profile: CognitiveProfile): Promise<void> {
        try {
            await AsyncStorage.setItem(COGNITIVE_PROFILE_KEY, JSON.stringify(profile));
        } catch (e) { Logger.error('Failed to save cognitive profile', e); }
    },

    async getCognitiveProfile(): Promise<CognitiveProfile | null> {
        try {
            const json = await AsyncStorage.getItem(COGNITIVE_PROFILE_KEY);
            return json ? JSON.parse(json) : null;
        } catch (e) {
            Logger.error('Failed to fetch cognitive profile', e);
            return null;
        }
    },

    // --- Game Stats ---
    async saveGameScore(gameId: string, score: number): Promise<void> {
        try {
            const currentStats = await this.getGameStats(gameId);
            const newStats: GameStats = {
                highScore: Math.max(currentStats?.highScore || 0, score),
                totalPlays: (currentStats?.totalPlays || 0) + 1,
                lastPlayed: new Date().toISOString(),
            };
            await AsyncStorage.setItem(GAME_STATS_KEY + gameId, JSON.stringify(newStats));
        } catch (e) {
            Logger.error('Failed to save score', e);
        }
    },

    async getGameStats(gameId: string): Promise<GameStats | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(GAME_STATS_KEY + gameId);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) { return null; }
    },

    // --- Session History ---
    async saveSession(session: RawGameSession): Promise<void> {
        try {
            const historyJson = await AsyncStorage.getItem(SESSION_HISTORY_KEY);
            let history: RawGameSession[] = historyJson ? JSON.parse(historyJson) : [];

            // Append
            history.push(session);

            // Cap at 50 to prevent storage bloat
            if (history.length > 50) {
                history = history.slice(history.length - 50);
            }

            await AsyncStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            Logger.error('Failed to save session history', e);
        }
    },

    async getRecentSessions(limit = 10): Promise<RawGameSession[]> {
        try {
            const json = await AsyncStorage.getItem(SESSION_HISTORY_KEY);
            if (!json) return [];
            const history: RawGameSession[] = JSON.parse(json);
            return history.slice(Math.max(0, history.length - limit));
        } catch (e) {
            Logger.error('Failed to get sessions', e);
            return [];
        }
    },

    // --- System ---
    async resetAllData(): Promise<void> {
        try {
            Logger.warn('Resetting ALL user data');
            const keys = [USER_PROFILE_KEY, SESSION_HISTORY_KEY, COGNITIVE_PROFILE_KEY, GLOBAL_SCORE_KEY];
            await AsyncStorage.multiRemove(keys);
            // Optionally clear game stats specifically if needed
            // await AsyncStorage.multiRemove(['mentra_game_stats_speed-match', ...]);
        } catch (e) {
            Logger.error('Reset Failed', e);
        }
    }
};
