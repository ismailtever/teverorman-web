import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Storage } from '@/services/storage';
import { RawGameSession, GameEvent } from '@/services/engine/types';
import { AnalysisEngine, DEFAULT_COGNITIVE_PROFILE } from '@/services/engine/AnalysisEngine';
import { Logger } from '@/services/logger';

export type GameState = 'idle' | 'memorize' | 'recall' | 'success' | 'fail' | 'results';

export function useMemoryGridGame(isPro: boolean = false) {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [gridSize, setGridSize] = useState(3);
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);
    const [accuracy, setAccuracy] = useState(0);
    const [reactionTimeMs, setReactionTimeMs] = useState(0);
    const isMounted = useRef(true);

    // Metrics
    const eventLog = useRef<GameEvent[]>([]);
    const rtAllMs = useRef<number[]>([]);
    const rtCorrectMs = useRef<number[]>([]);
    const lastInputTime = useRef<number>(0);
    const sessionStartTime = useRef<number>(0);

    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
    const intervals = useRef<ReturnType<typeof setInterval>[]>([]);

    const clearTimeouts = () => {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
        intervals.current.forEach(clearInterval);
        intervals.current = [];
    };

    const startGame = () => {
        setScore(0);
        setLevel(1);
        setCurrentPhase(1);
        setAccuracy(0);
        setReactionTimeMs(0);
        setGridSize(3);

        eventLog.current = [];
        rtAllMs.current = [];
        rtCorrectMs.current = [];
        sessionStartTime.current = Date.now();

        startLevel(1, 3);
    };

    const stopGame = async () => {
        const now = Date.now();
        const duration = (now - sessionStartTime.current) / 1000;

        // Calculate REAL Accuracy
        const inputs = eventLog.current.filter(e => e.type === 'input');
        const correctInputs = inputs.filter(e => e.isCorrect);
        const accuracy = inputs.length > 0 ? correctInputs.length / inputs.length : 0;

        // Avg RT (Correct Inputs Only - how fast you recall correctly)
        const avgRT = rtCorrectMs.current.length > 0
            ? rtCorrectMs.current.reduce((a, b) => a + b, 0) / rtCorrectMs.current.length
            : 0;

        const session: RawGameSession = {
            sessionId: `${now}-memory-grid`,
            gameId: 'memory-grid',
            timestamp: new Date().toISOString(),
            durationSeconds: duration,
            events: eventLog.current,
            rtAllMs: rtAllMs.current,
            rtCorrectMs: rtCorrectMs.current,
            score,
            accuracy: accuracy,
            avgReactionTime: avgRT,
            maxStreak: level
        };

        setAccuracy(accuracy * 100);
        setReactionTimeMs(avgRT);
        if (isMounted.current) setGameState('results');

        // 1. Save Session & Data
        await Storage.saveSession(session);
        await Storage.saveGameScore('memory-grid', score);
        Logger.log('MemoryGrid Session Saved', session.sessionId);

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

    const startLevel = (lvl: number, size: number) => {
        setGameState('idle');
        setUserSequence([]);
        setActiveCell(null);

        // Calculate phase progression dynamically
        if (lvl <= 2 && currentPhase !== 1) setCurrentPhase(1);
        if (lvl > 2 && lvl <= 4 && currentPhase !== 2) setCurrentPhase(2);
        if (lvl > 4 && currentPhase !== 3) setCurrentPhase(3);

        // Generate Sequence
        const sequenceLength = Math.min(3 + Math.floor((lvl - 1) / 2), 8);
        const newSequence: number[] = [];
        for (let i = 0; i < sequenceLength; i++) {
            newSequence.push(Math.floor(Math.random() * (size * size)));
        }
        setSequence(newSequence);

        eventLog.current.push({
            timestamp: Date.now(),
            timeOffset: Date.now() - sessionStartTime.current,
            type: 'level_up',
            data: { level: lvl, sequenceLength }
        });

        const t1 = setTimeout(() => {
            if (!isMounted.current) return;
            setGameState('memorize');
            playSequence(newSequence);
        }, 1000);
        timeouts.current.push(t1);
    };

    const playSequence = (seq: number[]) => {
        let i = 0;
        const interval = setInterval(() => {
            if (!isMounted.current) {
                clearInterval(interval);
                return;
            }
            if (i >= seq.length) {
                clearInterval(interval);
                setActiveCell(null);
                setGameState('recall');
                lastInputTime.current = Date.now(); // Start clock for memory recall
                return;
            }

            setActiveCell(seq[i]);
            // Subtle haptic for stimulus
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

            // Log Stimulus
            eventLog.current.push({
                timestamp: Date.now(),
                timeOffset: Date.now() - sessionStartTime.current,
                type: 'stimulus',
                data: { index: seq[i] }
            });

            const t = setTimeout(() => {
                if (isMounted.current) setActiveCell(null);
            }, isPro ? 400 : 600); // Faster tempo for Pro mode (Phase 9 feature requirement)
            timeouts.current.push(t);

            i++;
        }, isPro ? 600 : 800);
        intervals.current.push(interval);
    };

    const handleCellPress = (index: number) => {
        if (gameState !== 'recall') return;

        const now = Date.now();
        const rt = now - lastInputTime.current;
        lastInputTime.current = now; // reset delta for next item

        const nextIndex = userSequence.length;
        const expectedIndex = sequence[nextIndex];
        const isCorrect = index === expectedIndex;

        // Log Input
        eventLog.current.push({
            timestamp: now,
            timeOffset: now - sessionStartTime.current,
            type: 'input',
            data: { index, rt },
            isCorrect
        });

        // Always push to All RTs
        rtAllMs.current.push(rt);

        if (isCorrect) {
            rtCorrectMs.current.push(rt);
            Haptics.selectionAsync();

            const newUserSeq = [...userSequence, index];
            setUserSequence(newUserSeq);

            if (newUserSeq.length === sequence.length) {
                handleSuccess();
            }
        } else {
            handleFail();
        }
    };

    const handleSuccess = () => {
        setGameState('success');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScore(prev => prev + (level * 10));

        const t = setTimeout(() => {
            if (!isMounted.current) return;
            const nextLevel = level + 1;
            setLevel(nextLevel);
            const newSize = nextLevel > 5 ? 4 : 3;
            setGridSize(newSize);
            startLevel(nextLevel, newSize);
        }, 1500);
        timeouts.current.push(t);
    };

    const handleFail = () => {
        setGameState('fail');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        stopGame(); // Persist data
    };

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            clearTimeouts();
        };
    }, []);

    return {
        gameState,
        gridSize,
        currentPhase,
        activeCell,
        userSequence,
        accuracy,
        reactionTimeMs,
        score,
        level,
        startGame,
        handleCellPress,
        // Helper to know if a cell was correct/wrong for rendering
        lastInputCorrect: gameState !== 'fail'
    };
}
