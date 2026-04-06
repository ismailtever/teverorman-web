import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { X, Brain, CheckCircle, Zap, TrendingUp, BarChart2 } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Card, StatCard } from '@/components/ui/Cards';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { useI18n } from '@/services/i18n';
import { getPremiumStatus } from '@/services/purchases';

// Core Engine
import { useSessionOrchestrator } from '@/features/training/session/SessionOrchestrator';

// Game Engines
import { useMemoryGridDomain } from '@/features/training/domains/memory/useMemoryGridDomain';
import { useSpeedMatchDomain } from '@/features/training/domains/speed/useSpeedMatchDomain';

// Shared Components
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { ProgressTimeline } from '@/components/game/ProgressTimeline';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width } = Dimensions.get('window');

// We use 0, 1, 2, 3 internally for the visual stepper
const PhaseMap = {
    activation: 0,
    warmup: 1,
    core: 2,
    burst: 3,
    results: 4
};

export default function DailySessionScreen() {
    const { t } = useI18n();
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        getPremiumStatus().then(setIsPro);
    }, []);

    const {
        phase,
        setPhase,
        weeklyTheme,
        totalScore,
        accuracies,
        reactionTimes,
        insight,
        handlePhaseComplete
    } = useSessionOrchestrator(isPro);

    // Domains
    const warmupEngine = useMemoryGridDomain(3, false);
    const coreEngine = useMemoryGridDomain(10, true);
    const peakEngine = useSpeedMatchDomain(8, false);

    // Helper to start the appropriate engine when entering a view
    useEffect(() => {
        if (phase === 'warmup') warmupEngine.startGame();
        if (phase === 'core') coreEngine.startGame();
        if (phase === 'burst') peakEngine.startGame();
    }, [phase]);

    // Hijack results state from engines
    useEffect(() => {
        if (phase === 'warmup' && warmupEngine.gameState === 'results') {
            handlePhaseComplete('memory', warmupEngine.score, warmupEngine.accuracy / 100, warmupEngine.reactionTimeMs);
        }
    }, [warmupEngine.gameState, phase]);

    useEffect(() => {
        if (phase === 'core' && coreEngine.gameState === 'results') {
            handlePhaseComplete('memory', coreEngine.score, coreEngine.accuracy / 100, coreEngine.reactionTimeMs);
        }
    }, [coreEngine.gameState, phase]);

    useEffect(() => {
        if (phase === 'burst' && peakEngine.gameState === 'results') {
            handlePhaseComplete('speed', peakEngine.score, peakEngine.accuracy / 100, peakEngine.reactionTimeMs);
        }
    }, [peakEngine.gameState, phase]);

    // UI Renders based on phase
    const renderActivation = () => (
        <Animated.View entering={FadeInUp} exiting={FadeOutDown} style={styles.introContainer}>
            <View style={styles.activationCard}>
                <TrendingUp size={48} color={Colors.mentra.brandPrimary} style={{ marginBottom: Metrics.spacing.l }} />
                <ThemedText style={styles.themeBadge}>{t('dailyThemePrefix')} {weeklyTheme.toUpperCase()}</ThemedText>
                <ThemedText style={styles.title}>{t('dailyActivationTitle')}</ThemedText>
                <ThemedText style={styles.subtitle}>
                    {t('dailyActivationSubtitle')}
                </ThemedText>

                <View style={styles.phaseBreakdown}>
                    <ThemedText style={styles.phaseItem}>{t('dailyPhase1')}</ThemedText>
                    <ThemedText style={styles.phaseItem}>{t('dailyPhase2')}</ThemedText>
                    <ThemedText style={styles.phaseItem}>{t('dailyPhase3')}</ThemedText>
                </View>
            </View>

            <PrimaryButton
                title={t('dailyBeginBtn')}
                onPress={() => setPhase('warmup')}
                style={{ width: '80%', marginTop: 20 }}
            />
        </Animated.View>
    );

    const renderResults = () => {
        const avgAcc = accuracies.reduce((a, b) => a + b, 0) / (accuracies.length || 1);
        const avgRt = reactionTimes.reduce((a, b) => a + b, 0) / (reactionTimes.length || 1);

        return (
            <Animated.View entering={FadeInUp} style={styles.introContainer}>
                <View style={styles.headerBox}>
                    <Brain size={48} color={Colors.mentra.brandPrimary} style={{ marginBottom: Metrics.spacing.m }} />
                    <ThemedText style={styles.title}>{t('dailyCompleteTitle')}</ThemedText>
                    <Card style={styles.insightBox} variant="outline">
                        <BarChart2 size={24} color={Colors.mentra.brandAccent} style={{ marginBottom: 8 }} />
                        <ThemedText style={styles.insight}>{insight}</ThemedText>
                    </Card>
                </View>

                <Card variant="outline" style={styles.metricsCard}>
                    <View style={styles.scoreRow}>
                        <ThemedText style={styles.scoreLabel}>{t('dailyCognitiveOutput')}</ThemedText>
                        <ThemedText style={styles.scoreValue}>{totalScore}</ThemedText>
                    </View>

                    <View style={styles.statsGrid}>
                        <StatCard
                            title={t('accuracy')}
                            value={`${Math.round(avgAcc * 100)}%`}
                            icon={<CheckCircle size={18} color={Colors.mentra.success} />}
                            trendPositive={avgAcc >= 0.85}
                        />
                        <StatCard
                            title={t('reaction')}
                            value={`${(avgRt / 1000).toFixed(2)}s`}
                            icon={<Zap size={18} color={Colors.mentra.warning} />}
                            trendPositive={avgRt < 800}
                        />
                    </View>
                </Card>

                <PrimaryButton
                    title={t('finishBtn') || 'Finish'}
                    onPress={() => router.replace('/(tabs)/training')}
                    style={{ width: '80%', marginTop: Metrics.spacing.xl }}
                />
            </Animated.View>
        );
    };

    // Render engines
    const renderEngine = () => {
        if (phase === 'warmup' || phase === 'core') {
            const engine = phase === 'warmup' ? warmupEngine : coreEngine;
            const currentP = phase === 'warmup' ? 1 : 2;
            const padding = 20;
            const gap = 12;
            const availableWidth = width - (padding * 2) - ((engine.gridSize - 1) * gap);
            const cellSize = availableWidth / engine.gridSize;

            return (
                <View style={[styles.gameArea, { paddingTop: 100 }]}>
                    <View style={{ paddingHorizontal: Metrics.spacing.l, width: '100%', marginBottom: 20 }}>
                        <ProgressTimeline currentPhase={currentP} progressInPhase={engine.level % 2 === 0 ? 1 : 0.5} />
                    </View>

                    {engine.isReverse && (
                        <ThemedText style={{ color: Colors.mentra.brandAccent, fontWeight: 'bold', marginBottom: 20 }}>
                            {t('dailyReversePattern')}
                        </ThemedText>
                    )}

                    <View style={{
                        width: width - (padding * 2),
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: gap,
                        justifyContent: 'center',
                        marginTop: 20
                    }}>
                        {Array.from({ length: engine.gridSize * engine.gridSize }).map((_, index) => {
                            const isActive = engine.activeCell === index;
                            const isUserPressed = engine.userSequence.includes(index);

                            return (
                                <AnimatedPressable
                                    key={index}
                                    onPress={() => engine.handleCellPress(index)}
                                    disabled={engine.gameState !== 'recall'}
                                    style={({ pressed }: { pressed: boolean }) => [
                                        styles.cell,
                                        {
                                            width: cellSize,
                                            height: cellSize,
                                            backgroundColor: isActive
                                                ? Colors.mentra.brandPrimary
                                                : isUserPressed
                                                    ? Colors.mentra.brandAccent
                                                    : (pressed ? Colors.mentra.surface2 : Colors.mentra.surface),
                                            borderColor: isUserPressed ? Colors.mentra.brandAccent : Colors.mentra.border,
                                            transform: [{ scale: pressed ? 0.95 : 1 }]
                                        }
                                    ]}
                                />
                            );
                        })}
                    </View>
                </View>
            );
        }

        if (phase === 'burst') {
            return (
                <View style={[styles.gameArea, { paddingTop: 100 }]}>
                    <View style={{ paddingHorizontal: Metrics.spacing.l, width: '100%', marginBottom: 40 }}>
                        <ProgressTimeline currentPhase={3} progressInPhase={(45 - peakEngine.timeRemaining) / 45} />
                    </View>

                    <Animated.View style={styles.symbolContainer}>
                        <Brain size={100} color={Colors.mentra.brandPrimary} />
                        {/* Placeholder for the actual shape logic */}
                        <ThemedText style={{ marginTop: 20, color: Colors.mentra.textDim }}>{peakEngine.currentSymbol}</ThemedText>
                    </Animated.View>

                    <View style={[styles.controls, { marginTop: 60 }]}>
                        <AnimatedPressable
                            style={({ pressed }: { pressed: boolean }) => [
                                styles.gameBtn,
                                {
                                    borderColor: Colors.mentra.danger,
                                    backgroundColor: pressed ? Colors.mentra.surface2 : Colors.mentra.surface,
                                    transform: [{ scale: pressed ? 0.95 : 1 }]
                                }
                            ]}
                            onPress={() => peakEngine.handleGuess(false)}
                        >
                            <ThemedText style={{ color: Colors.mentra.danger, fontSize: 24, fontWeight: '800' }}>{t('speedMatchNo')}</ThemedText>
                        </AnimatedPressable>

                        <AnimatedPressable
                            style={({ pressed }: { pressed: boolean }) => [
                                styles.gameBtn,
                                {
                                    borderColor: Colors.mentra.success,
                                    backgroundColor: pressed ? Colors.mentra.surface2 : Colors.mentra.surface,
                                    transform: [{ scale: pressed ? 0.95 : 1 }]
                                }
                            ]}
                            onPress={() => peakEngine.handleGuess(true)}
                        >
                            <ThemedText style={{ color: Colors.mentra.success, fontSize: 24, fontWeight: '800' }}>{t('speedMatchYes')}</ThemedText>
                        </AnimatedPressable>
                    </View>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <AnimatedBackground />
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                    <X color={Colors.mentra.text} size={24} />
                </Pressable>
                {(phase !== 'activation' && phase !== 'results') && (
                    <View style={styles.scoreBadge}>
                        <ThemedText style={styles.scoreText}>{totalScore}</ThemedText>
                    </View>
                )}
            </View>

            {phase === 'activation' && renderActivation()}
            {phase === 'results' && renderResults()}
            {(phase !== 'activation' && phase !== 'results') && renderEngine()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.mentra.bg },
    header: {
        position: 'absolute', top: 60, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: Metrics.spacing.l,
        zIndex: 10,
    },
    closeBtn: {
        padding: 8, backgroundColor: Colors.mentra.surface,
        borderRadius: Metrics.radius.round, borderWidth: 1,
        borderColor: Colors.mentra.border,
    },
    scoreBadge: {
        paddingHorizontal: 16, paddingVertical: 8,
        backgroundColor: Colors.mentra.surface, borderRadius: Metrics.radius.m,
        borderWidth: 1, borderColor: Colors.mentra.border,
    },
    scoreText: { color: Colors.mentra.text, fontWeight: '800', fontSize: 16 },
    introContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: Metrics.spacing.xl,
    },
    activationCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: Metrics.radius.xl,
        padding: Metrics.spacing.xxl,
        borderWidth: 1,
        borderColor: 'rgba(42,102,82,0.3)',
        alignItems: 'center',
        width: '100%'
    },
    themeBadge: {
        color: Colors.mentra.brandAccent,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: Metrics.spacing.xs
    },
    title: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, textAlign: 'center', marginBottom: Metrics.spacing.s },
    subtitle: { fontSize: 14, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 22, marginBottom: Metrics.spacing.xl },
    phaseBreakdown: { width: '100%', marginTop: Metrics.spacing.m },
    phaseItem: { color: Colors.mentra.text, fontSize: 14, fontWeight: '500', paddingVertical: Metrics.spacing.s, borderTopWidth: 1, borderTopColor: Colors.mentra.surface },

    // Engine specific
    gameArea: { flex: 1, alignItems: 'center' },
    cell: {
        borderRadius: Metrics.radius.l, borderWidth: 2,
        shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    symbolContainer: {
        width: 240, height: 240, backgroundColor: Colors.mentra.surface,
        borderRadius: Metrics.radius.xl, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: Colors.mentra.border,
        shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    },
    controls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: Metrics.spacing.xl },
    gameBtn: { width: 140, height: 80, borderRadius: Metrics.radius.l, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },

    // Results specific
    headerBox: { alignItems: 'center', marginBottom: Metrics.spacing.xl, width: '100%' },
    insightBox: { padding: 20, alignItems: 'center', marginTop: 10 },
    insight: { fontSize: 16, color: Colors.mentra.text, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
    metricsCard: { width: '100%', backgroundColor: 'rgba(5, 20, 15, 0.4)', borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: Metrics.spacing.xl, padding: Metrics.spacing.l },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.mentra.border, paddingBottom: Metrics.spacing.m, marginBottom: Metrics.spacing.m },
    scoreLabel: { fontSize: 16, color: Colors.mentra.textDim, fontWeight: '600' },
    scoreValue: { fontSize: 32, color: Colors.mentra.text, fontWeight: '800' },
    statsGrid: { flexDirection: 'row', gap: Metrics.spacing.m }
});
