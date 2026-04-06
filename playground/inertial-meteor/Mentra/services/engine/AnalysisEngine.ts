import { RawGameSession, CognitiveProfile } from './types';
import { Logger } from '../logger';

// Clamp helper
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfile = {
    // A neutral baseline
    memory: 50,
    focus: 50,
    speed: 50,
    flexibility: 50,
    problem_solving: 50,
    stabilityOffset: 50, // 50 is median stability
    fatigueIndex: 0,     // 0 is no fatigue
    impulseFactor: 0     // 0 is no impulsivity
};

export const AnalysisEngine = {

    // --- Safe Data Extractors (Migration Support) ---

    /**
     * Returns ALL reaction times (Correct + Incorrect).
     * Used for Stability, Fatigue, Impulsivity analysis.
     */
    getAllRTs(session: RawGameSession): number[] {
        if (session.rtAllMs && session.rtAllMs.length > 0) return session.rtAllMs;
        // Fallback to legacy
        if (session.reactionTimes && session.reactionTimes.length > 0) return session.reactionTimes;
        return [];
    },

    /**
     * Returns ONLY CORRECT reaction times.
     * Used for Speed Score calculation (we don't penalize speed for wrong answers, we penalize Accuracy).
     */
    getCorrectRTs(session: RawGameSession): number[] {
        if (session.rtCorrectMs && session.rtCorrectMs.length > 0) return session.rtCorrectMs;
        // Fallback: If legacy, use all RTs as best guess
        return this.getAllRTs(session);
    },

    // --- 1. Scoring Logic ---

    calculateSpeedScore(avgReactionTimeMs: number): number {
        // Benchmark: 200ms is elite (100 score), 700ms is slow (0 score)
        if (!avgReactionTimeMs || avgReactionTimeMs <= 0) return 0;
        const score = 100 - (avgReactionTimeMs - 200) / 5;
        return clamp(Math.round(score), 0, 100);
    },

    calculateAccuracyScore(accuracy: number): number {
        // accuracy is 0.0 - 1.0
        // Power curve to reward high accuracy
        return Math.round(Math.pow(accuracy, 2.3) * 100);
    },

    calculateStabilityIndex(reactionTimes: number[]): number {
        if (!reactionTimes || reactionTimes.length < 3) return 50;

        const mean = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
        const variance = reactionTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / reactionTimes.length;
        const stdDev = Math.sqrt(variance);

        if (mean === 0) return 0;
        const cv = stdDev / mean; // Coefficient of Variation

        // Lower CV = Higher Stability. 
        // CV of 0.1 is very stable (Score 80). CV of 0.5 is unstable (Score 0).
        const stability = 100 - (cv * 200);
        return clamp(Math.round(stability), 0, 100);
    },

    // --- 2. Behavorial Metrics ---

    detectFatigue(reactionTimes: number[]): number {
        if (!reactionTimes || reactionTimes.length < 10) return 0;

        // compare first 25% vs last 25%
        const quarter = Math.floor(reactionTimes.length / 4);
        const q1 = reactionTimes.slice(0, quarter);
        const q4 = reactionTimes.slice(reactionTimes.length - quarter);

        const avgQ1 = q1.reduce((a, b) => a + b, 0) / q1.length;
        const avgQ4 = q4.reduce((a, b) => a + b, 0) / q4.length;

        if (avgQ1 === 0) return 0;

        // Positive change = slowing down = fatigue
        const percentChange = (avgQ4 - avgQ1) / avgQ1;
        const fatigueScore = (percentChange * 400); // Scale factor

        return clamp(Math.round(fatigueScore), 0, 100);
    },

    /**
     * Detects Impulsivity based on FAST ERRORS.
     * Logic: Input event is WRONG and RT is < 150ms.
     */
    detectImpulsivity(events: any[]): number {
        if (!events || events.length === 0) return 0;

        const errors = events.filter(e => e.type === 'input' && e.isCorrect === false);
        const totalInputs = events.filter(e => e.type === 'input');

        if (errors.length === 0 || totalInputs.length === 0) return 0;

        // Count fast errors
        const fastErrors = errors.filter(e => {
            const rt = e.data?.rt || e.data?.reactionTime || 0;
            return rt < 150;
        });

        // Ratio of Fast Errors to Total Inputs (Frequency of impulsive actions)
        // or Ratio of Fast Errors to Total Errors (Nature of errors)
        // Let's use Ratio of Fast Errors to Total Errors to characterize the "style" of failure.
        const impulseRatio = fastErrors.length / errors.length;

        return Math.round(impulseRatio * 100);
    },

    // --- 3. Profile Update ---

    updateProfile(currentProfile: CognitiveProfile, session: RawGameSession): CognitiveProfile {
        if (!currentProfile) {
            Logger.warn('AnalysisEngine: Missing currentProfile. Using default.');
            currentProfile = DEFAULT_COGNITIVE_PROFILE;
        }
        if (!session) {
            Logger.warn('AnalysisEngine: Missing session data. Returning current profile.');
            return currentProfile;
        }

        try {
            const rtsAll = this.getAllRTs(session);
            // Correct RTs already baked into avgReactionTime by the game hook, but we can verify if needed.

            const speedScore = this.calculateSpeedScore(session.avgReactionTime || 500);
            const accuracyScore = this.calculateAccuracyScore(session.accuracy || 0);

            // Meta Metrics
            const stabilityIndex = this.calculateStabilityIndex(rtsAll);
            const fatigueScore = this.detectFatigue(rtsAll);
            const impulseScore = this.detectImpulsivity(session.events || []);

            // EWMA (Exponential Weighted Moving Average)
            // Alpha determines how fast we adapt. 0.2 = Moderate adaptation.
            const alpha = 0.2;

            const newProfile = { ...currentProfile };

            newProfile.stabilityOffset = Math.round(currentProfile.stabilityOffset * (1 - alpha) + stabilityIndex * alpha) || 50;
            newProfile.fatigueIndex = Math.round((currentProfile.fatigueIndex || 0) * (1 - alpha) + fatigueScore * alpha) || 0;
            newProfile.impulseFactor = Math.round((currentProfile.impulseFactor || 0) * (1 - alpha) + impulseScore * alpha) || 0;

            if (session.gameId === 'speed-match') {
                newProfile.speed = Math.round((currentProfile.speed || 50) * (1 - alpha) + speedScore * alpha);
                newProfile.focus = Math.round((currentProfile.focus || 50) * (1 - alpha) + accuracyScore * alpha);
            } else if (session.gameId === 'memory-grid') {
                const memoryScore = session.score > 0 ? clamp(session.score / 5, 0, 100) : 0;
                newProfile.memory = Math.round((currentProfile.memory || 50) * (1 - alpha) + memoryScore * alpha);

                // If user was fast in memory grid, boost speed slightly
                if (session.avgReactionTime > 0) {
                    newProfile.speed = Math.round((currentProfile.speed || 50) * (1 - alpha) + speedScore * alpha);
                }
            } else if (session.gameId === 'dopamine-reset' || session.gameId === 'impulse-control') {
                // Focus / Stability boost
                newProfile.focus = Math.round((currentProfile.focus || 50) * (1 - alpha) + accuracyScore * alpha);
            }

            return newProfile;
        } catch (e) {
            Logger.error('AnalysisEngine: updateProfile failed', e);
            return currentProfile;
        }
    },

    /**
     * Calculates the overall Mentra Score (0-100) based on cognitive profile.
     */
    calculateMentraScore(profile: CognitiveProfile): number {
        const scores = [profile.memory, profile.focus, profile.speed];
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return Math.round(avg);
    }
};
