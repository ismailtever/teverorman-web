import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card, StatCard } from '@/components/ui/Cards';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { Activity, Zap, CheckCircle, Brain, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { I18n } from '@/services/i18n';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
    const formattedReaction = (reactionTimeMs / 1000).toFixed(2) + 's';

    // Fake AI insight dynamically related to their chosen identity level (Usually stored/fetched before passing in)
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
        <Animated.View entering={FadeInUp.springify().mass(0.8)} style={styles.container}>
            <View style={styles.header}>
                <Brain size={48} color={Colors.mentra.brandPrimary} style={{ marginBottom: Metrics.spacing.m }} />
                {/* @ts-ignore */}
                <ThemedText style={styles.title}>{I18n.t('sessionComplete') || 'Session Complete'}</ThemedText>
                <ThemedText style={styles.insight}>{getInsight()}</ThemedText>
            </View>

            <Card variant="outline" style={styles.metricsCard}>
                <View style={styles.scoreRow}>
                    {/* @ts-ignore */}
                    <ThemedText style={styles.scoreLabel}>{I18n.t('finalScore') || 'Final Score'}</ThemedText>
                    <ThemedText style={styles.scoreValue}>{score}</ThemedText>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsGrid}>
                    <StatCard
                        // @ts-ignore
                        title={I18n.t('accuracy') || 'Accuracy'}
                        value={`${Math.round(accuracy)}%`}
                        icon={<CheckCircle size={18} color={Colors.mentra.success} />}
                        style={styles.statBox}
                        trendPositive={accuracy > 80}
                    />
                    <StatCard
                        // @ts-ignore
                        title={I18n.t('reactionTime') || 'Reaction'}
                        value={formattedReaction}
                        icon={<Zap size={18} color={Colors.mentra.warning} />}
                        style={styles.statBox}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.focusRow}>
                    <Activity size={20} color={Colors.mentra.brandAccent} />
                    <View style={{ marginLeft: Metrics.spacing.s, flex: 1 }}>
                        {/* @ts-ignore */}
                        <ThemedText style={styles.focusLabel}>{I18n.t('focusStability') || 'Focus Stability'}</ThemedText>
                        <View style={styles.focusBarBg}>
                            <Animated.View style={[styles.focusBarFill, { width: `${accuracy}%` }]} />
                        </View>
                    </View>
                </View>
            </Card>

            <View style={styles.actions}>
                <PrimaryButton
                    title={I18n.t('continue') || 'Continue'}
                    icon={<ArrowRight size={20} color={Colors.mentra.surface} />}
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
        backgroundColor: Colors.mentra.surface,
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
        color: Colors.mentra.text,
        marginBottom: 8,
    },
    insight: {
        fontSize: 16,
        color: Colors.mentra.brandPrimary,
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
        color: Colors.mentra.textDim,
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.mentra.brandAccent,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.mentra.divider,
        marginVertical: Metrics.spacing.m,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Metrics.spacing.m,
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.mentra.surface2,
        padding: Metrics.spacing.m,
    },
    focusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    focusLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.mentra.text,
        marginBottom: 6,
    },
    focusBarBg: {
        height: 6,
        backgroundColor: Colors.mentra.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    focusBarFill: {
        height: '100%',
        backgroundColor: Colors.mentra.brandAccent,
    },
    actions: {
        marginTop: Metrics.spacing.s,
    }
});
