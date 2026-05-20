import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Square, Circle, Triangle, Diamond, Star, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/Buttons';
import { Card } from '@/components/ui/Cards';
import { Metrics } from '@/constants/Theme';
import { useSpeedMatchGame } from '@/hooks/useSpeedMatchGame';
import { I18n } from '@/services/i18n';
import { Storage } from '@/services/storage';
import { useMentraTheme } from '@/hooks/useMentraTheme';

// Phase 9 Cognitive Depth Components
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { ProgressTimeline } from '@/components/game/ProgressTimeline';
import { SessionResultsOverlay } from '@/components/game/SessionResultsOverlay';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

export default function SpeedMatchScreen() {
    const C = useMentraTheme();
    const insets = useSafeAreaInsets();

    const {
        gameState, score, timeRemaining, currentPhase,
        currentSymbol, accuracy, reactionTimeMs, startGame, handleGuess,
    } = useSpeedMatchGame(true);

    const [identityLevel, setIdentityLevel] = React.useState('Focus');

    React.useEffect(() => {
        Storage.getUserProfile().then(p => {
            if (p && p.identityLevel) setIdentityLevel(p.identityLevel);
        });
    }, []);

    const cardScale = useSharedValue(1);

    const getIcon = (name: string) => {
        const size = 100;
        const color = C.brandPrimary;
        switch (name) {
            case 'square':   return <Square   size={size} color={color} fill={color} />;
            case 'circle':   return <Circle   size={size} color={color} fill={color} />;
            case 'triangle': return <Triangle size={size} color={color} fill={color} />;
            case 'diamond':  return <Diamond  size={size} color={color} fill={color} />;
            case 'star':     return <Star     size={size} color={color} fill={color} />;
            default:         return null;
        }
    };

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    const handlePress = (guess: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        cardScale.value = withSequence(
            withTiming(0.93, { duration: 50 }),
            withSpring(1, { damping: 10, stiffness: 200 }),
        );
        handleGuess(guess);
    };

    return (
        <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
            <AnimatedBackground />
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={C.statusBar} />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.closeBtn, { backgroundColor: C.surface, borderColor: C.border }]}
                >
                    <X color={C.text} size={24} />
                </Pressable>
                <ThemedText style={[styles.headerTitle, { color: C.text }]}>SPEED MATCH</ThemedText>
                <View style={[styles.scoreBadge, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <ThemedText style={[styles.scoreText, { color: C.text }]}>{score}</ThemedText>
                </View>
            </View>

            {/* Progress Timeline */}
            {gameState === 'playing' && (
                <View style={{ paddingHorizontal: Metrics.spacing.l, marginBottom: Metrics.spacing.l }}>
                    <ProgressTimeline
                        currentPhase={currentPhase}
                        progressInPhase={(20 - (timeRemaining % 20)) / 20}
                    />
                </View>
            )}

            <View style={styles.content}>
                {gameState === 'idle' && (
                    <View style={styles.lobby}>
                        <Card variant="elevated" style={styles.startCard}>
                            <View style={[styles.iconContainer, { backgroundColor: C.surface2 }]}>
                                <Triangle size={32} color={C.brandPrimary} />
                            </View>
                            <ThemedText style={[styles.lobbyTitle, { color: C.text }]}>
                                {I18n.t('readyToFocus') ?? 'Ready to Focus?'}
                            </ThemedText>

                            <View style={[styles.instructionsBox, { backgroundColor: C.surface2 }]}>
                                <ThemedText style={[styles.howToPlayLabel, { color: C.brandPrimary }]}>
                                    {I18n.t('howToPlay') ?? 'How to Play'}
                                </ThemedText>
                                <ThemedText style={[styles.lobbyDesc, { color: C.textDim }]}>
                                    {I18n.t('speedMatchDesc') ?? 'Does the current symbol match the previous one? Speed and accuracy are tracked.'}
                                </ThemedText>
                            </View>

                            <PrimaryButton
                                title={I18n.t('startGame') ?? 'Start Session'}
                                onPress={startGame}
                                fullWidth
                            />
                        </Card>
                    </View>
                )}

                {gameState === 'playing' && (
                    <View style={styles.gameArea}>
                        <Animated.View style={[
                            styles.symbolContainer,
                            { backgroundColor: C.surface, borderColor: C.border },
                            animatedCardStyle,
                        ]}>
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
                        onContinue={() => router.back()}
                        onRetry={startGame}
                    />
                )}
            </View>

            {gameState === 'playing' && (
                <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.gameBtn,
                            {
                                borderColor: C.danger,
                                backgroundColor: pressed ? C.surface2 : C.surface,
                            },
                        ]}
                        onPress={() => handlePress(false)}
                    >
                        <ThemedText style={{ color: C.danger, fontSize: 24, fontWeight: '800' }}>NO</ThemedText>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.gameBtn,
                            {
                                borderColor: C.success,
                                backgroundColor: pressed ? C.surface2 : C.surface,
                            },
                        ]}
                        onPress={() => handlePress(true)}
                    >
                        <ThemedText style={{ color: C.success, fontSize: 24, fontWeight: '800' }}>YES</ThemedText>
                    </Pressable>
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
        paddingVertical: Metrics.spacing.m,
    },
    closeBtn: {
        padding: 8,
        borderRadius: Metrics.radius.round,
        borderWidth: 1,
    },
    headerTitle: {
        fontWeight: '800',
        fontSize: 18,
    },
    scoreBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Metrics.radius.m,
        borderWidth: 1,
    },
    scoreText: {
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
        justifyContent: 'center',
        alignItems: 'center',
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
    lobbyTitle: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: Metrics.spacing.s,
    },
    lobbyDesc: {
        fontSize: 14,
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
        borderRadius: Metrics.radius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
    },
});
