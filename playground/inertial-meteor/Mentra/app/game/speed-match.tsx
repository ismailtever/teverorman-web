import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Square, Circle, Triangle, Diamond, Star, X, BrainCircuit, Play, Sparkles } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/Buttons';
import { Card } from '@/components/ui/Cards';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { useSpeedMatchGame } from '@/hooks/useSpeedMatchGame';
import { I18n, useI18n } from '@/services/i18n';
import { Storage } from '@/services/storage';

// New Phase 9 Cognitive Depth Components
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { ProgressTimeline } from '@/components/game/ProgressTimeline';
import { SessionResultsOverlay } from '@/components/game/SessionResultsOverlay';
import { NeuroActivationWarmup } from '@/components/game/NeuroActivationWarmup';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

export default function SpeedMatchScreen() {
    const { t } = useI18n();
    const { isPlaying, gameState, score, timeRemaining, currentPhase, currentSymbol, accuracy, reactionTimeMs, startGame, handleGuess } = useSpeedMatchGame(true);
    const [identityLevel, setIdentityLevel] = React.useState('Focus');
    const [showWarmup, setShowWarmup] = React.useState(false);

    React.useEffect(() => {
        Storage.getUserProfile().then(p => {
            if (p && p.identityLevel) setIdentityLevel(p.identityLevel);
        });
    }, []);

    // Animation values
    const cardScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.1);
    const glowColor = useSharedValue(Colors.mentra.brandPrimary);

    const getIcon = (name: string) => {
        const size = 100;
        const color = Colors.mentra.brandPrimary;
        switch (name) {
            case 'square': return <Square size={size} color={color} />;
            case 'circle': return <Circle size={size} color={color} />;
            case 'triangle': return <Triangle size={size} color={color} />;
            case 'diamond': return <Diamond size={size} color={color} />;
            case 'star': return <Star size={size} color={color} />;
            default: return null;
        }
    };

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
        shadowColor: glowColor.value,
        shadowOpacity: glowOpacity.value,
    }));

    const handlePress = (guess: boolean) => {
        // Trigger subtle hit animation
        cardScale.value = withSequence(
            withTiming(0.95, { duration: 50 }),
            withSpring(1, { damping: 10, stiffness: 200 })
        );
        handleGuess(guess);
    };

    return (
        <View style={styles.container}>
            <AnimatedBackground />
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.closeBtn}>
                    <X color={Colors.mentra.text} size={24} />
                </Pressable>
                <ThemedText style={styles.headerTitle}>{t('gameSpeedMatch')}</ThemedText>
                <View style={styles.scoreBadge}>
                    <ThemedText style={styles.scoreText}>{score}</ThemedText>
                </View>
            </View>

            {/* Top Structural Layer */}
            {gameState === 'playing' && (
                <View style={{ paddingHorizontal: Metrics.spacing.l, marginBottom: Metrics.spacing.l }}>
                    <ProgressTimeline currentPhase={currentPhase} progressInPhase={(20 - (timeRemaining % 20)) / 20} />
                </View>
            )}

            <View style={styles.content}>
                {gameState === 'idle' && (
                    <View style={styles.lobby}>
                        <Card variant="elevated" style={styles.startCard}>
                            <View style={styles.iconContainer}>
                                <Triangle size={32} color={Colors.mentra.brandPrimary} />
                            </View>
                            <ThemedText style={styles.lobbyTitle}>{t('readyToFocus') || 'Ready to Focus?'}</ThemedText>

                            <View style={styles.instructionsBox}>
                                <View style={styles.sectionHeader}>
                                    <Play size={14} color={Colors.mentra.brandPrimary} />
                                    <ThemedText style={styles.sectionLabel}>{t('howToPlay') || 'How to Play'}</ThemedText>
                                </View>
                                <ThemedText style={styles.lobbyDesc}>
                                    {t('speedMatchDesc') || 'Does the current symbol match the previous one? Speed and accuracy are tracked.'}
                                </ThemedText>
                            </View>

                            <View style={styles.scienceBox}>
                                <View style={styles.sectionHeader}>
                                    <BrainCircuit size={14} color={Colors.mentra.brandAccent} />
                                    <ThemedText style={[styles.sectionLabel, { color: Colors.mentra.brandAccent }]}>
                                        {t('scienceBehind')}
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.scienceWhat}>
                                    {t('smIntroWhat')}
                                </ThemedText>
                                <ThemedText style={styles.scienceWhy}>
                                    {t('smIntroWhy')}
                                </ThemedText>
                            </View>

                            <PrimaryButton 
                                title={t('startGame') || 'Start Session'} 
                                onPress={() => setShowWarmup(true)} 
                                fullWidth 
                            />
                        </Card>
                    </View>
                )}

                {gameState === 'playing' && (
                    <View style={styles.gameArea}>
                        {/* @ts-ignore */}
                        <Animated.View style={[styles.symbolContainer, animatedCardStyle]}>
                            {getIcon(currentSymbol)}
                        </Animated.View>
                    </View>
                )}

                {gameState === 'results' && (
                    <SessionResultsOverlay
                        score={score}
                        accuracy={accuracy}
                        reactionTimeMs={reactionTimeMs}
                        identityLevel={identityLevel}
                        onContinue={() => router.canGoBack() ? router.back() : router.replace('/')}
                        onRetry={startGame}
                    />
                )}
            </View>

            <NeuroActivationWarmup 
                visible={showWarmup} 
                gameTitle="SPEED MATCH"
                tutorialText={t('gameSpeedMatchTutorial' as any)}
                onComplete={() => {
                    setShowWarmup(false);
                    startGame();
                }} 
            />

            {gameState === 'playing' && (
                <View style={styles.controls}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.gameBtn,
                            { borderColor: Colors.mentra.danger, backgroundColor: pressed ? Colors.mentra.surface2 : Colors.mentra.surface }
                        ]}
                        onPress={() => handlePress(false)}
                    >
                        <ThemedText style={{ color: Colors.mentra.danger, fontSize: 24, fontWeight: '800' }}>{t('speedMatchNo')}</ThemedText>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.gameBtn,
                            { borderColor: Colors.mentra.success, backgroundColor: pressed ? Colors.mentra.surface2 : Colors.mentra.surface }
                        ]}
                        onPress={() => handlePress(true)}
                    >
                        <ThemedText style={{ color: Colors.mentra.success, fontSize: 24, fontWeight: '800' }}>{t('speedMatchYes')}</ThemedText>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.mentra.bg,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Metrics.spacing.l,
        marginBottom: Metrics.spacing.l,
    },
    closeBtn: {
        padding: 8,
        backgroundColor: Colors.mentra.surface,
        borderRadius: Metrics.radius.round,
        borderWidth: 1,
        borderColor: Colors.mentra.border,
    },
    headerTitle: {
        color: Colors.mentra.text,
        fontWeight: '800',
        fontSize: 18,
    },
    scoreBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.mentra.surface,
        borderRadius: Metrics.radius.m,
        borderWidth: 1,
        borderColor: Colors.mentra.border,
    },
    scoreText: {
        color: Colors.mentra.text,
        fontWeight: '800',
        fontSize: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lobby: {
        width: '100%',
        alignItems: 'center',
    },
    startCard: {
        width: '85%',
        alignItems: 'center',
        padding: Metrics.spacing.xl,
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
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.mentra.brandAccent + '15',
        marginBottom: Metrics.spacing.xl,
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
    lobbyTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.mentra.text,
        textAlign: 'center',
        marginBottom: Metrics.spacing.s,
    },
    lobbyScore: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.mentra.brandAccent,
        marginBottom: Metrics.spacing.m,
    },
    lobbyDesc: {
        fontSize: 14,
        color: Colors.mentra.textDim,
        textAlign: 'center',
        lineHeight: 22,
    },
    gameArea: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbolContainer: {
        width: 240,
        height: 240,
        backgroundColor: Colors.mentra.surface,
        borderRadius: Metrics.radius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.mentra.border,
        shadowColor: Colors.mentra.brandPrimary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 60,
        paddingHorizontal: Metrics.spacing.l,
    },
    gameBtn: {
        width: 150,
        height: 80,
        borderRadius: Metrics.radius.l,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    }
});
