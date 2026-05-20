import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    Share,
    Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    FadeIn, FadeOut, ZoomIn, ZoomInEasyUp,
    useAnimatedStyle, useSharedValue, withTiming, withSpring,
    withSequence, withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, CheckCircle, Zap, Target, Clock, Share2, Trophy, TrendingUp } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useGridFocusDomain } from '@/features/training/domains/focus/useGridFocusDomain';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Streak } from '@/services/streak';
import { I18n } from '@/services/i18n';

const { width } = Dimensions.get('window');

// ─── Performance tier labels ─────────────────────────────────────────────────
function getTier(fpq: number): { label: string; emoji: string; color: string } {
    if (fpq >= 850) return { label: 'Elite', emoji: '🏆', color: '#F59E0B' };
    if (fpq >= 650) return { label: 'Advanced', emoji: '⚡', color: '#6366F1' };
    if (fpq >= 400) return { label: 'Strong', emoji: '💪', color: '#10B981' };
    if (fpq >= 200) return { label: 'Building', emoji: '📈', color: '#194031' };
    return { label: 'Starting', emoji: '🌱', color: '#9CA3AF' };
}

// ─── Shareable card text (Wordle-style virality) ─────────────────────────────
function buildShareText(fpq: number, accuracy: number, avgReactionMs: number): string {
    const tier = getTier(fpq);
    const bars = Math.round((fpq / 999) * 5);
    const barStr = '█'.repeat(bars) + '░'.repeat(5 - bars);
    return [
        `🧠 Mentra Focus Score`,
        `${tier.emoji} ${fpq} FPQ — ${tier.label}`,
        ``,
        `Accuracy  ${accuracy}%`,
        `Reaction  ${(avgReactionMs / 1000).toFixed(2)}s`,
        ``,
        barStr,
        ``,
        `Train your brain → mentra.app`,
    ].join('\n');
}

// ─── Cell sub-component ────────────────────────────────────────────────────────
interface CellProps {
    value: number;
    target: number;
    lastTapCorrect: boolean | null;
    onPress: (v: number) => void;
    cellSize: number;
}

const GridCell = React.memo(({ value, target, lastTapCorrect, onPress, cellSize }: CellProps) => {
    const C = useMentraTheme();
    const styles = makeStyles(C);
    const isTarget = value === target;
    const pressed = useSharedValue(false);

    const tap = Gesture.Tap()
        .maxDuration(500)
        .onBegin(() => {
            pressed.value = true;
        })
        .onTouchesUp(() => {
            runOnJS(onPress)(value);
        })
        .onFinalize(() => {
            pressed.value = false;
        });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: pressed.value ? C.brandPrimary : C.surface,
            transform: [{ scale: withTiming(pressed.value ? 0.88 : 1, { duration: 100 }) }],
        };
    });

    return (
        <GestureDetector gesture={tap}>
            <Animated.View
                style={[
                    styles.cell,
                    animatedStyles,
                    {
                        width: cellSize,
                        height: cellSize,
                        borderColor: isTarget ? C.brandPrimary : C.border,
                    },
                ]}
            >
                <Text style={[styles.cellText, isTarget && styles.cellTextTarget]}>
                    {value}
                </Text>
            </Animated.View>
        </GestureDetector>
    );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GridFocusScreen() {
    const insets = useSafeAreaInsets();
    const C = useMentraTheme();
    const level = 1;
    const [personalBest, setPersonalBest] = useState<number>(0);
    const [isNewBest, setIsNewBest] = useState(false);
    const scoreScale = useSharedValue(0.5);
    const styles = makeStyles(C);

    const {
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
    } = useGridFocusDomain(level);

    // Load personal best on mount
    useEffect(() => {
        AsyncStorage.getItem('mentra_grid_personal_best').then(val => {
            if (val) setPersonalBest(parseInt(val, 10));
        });
    }, []);

    // auto-start into instructions (pre_game) instead of jumping into countdown
    useEffect(() => {
        initGame();
    }, []);

    // When results appear, check personal best and trigger celebration
    useEffect(() => {
        if (gameState === 'results') {
            const fpq = Math.min(Math.round((accuracy / 100) * (1000 / Math.max(avgReactionMs / 1000, 0.5))), 999);

            // Record streak
            Streak.recordSession();

            if (fpq > personalBest) {
                setIsNewBest(true);
                setPersonalBest(fpq);
                AsyncStorage.setItem('mentra_grid_personal_best', String(fpq));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            // Celebration bounce animation
            scoreScale.value = withSequence(
                withTiming(1.3, { duration: 300 }),
                withSpring(1, { damping: 6, stiffness: 150 })
            );
        }
    }, [gameState]);

    const handleShare = useCallback(async () => {
        try {
            const fpq = Math.min(Math.round((accuracy / 100) * (1000 / Math.max(avgReactionMs / 1000, 0.5))), 999);
            const title = I18n.t('gfShareTitle');
            const message = `${I18n.t('gfShareText')}: ${fpq} 🎯\n\n${buildShareText(fpq, accuracy, avgReactionMs)}\n\nCan you beat my focus score? Play Mentra!`;

            await Share.share({ message, title });
        } catch (error) {
            console.error('Share error', error);
        }
    }, [accuracy, avgReactionMs]);

    const scoreAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scoreScale.value }],
    }));

    const padding = 20;
    const gap = 8;
    const availableWidth = width - padding * 2 - (gridSize - 1) * gap;
    const cellSize = availableWidth / gridSize;

    // ── PRE-GAME INSTRUCTIONS ──────────────────────────────────────────────────
    if (gameState === 'idle' || gameState === 'pre_game') {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 20, paddingHorizontal: 24, justifyContent: 'center', backgroundColor: C.bg }]}>
                <StatusBar style={C.statusBar} />
                <Stack.Screen options={{ headerShown: false }} />

                <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center', marginBottom: 40 }}>
                    <View style={styles.introIconBox}>
                        <Target size={32} color={C.brandPrimary} />
                    </View>
                    <Text style={styles.introTitle}>{I18n.t('gfTitle')}</Text>
                    <Text style={styles.introSub}>{I18n.t('gfIntroSub')}</Text>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.introCard}>
                    <Text style={styles.introHowTo}>{I18n.t('gfHowTo')}</Text>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(400).duration(400)} style={{ marginTop: 40 }}>
                    <Pressable
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); startCountdown(); }}
                        style={styles.introStartBtn}
                    >
                        <Text style={styles.introStartBtnText}>{I18n.t('gfStartBtn')}</Text>
                    </Pressable>
                    <Pressable onPress={() => router.back()} style={{ marginTop: 20, alignItems: 'center' }}>
                        <Text style={styles.backBtnText}>{I18n.t('gfBackHome')}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        );
    }

    // ── COUNTDOWN ──────────────────────────────────────────────────────────────
    if (gameState === 'countdown') {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: C.bg }]}>
                <StatusBar style={C.statusBar} />
                <Stack.Screen options={{ headerShown: false }} />
                <Animated.View entering={ZoomIn} key={`cd-${countdown}`}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                </Animated.View>
                <Text style={styles.countdownLabel}>Find 1 → {gridSize * gridSize}</Text>
            </View>
        );
    }

    // ── RESULTS ────────────────────────────────────────────────────────────────
    if (gameState === 'results') {
        const fpq = Math.min(Math.round((accuracy / 100) * (1000 / Math.max(avgReactionMs / 1000, 0.5))), 999);
        const tier = getTier(fpq);
        const prevBest = isNewBest ? fpq : personalBest;

        return (
            <View style={[styles.container, { paddingTop: insets.top + 12, backgroundColor: C.bg }]}>
                <StatusBar style={C.statusBar} />
                <Stack.Screen options={{ headerShown: false }} />
                <Animated.View entering={FadeIn} style={styles.resultsContainer}>

                    {/* ── Tier Badge ── */}
                    <Animated.View entering={ZoomInEasyUp.delay(100)} style={[styles.tierBadge, { backgroundColor: tier.color + '20', borderColor: tier.color + '40' }]}>
                        <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                        <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label.toUpperCase()}</Text>
                    </Animated.View>

                    {/* ── FPQ Score with celebration animation ── */}
                    <Animated.View style={[styles.scoreBlock, scoreAnimStyle]}>
                        <Text style={styles.resultsTitle}>{I18n.t('gfFocusScore')}</Text>
                        <Text style={[styles.fpqScore, { color: tier.color }]}>{fpq}</Text>
                        <Text style={styles.fpqLabel}>{I18n.t('gfFpqLabel')}</Text>
                    </Animated.View>

                    {/* ── Personal Best Banner ── */}
                    {isNewBest && (
                        <Animated.View entering={ZoomInEasyUp.delay(300)} style={styles.newBestBanner}>
                            <Trophy size={16} color="#F59E0B" />
                            <Text style={styles.newBestText}>{I18n.t('gfNewBest')}</Text>
                        </Animated.View>
                    )}
                    {!isNewBest && prevBest > 0 && (
                        <Animated.View entering={FadeIn.delay(400)} style={styles.prevBestRow}>
                            <TrendingUp size={14} color={C.textDim} />
                            <Text style={styles.prevBestText}>{I18n.t('gfPrevBest')} {prevBest}</Text>
                        </Animated.View>
                    )}

                    {/* ── Stats ── */}
                    <View style={styles.statsRow}>
                        <ResultStat icon={<CheckCircle size={18} color={C.brandPrimary} />} label={I18n.t('gfAccuracy')} value={`${accuracy}%`} />
                        <ResultStat icon={<Zap size={18} color={C.warning} />} label={I18n.t('gfReaction')} value={`${(avgReactionMs / 1000).toFixed(2)}s`} />
                        <ResultStat icon={<Target size={18} color={C.brandPrimary} />} label={I18n.t('gfRawScore')} value={`${score}`} />
                    </View>

                    {/* ── CTAs ── */}
                    <Pressable
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsNewBest(false); initGame(); }}
                        style={styles.retryBtn}
                    >
                        <Text style={styles.retryBtnText}>{I18n.t('gfPlayAgain')}</Text>
                    </Pressable>

                    <Pressable onPress={handleShare} style={styles.shareBtn}>
                        <Share2 size={16} color={C.brandPrimary} />
                        <Text style={styles.shareBtnText}>{I18n.t('gfShareScore')}</Text>
                    </Pressable>

                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>{I18n.t('gfBackHome')}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        );
    }

    // ── PLAYING ────────────────────────────────────────────────────────────────
    const timePercent = timeRemaining / (level <= 2 ? 60 : 90);
    const timerColor = timePercent > 0.4
        ? C.brandPrimary
        : timePercent > 0.2
            ? C.warning
            : C.danger;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { paddingTop: insets.top, backgroundColor: C.bg }]}>
                <StatusBar style={C.statusBar} />
                <Stack.Screen options={{ headerShown: false }} />

                {/* ── Header ── */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                        <X size={24} color={C.textDim} />
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerLabel}>{I18n.t('gfTarget')}</Text>
                        <Animated.Text key={target} entering={ZoomIn.springify().damping(12).stiffness(150)} style={styles.targetNumber}>
                            {target}
                        </Animated.Text>
                    </View>
                    <View style={[styles.timerBox, timeRemaining <= 10 && styles.timerBoxUrgent]}>
                        <Clock size={16} color={timeRemaining <= 10 ? '#FFF' : timerColor} />
                        <Text style={[styles.timerText, { color: timeRemaining <= 10 ? '#FFF' : timerColor }]}>
                            {timeRemaining}s
                        </Text>
                    </View>
                </View>

                {/* ── Progress Bar ── */}
                <View style={styles.progressBg}>
                    <Animated.View style={[styles.progressFill, { width: `${timePercent * 100}%`, backgroundColor: timerColor }]} />
                </View>

                {/* ── Grid ── */}
                <View style={[styles.gridContainer, { padding }]}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, width: width - padding * 2 }}>
                        {grid.map((value, index) => (
                            <GridCell
                                key={`${index}-${value}`}
                                value={value}
                                target={target}
                                lastTapCorrect={lastTapCorrect}
                                onPress={handleCellTap}
                                cellSize={cellSize}
                            />
                        ))}
                    </View>
                </View>

                {/* ── Tap feedback flash ── */}
                {lastTapCorrect === false && (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.wrongFlash} pointerEvents="none" />
                )}
            </View>
        </GestureHandlerRootView>
    );
}

function ResultStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    const C = useMentraTheme();
    const styles = makeStyles(C);
    return (
        <View style={styles.statCard}>
            {icon}
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: C.bg },
        centered: { justifyContent: 'center', alignItems: 'center' },

        // Countdown
        countdownText: { fontSize: 96, fontWeight: '800', color: C.brandPrimary, textAlign: 'center' },
        countdownLabel: { fontSize: 16, color: C.textDim, marginTop: 12, textAlign: 'center' },

        // Header
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 24, paddingVertical: 16, marginTop: 8,
        },
        closeBtn: {
            padding: 10, borderRadius: 24, backgroundColor: C.surface,
            borderWidth: 1.5, borderColor: C.border,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        },
        headerCenter: { alignItems: 'center', flex: 1 },
        headerLabel: { fontSize: 13, color: C.textDim, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
        targetNumber: { fontSize: 48, fontWeight: '900', color: C.text, letterSpacing: -1 },
        timerBox: {
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: C.surface, borderRadius: 24,
            paddingHorizontal: 16, paddingVertical: 10,
            borderWidth: 1.5, borderColor: C.border,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        },
        timerBoxUrgent: { backgroundColor: C.danger, borderColor: C.danger },
        timerText: { fontSize: 16, fontWeight: '800' },

        // Progress
        progressBg: { height: 6, backgroundColor: C.surface2, marginHorizontal: 24, borderRadius: 6, overflow: 'hidden' },
        progressFill: { height: 6, borderRadius: 6 },

        // Grid
        gridContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
        cell: {
            borderRadius: 16, borderWidth: 1.5, borderColor: C.border,
            backgroundColor: C.surface,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
        },
        cellTarget: {
            borderColor: C.brandPrimary,
            backgroundColor: C.brandPrimary + '15',
            shadowColor: C.brandPrimary,
            shadowOpacity: 0.3,
        },
        cellText: { fontSize: 28, fontWeight: '800', color: C.text },
        cellTextTarget: { color: C.brandPrimary },

        // Wrong flash
        wrongFlash: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(239,68,68,0.12)',
        },

        // Results
        resultsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 0 },
        resultsTitle: { fontSize: 11, fontWeight: '800', color: C.textDim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },

        // Tier badge
        tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
        tierEmoji: { fontSize: 18 },
        tierLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },

        // Score
        scoreBlock: { alignItems: 'center', marginBottom: 8 },
        fpqScore: { fontSize: 88, fontWeight: '800', letterSpacing: -3 },
        fpqLabel: { fontSize: 13, color: C.textDim, marginBottom: 16 },

        // Personal best
        newBestBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
        newBestText: { fontSize: 13, fontWeight: '800', color: '#92400E' },
        prevBestRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
        prevBestText: { fontSize: 13, color: C.textDim },

        // Stats
        statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24, width: '100%' },
        statCard: {
            flex: 1, backgroundColor: C.surface, borderRadius: 16,
            paddingVertical: 14, paddingHorizontal: 4, alignItems: 'center', gap: 5,
            borderWidth: 1.5, borderColor: C.border,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        },
        statValue: { fontSize: 18, fontWeight: '800', color: C.text },
        statLabel: { fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5 },

        // CTAs
        retryBtn: { width: '100%', backgroundColor: C.brandPrimary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
        retryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
        shareBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, marginBottom: 4, borderWidth: 1.5, borderColor: C.brandPrimary, backgroundColor: C.brandPrimary + '10' },
        shareBtnText: { color: C.brandPrimary, fontSize: 15, fontWeight: '700' },
        backBtn: { width: '100%', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
        backBtnText: { color: C.textDim, fontSize: 14, fontWeight: '600' },

        // Intro Screen
        introIconBox: { width: 72, height: 72, borderRadius: 24, backgroundColor: C.brandPrimary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
        introTitle: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 8, textAlign: 'center' },
        introSub: { fontSize: 15, color: C.textDim, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
        introCard: { backgroundColor: C.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border },
        introHowTo: { fontSize: 15, color: C.text, lineHeight: 24, textAlign: 'center' },
        introStartBtn: { width: '100%', backgroundColor: C.brandPrimary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: C.brandPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
        introStartBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 1 },
    });
}
