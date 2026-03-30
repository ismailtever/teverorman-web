import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '@/services/logger';
import { NotificationService } from '@/services/notifications';
import { Storage } from '@/services/storage';
import { AnalysisEngine, DEFAULT_COGNITIVE_PROFILE } from '@/services/engine/AnalysisEngine';
import { RawGameSession } from '@/services/engine/types';
import { Streak } from '@/services/streak';

export type GridFocusState = 'idle' | 'pre_game' | 'countdown' | 'playing' | 'success' | 'fail' | 'results';

interface GameConfig {
    gridSize: number;       // 5 for standard Schulte Table
    timeLimit: number;      // seconds
    target: number;         // current number to find (1 ... gridSize^2)
}

interface SessionMetrics {
    correctTaps: number;
    wrongTaps: number;
    tapTimestamps: number[];   // ms timestamps per correct tap
    finishedAt: number;
}

export function useGridFocusDomain(level: number = 1) {
    const gridSize = level <= 2 ? 4 : 5;              // 4x4 beginner, 5x5 advanced
    const timeLimit = level <= 2 ? 60 : 90;           // seconds

    const [gameState, setGameState] = useState<GridFocusState>('idle');
    const [grid, setGrid] = useState<number[]>([]);    // shuffled 1..N array
    const [target, setTarget] = useState(1);           // which number to find next
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [countdown, setCountdown] = useState(3);
    const [lastTapCorrect, setLastTapCorrect] = useState<boolean | null>(null);

    // Result outputs
    const [accuracy, setAccuracy] = useState(0);
    const [avgReactionMs, setAvgReactionMs] = useState(0);
    const [score, setScore] = useState(0);

    const metricsRef = useRef<SessionMetrics>({
        correctTaps: 0,
        wrongTaps: 0,
        tapTimestamps: [],
        finishedAt: 0,
    });
    const lastCorrectTime = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Bug fix: keep a ref for gameState to prevent stale closure in handleCellTap
    const gameStateRef = useRef<GridFocusState>('idle');

    // ── Helpers ──────────────────────────────────────────────────────────────

    const shuffleGrid = useCallback(() => {
        const total = gridSize * gridSize;
        const arr = Array.from({ length: total }, (_, i) => i + 1);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [gridSize]);

    const clearTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };

    // ── Start / Stop ──────────────────────────────────────────────────────────

    const initGame = useCallback(() => {
        clearTimers();
        metricsRef.current = { correctTaps: 0, wrongTaps: 0, tapTimestamps: [], finishedAt: 0 };
        setGrid(shuffleGrid());
        setTarget(1);
        setTimeRemaining(timeLimit);
        setLastTapCorrect(null);
        setAccuracy(0);
        setAvgReactionMs(0);
        setScore(0);
        setCountdown(3);
        gameStateRef.current = 'pre_game';
        setGameState('pre_game');
    }, [shuffleGrid, timeLimit]);

    const startCountdown = useCallback(() => {
        gameStateRef.current = 'countdown';
        setGameState('countdown');
        let cd = 3;
        countdownRef.current = setInterval(() => {
            cd -= 1;
            setCountdown(cd);
            if (cd <= 0) {
                clearInterval(countdownRef.current!);
                gameStateRef.current = 'playing';
                setGameState('playing');
                lastCorrectTime.current = Date.now();
                startTimer();
            }
        }, 1000);
    }, []);

    const startTimer = () => {
        let remaining = timeLimit;
        timerRef.current = setInterval(() => {
            remaining -= 1;
            setTimeRemaining(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current!);
                finishSession();
            }
        }, 1000);
    };

    const finishSession = useCallback(async () => {
        clearTimers();
        gameStateRef.current = 'results';
        const m = metricsRef.current;
        const total = m.correctTaps + m.wrongTaps;
        const acc = total > 0 ? m.correctTaps / total : 0;

        let avgRt = 0;
        if (m.tapTimestamps.length > 1) {
            const diffs = m.tapTimestamps.slice(1).map((t, i) => t - m.tapTimestamps[i]);
            avgRt = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        }

        const s = Math.round(m.correctTaps * 100 * acc * (1 + level * 0.1));
        setAccuracy(Math.round(acc * 100));
        setAvgReactionMs(Math.round(avgRt));
        setScore(s);
        setGameState('results');

        // Construct Session for Analysis Engine
        const session: RawGameSession = {
            sessionId: `${Date.now()}-grid-focus`,
            gameId: 'grid-focus',
            timestamp: new Date().toISOString(),
            durationSeconds: timeLimit - timeRemaining,
            events: [],
            rtAllMs: [], 
            rtCorrectMs: m.tapTimestamps.slice(1).map((t, i) => t - m.tapTimestamps[i]),
            score: s,
            accuracy: acc,
            avgReactionTime: avgRt,
            maxStreak: m.correctTaps
        };

        // Persist and Sync
        try {
            await Storage.saveSession(session);
            await Storage.saveGameScore('grid-focus', s);
            
            const currentProfile = await Storage.getCognitiveProfile() || DEFAULT_COGNITIVE_PROFILE;
            const updatedProfile = AnalysisEngine.updateProfile(currentProfile, session);
            await Storage.saveCognitiveProfile(updatedProfile);

            const newMentraScore = AnalysisEngine.calculateMentraScore(updatedProfile);
            await Storage.saveGlobalScore(newMentraScore);
            
            // Record streak
            await Streak.recordSession();
            
            Logger.log('GridFocus: Profile & Global Score Synced', newMentraScore);
        } catch (e) {
            Logger.error('GridFocus sync error', e);
        }

        // Cancel the 20:00 streak reminder for today
        NotificationService.cancelStreakReminderForToday();
    }, [level, timeLimit, timeRemaining]);

    // ── Tap Handler ──────────────────────────────────────────────────────────

    const handleCellTap = useCallback((value: number) => {
        // Bug fix: use ref instead of closure to avoid stale gameState
        if (gameStateRef.current !== 'playing') return;

        // Clear any pending flash before processing new tap
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

        if (value === target) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const now = Date.now();
            metricsRef.current.correctTaps += 1;
            metricsRef.current.tapTimestamps.push(now);
            lastCorrectTime.current = now;
            setLastTapCorrect(true);

            const totalCells = gridSize * gridSize;
            if (target >= totalCells) {
                // Completed the full grid — instant win
                metricsRef.current.finishedAt = Date.now();
                finishSession();
                return;
            }

            setTarget(prev => prev + 1);

            // Reshuffle for next round if pro grid mode
            if (level >= 3) setGrid(shuffleGrid());
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            metricsRef.current.wrongTaps += 1;
            setLastTapCorrect(false);
        }

        // Bug fix: reset both correct and wrong flash feedback after 300ms
        flashTimeoutRef.current = setTimeout(() => setLastTapCorrect(null), 300);
    }, [target, gridSize, level, shuffleGrid, finishSession]);

    // ── Cleanup ───────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => clearTimers();
    }, []);

    return {
        gameState,
        grid,
        gridSize,
        target,
        timeRemaining,
        countdown,
        lastTapCorrect,
        accuracy,
        avgReactionMs,
        score,
        initGame,
        startCountdown,
        handleCellTap,
    };
}
