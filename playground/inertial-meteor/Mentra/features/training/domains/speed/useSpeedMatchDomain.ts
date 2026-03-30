import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

import { GameEvent } from '@/services/engine/types';
import { Logger } from '@/services/logger';
import { ProgressionEngine } from '../../progression/ProgressionEngine';

export function useSpeedMatchDomain(domainLevel: number = 1, forcePro: boolean = false) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'results'>('idle');
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(45); // Burst phase is typically 45s
    const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(3);

    // Results
    const [accuracy, setAccuracy] = useState(0);
    const [reactionTimeMs, setReactionTimeMs] = useState(0);

    // Game State
    const [currentSymbol, setCurrentSymbol] = useState<string>('');
    const [previousSymbol, setPreviousSymbol] = useState<string | null>(null);

    // Metrics
    const eventLog = useRef<GameEvent[]>([]);
    const rtAllMs = useRef<number[]>([]);
    const rtCorrectMs = useRef<number[]>([]);
    const lastStimulusTime = useRef<number>(0);
    const gameStartTime = useRef<number>(0);

    const symbols = ['square', 'circle', 'triangle', 'diamond', 'star'];
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const responseWindowRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const params = ProgressionEngine.getSpeedParams(domainLevel);

    const generateSymbol = (prev: string | null): string => {
        const timestamp = Date.now();
        lastStimulusTime.current = timestamp;

        let newSymbol = '';
        if (prev && Math.random() < 0.35) {
            newSymbol = prev;
        } else {
            const remaining = symbols.filter(s => s !== prev);
            newSymbol = remaining[Math.floor(Math.random() * remaining.length)];
        }
        logStimulus(newSymbol, timestamp);

        // Variation: Limited Response Window
        if (responseWindowRef.current) clearTimeout(responseWindowRef.current);

        // Wait gracefully if it's the very first symbol
        if (prev) {
            responseWindowRef.current = setTimeout(() => {
                if (isPlaying) {
                    setScore(s => Math.max(0, s - 5));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

                    // Auto-advance due to timeout
                    const p = newSymbol;
                    setPreviousSymbol(p);
                    const n = generateSymbol(p);
                    setCurrentSymbol(n);
                }
            }, params.responseWindowMs);
        }

        return newSymbol;
    };

    const logStimulus = (symbol: string, timestamp: number) => {
        eventLog.current.push({
            timestamp,
            timeOffset: timestamp - gameStartTime.current,
            type: 'stimulus',
            data: { symbol }
        });
    };

    // Auto-Advance First Symbol
    useEffect(() => {
        if (isPlaying && currentSymbol && !previousSymbol) {
            const t = setTimeout(() => {
                const prev = currentSymbol;
                setPreviousSymbol(prev);

                const next = generateSymbol(prev);
                setCurrentSymbol(next);
                Haptics.selectionAsync();
            }, 900);
            return () => clearTimeout(t);
        }
    }, [isPlaying, currentSymbol, previousSymbol]);

    const startGame = () => {
        setScore(0);
        setTimeRemaining(45);
        setIsPlaying(true);
        setGameState('playing');
        setPreviousSymbol(null);

        // Reset Metrics
        eventLog.current = [];
        rtAllMs.current = [];
        rtCorrectMs.current = [];
        gameStartTime.current = Date.now();

        const first = symbols[Math.floor(Math.random() * symbols.length)];
        setCurrentSymbol(first);
        lastStimulusTime.current = Date.now();
        logStimulus(first, lastStimulusTime.current);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (responseWindowRef.current) clearTimeout(responseWindowRef.current);

        const inputs = eventLog.current.filter(e => e.type === 'input');
        const correctInputs = inputs.filter(e => e.isCorrect);
        const totalInputs = inputs.length;
        const finalAccuracy = totalInputs > 0 ? correctInputs.length / totalInputs : 0;

        const avgCorrectRT = rtCorrectMs.current.length > 0
            ? rtCorrectMs.current.reduce((a, b) => a + b, 0) / rtCorrectMs.current.length
            : 0;

        setAccuracy(finalAccuracy * 100);
        setReactionTimeMs(avgCorrectRT);
        setGameState('results');
    };

    const handleGuess = (isMatchGuess: boolean) => {
        if (!isPlaying || !previousSymbol) return;

        const now = Date.now();
        const rt = now - lastStimulusTime.current;

        const isActualMatch = currentSymbol === previousSymbol;
        const isCorrect = isMatchGuess === isActualMatch;

        if (responseWindowRef.current) clearTimeout(responseWindowRef.current);

        eventLog.current.push({
            timestamp: now,
            timeOffset: now - gameStartTime.current,
            type: 'input',
            data: { rt, guess: isMatchGuess, actual: isActualMatch },
            isCorrect
        });

        rtAllMs.current.push(rt);

        if (isCorrect) {
            setScore(s => s + 10);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            rtCorrectMs.current.push(rt);
        } else {
            setScore(s => Math.max(0, s - 5));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        const prev = currentSymbol;
        setPreviousSymbol(prev);
        const next = generateSymbol(prev);
        setCurrentSymbol(next);
    };

    useEffect(() => {
        if (timeRemaining === 0 && isPlaying) {
            stopGame();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [timeRemaining, isPlaying]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (responseWindowRef.current) clearTimeout(responseWindowRef.current);
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
        stopGame,
        handleGuess,
        isInputAllowed: !!previousSymbol && isPlaying
    };
}
