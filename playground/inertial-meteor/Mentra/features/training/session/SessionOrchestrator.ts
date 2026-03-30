import { useState, useEffect, useCallback } from 'react';
import { Storage } from '@/services/storage';
import { InsightGenerator } from '../insights/InsightGenerator';
import { ProgressionEngine } from '../progression/ProgressionEngine';
import { Logger } from '@/services/logger';

export type SessionPhase = 'activation' | 'warmup' | 'core' | 'burst' | 'results';

export function useSessionOrchestrator(isPro: boolean = false) {
    const [phase, setPhase] = useState<SessionPhase>('activation');
    const [identityLevel, setIdentityLevel] = useState('Focus');
    const [weeklyTheme, setWeeklyTheme] = useState('');

    // Aggregated Session Stats
    const [totalScore, setTotalScore] = useState(0);
    const [accuracies, setAccuracies] = useState<number[]>([]);
    const [reactionTimes, setReactionTimes] = useState<number[]>([]);

    const [insight, setInsight] = useState('');

    useEffect(() => {
        Storage.getUserProfile().then(p => {
            if (p && p.identityLevel) setIdentityLevel(p.identityLevel);
        });
        const theme = ProgressionEngine.getWeeklyTheme();
        setWeeklyTheme(theme);
        Logger.log('session_started', { theme, is_pro: isPro, domains: ['memory', 'speed'] });
    }, []);

    const handlePhaseComplete = useCallback((domain: 'memory' | 'speed' | 'flexibility', score: number, acc: number, rt: number) => {
        setTotalScore(prev => prev + score);
        setAccuracies(prev => [...prev, acc]);
        setReactionTimes(prev => [...prev, rt]);

        // Log individual phase complete
        Logger.log('phase_completed', { phase, domain, accuracy: acc, time: rt });

        // Update rolling progression profile for this domain
        ProgressionEngine.evaluateSession(domain, acc * 100, rt, 80); // stub stability

        if (phase === 'warmup') {
            setPhase('core');
        } else if (phase === 'core') {
            setPhase('burst');
        } else if (phase === 'burst') {
            finishSession([...accuracies, acc], [...reactionTimes, rt]);
        }
    }, [phase, accuracies, reactionTimes, identityLevel]);

    const finishSession = useCallback((finalAccs: number[], finalRts: number[]) => {
        const avgAcc = finalAccs.reduce((a, b) => a + b, 0) / (finalAccs.length || 1);
        const avgRt = finalRts.reduce((a, b) => a + b, 0) / (finalRts.length || 1);
        const stability = 85; // Simulated variance

        const insightMsg = InsightGenerator.generate({
            accuracy: avgAcc * 100,
            reactionTime: avgRt,
            stabilityScore: stability
        }, identityLevel);

        setInsight(insightMsg);
        setPhase('results');

        Logger.log('session_completed', {
            accuracy: avgAcc,
            speed: avgRt,
            stability,
            domains: ['memory', 'speed']
        });
    }, [identityLevel]);

    return {
        phase,
        setPhase,
        identityLevel,
        weeklyTheme,
        totalScore,
        accuracies,
        reactionTimes,
        insight,
        handlePhaseComplete
    };
}
