import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { GameEvent } from '@/services/engine/types';
import { Logger } from '@/services/logger';
import { ProgressionEngine } from '../../progression/ProgressionEngine';

export function useFlexibilityDomain(domainLevel: number = 1, forcePro: boolean = false) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'results'>('idle');
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(60);

    const [accuracy, setAccuracy] = useState(0);
    const [reactionTimeMs, setReactionTimeMs] = useState(0);

    const [activeRule, setActiveRule] = useState<'match_color' | 'match_shape'>('match_shape');

    // Metrics
    const eventLog = useRef<GameEvent[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const params = ProgressionEngine.getFlexibilityParams(domainLevel);

    const startGame = () => {
        if (!forcePro) {
            Logger.warn("Attempted to start Flexibility domain without Pro access");
            return;
        }
        setScore(0);
        setTimeRemaining(60);
        setIsPlaying(true);
        setGameState('playing');
        setActiveRule('match_shape');

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) return 0;
                // rule switch logic stub
                if (params.ruleSwitchOccurrences > 0 && prev === 30) {
                    setActiveRule('match_color');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState('results');
        setAccuracy(85); // Stub
        setReactionTimeMs(650); // Stub
    };

    useEffect(() => {
        if (timeRemaining === 0 && isPlaying) {
            stopGame();
        }
    }, [timeRemaining, isPlaying]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        isPlaying,
        gameState,
        score,
        timeRemaining,
        activeRule,
        accuracy,
        reactionTimeMs,
        startGame,
        stopGame
    };
}
