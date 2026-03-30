import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { GameEvent } from '@/services/engine/types';
import { ProgressionEngine } from '../../progression/ProgressionEngine';

export type GameState = 'idle' | 'memorize' | 'recall' | 'success' | 'fail' | 'results';

export function useMemoryGridDomain(startLevel: number = 1, forcePro: boolean = false) {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [gridSize, setGridSize] = useState(3);
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(startLevel);
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [accuracy, setAccuracy] = useState(0);
    const [reactionTimeMs, setReactionTimeMs] = useState(0);

    // Variations
    const [isReverse, setIsReverse] = useState(false);
    const [hasDecoys, setHasDecoys] = useState(false);

    // Metrics
    const eventLog = useRef<GameEvent[]>([]);
    const rtAllMs = useRef<number[]>([]);
    const rtCorrectMs = useRef<number[]>([]);
    const lastInputTime = useRef<number>(0);
    const sessionStartTime = useRef<number>(0);

    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearTimeouts = () => {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
    };

    const startGame = () => {
        setScore(0);
        setLevel(startLevel);
        setAccuracy(0);
        setReactionTimeMs(0);

        eventLog.current = [];
        rtAllMs.current = [];
        rtCorrectMs.current = [];
        sessionStartTime.current = Date.now();

        startRound(startLevel);
    };

    const stopGame = () => {

        // Calculate REAL Accuracy
        const inputs = eventLog.current.filter(e => e.type === 'input');
        const correctInputs = inputs.filter(e => e.isCorrect);
        const finalAccuracy = inputs.length > 0 ? correctInputs.length / inputs.length : 0;

        // Avg RT
        const avgRT = rtCorrectMs.current.length > 0
            ? rtCorrectMs.current.reduce((a, b) => a + b, 0) / rtCorrectMs.current.length
            : 0;

        setAccuracy(finalAccuracy * 100);
        setReactionTimeMs(avgRT);
        setGameState('results');
    };

    const startRound = (lvl: number) => {
        setGameState('idle');
        setUserSequence([]);
        setActiveCell(null);

        // progression engine params
        const params = ProgressionEngine.getMemoryParams(lvl);
        setGridSize(params.gridSize);
        setHasDecoys(params.hasDecoys);

        // Pseudo-randomly decide reverse mode if level > 5 (Phase 10 Variation)
        const reverseRound = lvl > 5 && Math.random() > 0.6;
        setIsReverse(reverseRound);

        // Generate Sequence
        const newSequence: number[] = [];
        for (let i = 0; i < params.sequenceLength; i++) {
            newSequence.push(Math.floor(Math.random() * (params.gridSize * params.gridSize)));
        }
        setSequence(newSequence);

        eventLog.current.push({
            timestamp: Date.now(),
            timeOffset: Date.now() - sessionStartTime.current,
            type: 'level_up',
            data: { level: lvl, sequenceLength: params.sequenceLength, isReverse: reverseRound }
        });

        const t1 = setTimeout(() => {
            setGameState('memorize');
            playSequence(newSequence);
        }, 1000);
        timeouts.current.push(t1);
    };

    const playSequence = (seq: number[]) => {
        let i = 0;
        const interval = setInterval(() => {
            if (i >= seq.length) {
                clearInterval(interval);
                setActiveCell(null);
                setGameState('recall');
                lastInputTime.current = Date.now();
                return;
            }

            setActiveCell(seq[i]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const t = setTimeout(() => {
                setActiveCell(null);
            }, forcePro ? 400 : 600);
            timeouts.current.push(t);

            i++;
        }, forcePro ? 600 : 800);
    };

    const handleCellPress = (index: number) => {
        if (gameState !== 'recall') return;

        const now = Date.now();
        const rt = now - lastInputTime.current;
        lastInputTime.current = now;

        const nextIndex = userSequence.length;
        // Determine expected based on variation
        const expectedIndex = isReverse ? sequence[sequence.length - 1 - nextIndex] : sequence[nextIndex];
        const isCorrect = index === expectedIndex;

        eventLog.current.push({
            timestamp: now,
            timeOffset: now - sessionStartTime.current,
            type: 'input',
            data: { index, rt },
            isCorrect
        });

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
            const nextLevel = level + 1;
            setLevel(nextLevel);
            startRound(nextLevel);
        }, 1500);
        timeouts.current.push(t);
    };

    const handleFail = () => {
        setGameState('fail');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        stopGame();
    };

    useEffect(() => {
        return () => clearTimeouts();
    }, []);

    return {
        gameState,
        gridSize,
        activeCell,
        userSequence,
        accuracy,
        reactionTimeMs,
        score,
        level,
        isReverse,
        hasDecoys,
        startGame,
        stopGame,
        handleCellPress,
        // Helper to know if a cell was correct/wrong for rendering
        lastInputCorrect: gameState !== 'fail',
        sequenceLength: sequence.length
    };
}
