import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Cards';
import { PrimaryButton } from '@/components/ui/Buttons';
import { Metrics } from '@/constants/Theme';
import { useMemoryGridGame } from '@/hooks/useMemoryGridGame';
import { I18n } from '@/services/i18n';
import { Storage } from '@/services/storage';
import { useMentraTheme } from '@/hooks/useMentraTheme';

// Phase 9 Cognitive Depth Components
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { ProgressTimeline } from '@/components/game/ProgressTimeline';
import { SessionResultsOverlay } from '@/components/game/SessionResultsOverlay';

const { width } = Dimensions.get('window');

export default function MemoryGridScreen() {
    const C = useMentraTheme();
    const insets = useSafeAreaInsets();

    const {
        gameState,
        gridSize,
        currentPhase,
        activeCell,
        score,
        level,
        accuracy,
        reactionTimeMs,
        startGame,
        handleCellPress,
        userSequence
    } = useMemoryGridGame(true);

    const [identityLevel, setIdentityLevel] = React.useState('Discipline');

    React.useEffect(() => {
        Storage.getUserProfile().then(p => {
            if (p && p.identityLevel) setIdentityLevel(p.identityLevel);
        });
    }, []);

    // Auto-advance on success after brief celebration
    React.useEffect(() => {
        if (gameState === 'success') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const timer = setTimeout(() => {
                startGame();
            }, 900);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    // Haptic on cell press
    const handleCellPressWithHaptic = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleCellPress(index);
    };

    const padding = 20;
    const gap = 12;
    const availableWidth = width - (padding * 2) - ((gridSize - 1) * gap);
    const cellSize = availableWidth / gridSize;

    const renderGameContent = () => {
        if (gameState === 'success') {
            return (
                <View style={{ alignItems: 'center', gap: 12 }}>
                    <ThemedText style={[styles.successText, { color: C.success }]}>
                        {I18n.t('correct') ?? 'CORRECT!'}
                    </ThemedText>
                    <ThemedText style={{ color: C.textDim, fontSize: 14 }}>
                        {I18n.t('nextLevelLoading') ?? 'Next level loading…'}
                    </ThemedText>
                </View>
            );
        }

        if (gameState === 'idle' || gameState === 'fail') {
            return (
                <Card variant="elevated" style={styles.startCard}>
                    <View style={[styles.iconContainer, { backgroundColor: C.surface2 }]}>
                        <RotateCcw size={32} color={C.brandPrimary} />
                    </View>
                    <ThemedText style={[styles.cardTitle, { color: C.text }]}>
                        {gameState === 'fail'
                            ? (I18n.t('gameOver') ?? 'Game Over')
                            : (I18n.t('readyToFocus') ?? 'Ready to Memorize?')}
                    </ThemedText>

                    {gameState === 'fail' && (
                        <ThemedText style={[styles.scoreText, { color: C.brandSecondary }]}>
                            {I18n.t('score') ?? 'Score'}: {score}
                        </ThemedText>
                    )}

                    <View style={[styles.instructionsBox, { backgroundColor: C.surface2 }]}>
                        <ThemedText style={[styles.howToPlayLabel, { color: C.brandPrimary }]}>
                            {I18n.t('howToPlay') ?? 'How To Play'}
                        </ThemedText>
                        <ThemedText style={[styles.cardDesc, { color: C.textDim }]}>
                            {I18n.t('memoryGridDesc') ?? 'Memorize the pattern and repeat it back.'}
                        </ThemedText>
                    </View>

                    <PrimaryButton
                        title={gameState === 'fail'
                            ? (I18n.t('tryAgain') ?? 'Try Again')
                            : (I18n.t('startGame') ?? 'Start Session')}
                        icon={gameState === 'fail'
                            ? <RotateCcw size={20} color={C.surface} />
                            : <Play size={20} color={C.surface} />}
                        onPress={startGame}
                        fullWidth
                    />
                </Card>
            );
        }

        if (gameState === 'memorize' || gameState === 'recall') {
            return (
                <View style={{
                    width: width - (padding * 2),
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap,
                    justifyContent: 'center',
                }}>
                    {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                        const isActive = activeCell === index;
                        const isUserPressed = userSequence.includes(index);

                        return (
                            <Pressable
                                key={index}
                                onPress={() => handleCellPressWithHaptic(index)}
                                disabled={gameState !== 'recall'}
                                style={({ pressed }) => [
                                    styles.cell,
                                    {
                                        width: cellSize,
                                        height: cellSize,
                                        backgroundColor: isActive
                                            ? C.brandPrimary
                                            : isUserPressed
                                                ? C.brandSecondary
                                                : pressed ? C.surface2 : C.surface,
                                        borderColor: isUserPressed ? C.brandSecondary : C.border,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            );
        }

        if (gameState === 'results') {
            return (
                <SessionResultsOverlay
                    score={score}
                    accuracy={accuracy}
                    reactionTimeMs={reactionTimeMs}
                    identityLevel={identityLevel}
                    onContinue={() => router.back()}
                    onRetry={startGame}
                />
            );
        }

        return null;
    };

    return (
        <View style={[styles.container, { backgroundColor: C.bg }]}>
            <AnimatedBackground />
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={C.statusBar} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: C.surface, borderColor: C.border }]}
                >
                    <ArrowLeft color={C.text} size={24} />
                </Pressable>
                <View style={{ alignItems: 'center' }}>
                    <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>MEMORY GRID</ThemedText>
                    <ThemedText style={[styles.headerTitle, { color: C.text }]}>
                        {I18n.t('level') ?? 'Level'} {level}
                    </ThemedText>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Timeline */}
            {(gameState === 'memorize' || gameState === 'recall' || gameState === 'success' || gameState === 'fail') && (
                <View style={{ paddingHorizontal: Metrics.spacing.l, marginBottom: Metrics.spacing.m }}>
                    <ProgressTimeline currentPhase={currentPhase} progressInPhase={level % 2 === 0 ? 1 : 0.5} />
                </View>
            )}

            {/* Game Area */}
            <View style={styles.gameContainer}>
                {renderGameContent()}
            </View>

            {/* Footer Stats */}
            {gameState !== 'results' && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                    <Card variant="outline" style={[styles.statBox, { backgroundColor: C.surface }]}>
                        <ThemedText style={[styles.statLabel, { color: C.muted }]}>
                            {(I18n.t('score') ?? 'SCORE').toUpperCase()}
                        </ThemedText>
                        <ThemedText style={[styles.statValue, { color: C.text }]}>{score}</ThemedText>
                    </Card>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Metrics.spacing.l,
        paddingBottom: Metrics.spacing.m,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Metrics.radius.round,
        borderWidth: 1,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    gameContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: {
        borderRadius: Metrics.radius.l,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    startCard: {
        width: '85%',
        alignItems: 'center',
        padding: Metrics.spacing.xl,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: Metrics.spacing.s,
        textAlign: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Metrics.spacing.m,
    },
    scoreText: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: Metrics.spacing.m,
    },
    instructionsBox: {
        padding: Metrics.spacing.m,
        borderRadius: Metrics.radius.m,
        marginBottom: Metrics.spacing.xl,
        width: '100%',
    },
    howToPlayLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    cardDesc: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    successText: {
        fontSize: 40,
        fontWeight: '800',
    },
    footer: {
        padding: Metrics.spacing.xl,
        alignItems: 'center',
    },
    statBox: {
        paddingVertical: Metrics.spacing.m,
        paddingHorizontal: Metrics.spacing.xl,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
    },
});
