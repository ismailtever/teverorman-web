import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card, StatCard } from '@/components/ui/Cards';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { Activity, Zap, CheckCircle, Brain, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { I18n } from '@/services/i18n';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import Animated, {
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface SessionResultsOverlayProps {
    accuracy: number;
    reactionTimeMs: number;
    score: number;
    identityLevel: string;
    onContinue: () => void;
    onRetry: () => void;
}

export function SessionResultsOverlay({
    accuracy,
    reactionTimeMs,
    score,
    identityLevel,
    onContinue,
    onRetry
}: SessionResultsOverlayProps) {
    const C = useMentraTheme();
    const formattedReaction = (reactionTimeMs / 1000).toFixed(2) + 's';

    // Animate accuracy bar from 0 → accuracy% on mount
    const barProgress = useSharedValue(0);
    const barStyle = useAnimatedStyle(() => ({
        width: `${barProgress.value}%` as any,
    }));

    useEffect(() => {
        barProgress.value = withTiming(Math.min(accuracy, 100), {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });
    }, [accuracy]);

    const getInsight = () => {
        const lvl = identityLevel.toLowerCase();
        // @ts-ignore
        if (lvl.includes('focus') || lvl.includes('odak')) return I18n.t('gameInsightFocus') || 'Great focus recovery during the peak phase.';
        // @ts-ignore
        if (lvl.includes('discipline') || lvl.includes('disiplin')) return I18n.t('gameInsightDiscipline') || 'You maintained execution discipline under time pressure.';
        // @ts-ignore
        return I18n.t('gameInsightConsistency') || 'Consistent accuracy across all structure variations.';
    };

    return (
        <Animated.View entering={FadeInUp.springify().mass(0.8)} style={[styles.container, { backgroundColor: C.surface }]}>
            <View style={styles.header}>
                <Brain size={48} color={C.brandPrimary} style={{ marginBottom: Metrics.spacing.m }} />
                {/* @ts-ignore */}
                <ThemedText style={[styles.title, { color: C.text }]}>{I18n.t('sessionComplete') || 'Session Complete'}</ThemedText>
                <ThemedText style={[styles.insight, { color: C.brandPrimary }]}>{getInsight()}</ThemedText>
            </View>

            <Card variant="outline" style={styles.metricsCard}>
                <View style={styles.scoreRow}>
                    {/* @ts-ignore */}
                    <ThemedText style={[styles.scoreLabel, { color: C.textDim }]}>{I18n.t('finalScore') || 'Final Score'}</ThemedText>
                    <ThemedText style={[styles.scoreValue, { color: C.brandAccent }]}>{score}</ThemedText>
                </View>

                <View style={[styles.divider, { backgroundColor: C.divider }]} />

                <View style={styles.statsGrid}>
                    <StatCard
                        // @ts-ignore
                        title={I18n.t('accuracy') || 'Accuracy'}
                        value={`${Math.round(accuracy)}%`}
                        icon={<CheckCircle size={18} color={C.success} />}
                        style={[styles.statBox, { backgroundColor: C.surface2 }]}
                        trendPositive={accuracy > 80}
                    />
                    <StatCard
                        // @ts-ignore
                        title={I18n.t('reactionTime') || 'Reaction'}
                        value={formattedReaction}
                        icon={<Zap size={18} color={C.warning} />}
                        style={[styles.statBox, { backgroundColor: C.surface2 }]}
                    />
                </View>

                <View style={[styles.divider, { backgroundColor: C.divider }]} />

                <View style={styles.focusRow}>
                    <Activity size={20} color={C.brandAccent} />
                    <View style={{ marginLeft: Metrics.spacing.s, flex: 1 }}>
                        {/* @ts-ignore */}
                        <ThemedText style={[styles.focusLabel, { color: C.text }]}>{I18n.t('focusStability') || 'Focus Stability'}</ThemedText>
                        <View style={[styles.focusBarBg, { backgroundColor: C.border }]}>
                            <Animated.View style={[styles.focusBarFill, { backgroundColor: C.brandAccent }, barStyle]} />
                        </View>
                    </View>
                </View>
            </Card>

            <View style={styles.actions}>
                <PrimaryButton
                    title={I18n.t('continue') || 'Continue'}
                    icon={<ArrowRight size={20} color={C.surface} />}
                    onPress={onContinue}
                    fullWidth
                    style={{ marginBottom: Metrics.spacing.m }}
                />
                <SecondaryButton
                    title={I18n.t('tryAgain') || 'Train Again'}
                    onPress={onRetry}
                    fullWidth
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 400,
        borderRadius: Metrics.radius.xl,
        padding: Metrics.spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: Metrics.spacing.l,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    insight: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 22,
    },
    metricsCard: {
        padding: Metrics.spacing.l,
        marginBottom: Metrics.spacing.xl,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: '900',
    },
    divider: {
        height: 1,
        marginVertical: Metrics.spacing.m,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Metrics.spacing.m,
    },
    statBox: {
        flex: 1,
        padding: Metrics.spacing.m,
    },
    focusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    focusLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 6,
    },
    focusBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    focusBarFill: {
        height: '100%',
    },
    actions: {
        marginTop: Metrics.spacing.s,
    }
});
