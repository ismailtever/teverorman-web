import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Play, RotateCcw, BrainCircuit, Sparkles } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Cards';
import { PrimaryButton } from '@/components/ui/Buttons';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { useMemoryGridGame } from '@/hooks/useMemoryGridGame';
import { I18n } from '@/services/i18n';
import { Storage } from '@/services/storage';

// New Phase 9 Cognitive Depth Components
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { ProgressTimeline } from '@/components/game/ProgressTimeline';
import { SessionResultsOverlay } from '@/components/game/SessionResultsOverlay';
import { NeuroActivationWarmup } from '@/components/game/NeuroActivationWarmup';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function MemoryGridScreen() {
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
    const [showWarmup, setShowWarmup] = React.useState(false);

    React.useEffect(() => {
        Storage.getUserProfile().then(p => {
            if (p && p.identityLevel) setIdentityLevel(p.identityLevel);
        });
    }, []);

    const padding = 20;
    const gap = 12;
    const availableWidth = width - (padding * 2) - ((gridSize - 1) * gap);
    const cellSize = availableWidth / gridSize;

    // Render logic for different game states
    const renderGameContent = () => {
        if (gameState === 'idle' || gameState === 'fail' || gameState === 'success') {
            if (gameState === 'success') {
                return (
                    <View style={{ alignItems: 'center' }}>
                        <ThemedText style={styles.successText}>{I18n.t('correct') || 'CORRECT'}</ThemedText>
                    </View>
                );
            }
            return (
                <Card variant="elevated" style={styles.startCard}>
                    <View style={styles.iconContainer}>
                        <RotateCcw size={32} color={Colors.mentra.brandPrimary} />
                    </View>
                    <ThemedText style={styles.cardTitle}>
                        {gameState === 'fail' ? (I18n.t('gameOver') || 'Session Over') : (I18n.t('readyToFocus') || 'Ready to Memorize?')}
                    </ThemedText>

                    {gameState === 'fail' && (
                        <ThemedText style={styles.scoreText}>
                            {I18n.t('score') || 'Score'}: {score}
                        </ThemedText>
                    )}

                    <View style={styles.instructionsBox}>
                        <View style={styles.sectionHeader}>
                            <Play size={14} color={Colors.mentra.brandPrimary} />
                            <ThemedText style={styles.sectionLabel}>{I18n.t('howToPlay') || 'How To Play'}</ThemedText>
                        </View>
                        <ThemedText style={styles.cardDesc}>
                            {I18n.t('memoryGridDesc') || 'Memorize the pattern and repeat it back.'}
                        </ThemedText>
                    </View>

                    <View style={styles.scienceBox}>
                        <View style={styles.sectionHeader}>
                            <BrainCircuit size={14} color={Colors.mentra.brandAccent} />
                            <ThemedText style={[styles.sectionLabel, { color: Colors.mentra.brandAccent }]}>
                                {I18n.t('scienceBehind')}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.scienceWhat}>
                            {I18n.t('mgIntroWhat')}
                        </ThemedText>
                        <ThemedText style={styles.scienceWhy}>
                            {I18n.t('mgIntroWhy')}
                        </ThemedText>
                    </View>

                    <PrimaryButton
                        title={gameState === 'fail' ? (I18n.t('tryAgain') || 'Try Again') : (I18n.t('startGame') || 'Start Session')}
                        icon={gameState === 'fail' ? <RotateCcw size={20} color={Colors.mentra.surface} /> : <Play size={20} color={Colors.mentra.surface} />}
                        onPress={() => setShowWarmup(true)}
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
                    gap: gap,
                    justifyContent: 'center'
                }}>
                    {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                        const isActive = activeCell === index;
                        const isUserPressed = userSequence.includes(index);

                        return (
                            <Pressable
                                key={index}
                                onPress={() => handleCellPress(index)}
                                disabled={gameState !== 'recall'}
                                style={({ pressed }) => [
                                    styles.cell,
                                    {
                                        width: cellSize,
                                        height: cellSize,
                                        backgroundColor: isActive
                                            ? Colors.mentra.brandPrimary
                                            : isUserPressed
                                                ? Colors.mentra.brandAccent
                                                : (pressed ? Colors.mentra.surface2 : Colors.mentra.surface),
                                        borderColor: isUserPressed ? Colors.mentra.brandAccent : Colors.mentra.border
                                    }
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
        <View style={styles.container}>
            <AnimatedBackground />
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={Colors.mentra.text} size={24} />
                </Pressable>
                <View style={{ alignItems: 'center' }}>
                    <ThemedText style={styles.headerSubtitle}>MEMORY GRID</ThemedText>
                    <ThemedText style={styles.headerTitle}>{I18n.t('level') || 'Level'} {level}</ThemedText>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Top Structural Layer */}
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
                <View style={styles.footer}>
                    <Card variant="outline" style={styles.statBox}>
                        {/* @ts-ignore */}
                        <ThemedText style={styles.statLabel}>{(I18n.t('score') || 'SCORE').toUpperCase()}</ThemedText>
                        <ThemedText style={styles.statValue}>{score}</ThemedText>
                    </Card>
                </View>
            )}

            <NeuroActivationWarmup 
                visible={showWarmup} 
                gameTitle="MEMORY GRID"
                tutorialText={I18n.t('gameMemoryGridTutorial' as any)}
                onComplete={() => {
                    setShowWarmup(false);
                    startGame();
                }} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.mentra.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Metrics.spacing.l,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.mentra.surface,
        borderRadius: Metrics.radius.round,
        borderWidth: 1,
        borderColor: Colors.mentra.border,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        color: Colors.mentra.muted,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.mentra.text,
    },
    gameContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: {
        borderRadius: Metrics.radius.l,
        borderWidth: 2,
        shadowColor: Colors.mentra.brandPrimary,
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
        color: Colors.mentra.text,
        marginBottom: Metrics.spacing.s,
        textAlign: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.mentra.surface2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Metrics.spacing.m,
    },
    scoreText: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.mentra.brandAccent,
        marginBottom: Metrics.spacing.m,
    },
    instructionsBox: {
        backgroundColor: Colors.mentra.surface2,
        padding: Metrics.spacing.m,
        borderRadius: Metrics.radius.m,
        marginBottom: Metrics.spacing.xl,
        width: '100%',
    },
    howToPlayLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.mentra.brandPrimary,
        letterSpacing: 1,
        marginBottom: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    cardDesc: {
        fontSize: 14,
        color: Colors.mentra.textDim,
        lineHeight: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.mentra.brandPrimary,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    scienceBox: {
        backgroundColor: Colors.mentra.brandAccent + '08',
        padding: Metrics.spacing.m,
        borderRadius: Metrics.radius.m,
        marginBottom: Metrics.spacing.xl,
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.mentra.brandAccent + '15',
    },
    scienceWhat: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.mentra.text,
        marginBottom: 4,
    },
    scienceWhy: {
        fontSize: 13,
        color: Colors.mentra.textDim,
        lineHeight: 18,
    },
    successText: {
        fontSize: 40,
        fontWeight: '800',
        color: Colors.mentra.success,
    },
    footer: {
        padding: Metrics.spacing.xl,
        paddingBottom: 50,
        alignItems: 'center',
    },
    statBox: {
        paddingVertical: Metrics.spacing.m,
        paddingHorizontal: Metrics.spacing.xl,
        alignItems: 'center',
        backgroundColor: Colors.mentra.surface,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        color: Colors.mentra.muted,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.mentra.text,
    }
});
