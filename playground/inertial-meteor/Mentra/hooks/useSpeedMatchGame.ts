import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

import { Storage } from '@/services/storage';
import { GameEvent, RawGameSession } from '@/services/engine/types';
import { AnalysisEngine, DEFAULT_COGNITIVE_PROFILE } from '@/services/engine/AnalysisEngine';
import { Logger } from '@/services/logger';

export function useSpeedMatchGame(isPro: boolean = false) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'results'>('idle');
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);

    // Results
    const [accuracy, setAccuracy] = useState(0);
    const [reactionTimeMs, setReactionTimeMs] = useState(0);

    // Game State
    const [currentSymbol, setCurrentSymbol] = useState<string>('');
    const [previousSymbol, setPreviousSymbol] = useState<string | null>(null);
    const isMounted = useRef(true);
    const isProcessingGuess = useRef(false);

    // Metrics
    const eventLog = useRef<GameEvent[]>([]);
    const rtAllMs = useRef<number[]>([]);      // All inputs (correct + error)
    const rtCorrectMs = useRef<number[]>([]);  // Correct only
    const lastStimulusTime = useRef<number>(0);
    const gameStartTime = useRef<number>(0);

    const symbols = ['square', 'circle', 'triangle', 'diamond', 'star'];
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /**
     * Deterministic Generation
     */
    const generateSymbol = (prev: string | null): string => {
        const timestamp = Date.now();
        lastStimulusTime.current = timestamp;

        // 35% chance to match previous (N-back = 1)
        if (prev && Math.random() < 0.35) {
            // Match
            const newSymbol = prev;
            logStimulus(newSymbol, timestamp);
            return newSymbol;
        } else {
            // No Match (Explicitly different)
            const remaining = symbols.filter(s => s !== prev);
            const newSymbol = remaining[Math.floor(Math.random() * remaining.length)];
            logStimulus(newSymbol, timestamp);
            return newSymbol;
        }
    };

    const logStimulus = (symbol: string, timestamp: number) => {
        eventLog.current.push({
            timestamp,
            timeOffset: timestamp - gameStartTime.current,
            type: 'stimulus',
            data: { symbol }
        });
    };

    // Phase progression logic (60s total -> 20s per phase)
    useEffect(() => {
        if (!isPlaying) return;
        if (timeRemaining > 40 && currentPhase !== 1) setCurrentPhase(1);
        if (timeRemaining <= 40 && timeRemaining > 20 && currentPhase !== 2) setCurrentPhase(2);
        if (timeRemaining <= 20 && currentPhase !== 3) setCurrentPhase(3);
    }, [timeRemaining, isPlaying]);

    // Auto-Advance First Symbol
    useEffect(() => {
        // If we are playing, have a current symbol, but NO previous symbol,
        // it means we are in the "First Card" state. User cannot match yet.
        // Auto-advance after 900ms to get the game moving.
        if (isPlaying && currentSymbol && !previousSymbol) {
            const t = setTimeout(() => {
                if (!isMounted.current) return;
                // Advance using explicit variable passing to avoid async state race
                const prev = currentSymbol;
                setPreviousSymbol(prev);

                const next = generateSymbol(prev);
                setCurrentSymbol(next);

                Haptics.selectionAsync().catch(() => {}); // Subtle cue
            }, 900);
            return () => clearTimeout(t);
        }
    }, [isPlaying, currentSymbol, previousSymbol]);

    const startGame = () => {
        setScore(0);
        setTimeRemaining(60);
        setCurrentPhase(1);
        setIsPlaying(true);
        setGameState('playing');
        setPreviousSymbol(null);

        // Reset Metrics
        eventLog.current = [];
        rtAllMs.current = [];
        rtCorrectMs.current = [];
        gameStartTime.current = Date.now();

        // Initial Symbol
        const first = symbols[Math.floor(Math.random() * symbols.length)];
        setCurrentSymbol(first);
        lastStimulusTime.current = Date.now();
        logStimulus(first, lastStimulusTime.current);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!isMounted.current) {
                if (timerRef.current) clearInterval(timerRef.current);
                return;
            }
            setTimeRemaining((prev) => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);
    };

    const stopGame = async () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);

        const timestamp = new Date().toISOString();
        const duration = (Date.now() - gameStartTime.current) / 1000;

        // Calculate Aggregate Stats
        const inputs = eventLog.current.filter(e => e.type === 'input');
        const correctInputs = inputs.filter(e => e.isCorrect);
        const totalInputs = inputs.length;
        const accuracy = totalInputs > 0 ? correctInputs.length / totalInputs : 0;

        // Avg RT (Correct Only) - strictly for Speed Score
        const avgCorrectRT = rtCorrectMs.current.length > 0
            ? rtCorrectMs.current.reduce((a, b) => a + b, 0) / rtCorrectMs.current.length
            : 0;

        // Construct Session
        const session: RawGameSession = {
            sessionId: `${Date.now()}-speed-match`,
            gameId: 'speed-match',
            timestamp,
            durationSeconds: duration,
            events: eventLog.current,
            rtAllMs: rtAllMs.current,
            rtCorrectMs: rtCorrectMs.current,
            score,
            accuracy: accuracy,
            avgReactionTime: avgCorrectRT,
            maxStreak: 0
        };

        setAccuracy(accuracy * 100);
        setReactionTimeMs(avgCorrectRT);
        if (isMounted.current) setGameState('results');

        // 1. Save Session & Data
        await Storage.saveSession(session);
        await Storage.saveGameScore('speed-match', score);
        Logger.log('SpeedMatch Session Saved', session.sessionId);

        // 2. Auto-Update Cognitive Profile
        try {
            const currentProfile = await Storage.getCognitiveProfile() || DEFAULT_COGNITIVE_PROFILE;
            const updatedProfile = AnalysisEngine.updateProfile(currentProfile, session);
            await Storage.saveCognitiveProfile(updatedProfile);
            Logger.log('Profile Auto-Updated');

            // 3. Update Global Mentra Score for Dashboard Sync
            const newMentraScore = AnalysisEngine.calculateMentraScore(updatedProfile);
            await Storage.saveGlobalScore(newMentraScore);
            Logger.log('Global Score Updated', newMentraScore);
        } catch (e) {
            Logger.error('Failed auto profile/score update', e);
        }
    };

    const handleGuess = (isMatchGuess: boolean) => {
        if (!isPlaying) return;

        // Prevent input on First Symbol (Corrupt Telemetry Prevention)
        if (!previousSymbol || isProcessingGuess.current) return;
        isProcessingGuess.current = true;

        const now = Date.now();
        const rt = now - lastStimulusTime.current;

        const isActualMatch = currentSymbol === previousSymbol;
        const isCorrect = isMatchGuess === isActualMatch;

        // Log Input
        eventLog.current.push({
            timestamp: now,
            timeOffset: now - gameStartTime.current,
            type: 'input',
            data: { rt, guess: isMatchGuess, actual: isActualMatch },
            isCorrect
        });

        // Always push to All RTs (Stability/Impulsivity/Fatigue use this)
        rtAllMs.current.push(rt);

        if (isCorrect) {
            setScore(s => s + 10);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            rtCorrectMs.current.push(rt);
        } else {
            setScore(s => Math.max(0, s - 5));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        // Next Turn
        const prev = currentSymbol;
        setPreviousSymbol(prev);
        const next = generateSymbol(prev);
        setCurrentSymbol(next);

        // Throttle input slightly to allow UI to reflect state
        setTimeout(() => {
            isProcessingGuess.current = false;
        }, 50);
    };

    // Auto-Stop
    useEffect(() => {
        if (timeRemaining === 0 && isPlaying) {
            stopGame();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [timeRemaining, isPlaying]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        isPlaying,
        gameState,
        score,
        timeRemaining,
        currentPhase,
        currentSymbol,
        accuracy,
        reactionTimeMs,
        startGame,
        handleGuess,
        isInputAllowed: !!previousSymbol && isPlaying
    };
}
