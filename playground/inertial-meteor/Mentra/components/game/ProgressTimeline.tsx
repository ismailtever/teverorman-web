import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';
import { I18n } from '@/services/i18n';

interface ProgressTimelineProps {
    currentPhase: 1 | 2 | 3;
    progressInPhase: number; // 0.0 to 1.0
}

export function ProgressTimeline({ currentPhase, progressInPhase }: ProgressTimelineProps) {
    const C = useMentraTheme();
    const styles = makeStyles(C);

    return (
        <View style={styles.container}>
            <View style={styles.phasesContainer}>
                <PhaseIndicator
                    // @ts-ignore
                    label={I18n.t('warmup') || 'Warm-up'}
                    isActive={currentPhase === 1}
                    isComplete={currentPhase > 1}
                    progress={currentPhase === 1 ? progressInPhase : (currentPhase > 1 ? 1 : 0)}
                    C={C}
                    styles={styles}
                />
                <View style={[styles.connector, currentPhase > 1 && styles.connectorActive]} />

                <PhaseIndicator
                    // @ts-ignore
                    label={I18n.t('focusBlock') || 'Focus'}
                    isActive={currentPhase === 2}
                    isComplete={currentPhase > 2}
                    progress={currentPhase === 2 ? progressInPhase : (currentPhase > 2 ? 1 : 0)}
                    C={C}
                    styles={styles}
                />
                <View style={[styles.connector, currentPhase > 2 && styles.connectorActive]} />

                <PhaseIndicator
                    // @ts-ignore
                    label={I18n.t('peak') || 'Peak'}
                    isActive={currentPhase === 3}
                    isComplete={currentPhase > 3}
                    progress={currentPhase === 3 ? progressInPhase : (currentPhase > 3 ? 1 : 0)}
                    C={C}
                    styles={styles}
                />
            </View>
        </View>
    );
}

const PhaseIndicator = ({
    label, isActive, isComplete, progress, C, styles
}: {
    label: string;
    isActive: boolean;
    isComplete: boolean;
    progress: number;
    C: ReturnType<typeof useMentraTheme>;
    styles: ReturnType<typeof makeStyles>;
}) => {
    return (
        <View style={styles.phaseWrapper}>
            <View style={[
                styles.dotCircle,
                isActive && styles.dotActive,
                isComplete && styles.dotComplete,
            ]}>
                {isActive && (
                    <View style={styles.progressRing}>
                        <View style={[styles.progressFill, { height: `${progress * 100}%` }]} />
                    </View>
                )}
            </View>
            <ThemedText style={[
                styles.phaseLabel,
                (isActive || isComplete) && styles.phaseLabelActive
            ]}>
                {label}
            </ThemedText>
        </View>
    );
};

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: { width: '100%', paddingVertical: Metrics.spacing.s },
        phasesContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        phaseWrapper: { alignItems: 'center', width: 60 },
        dotCircle: {
            width: 14, height: 14, borderRadius: 7,
            backgroundColor: C.surface2, borderWidth: 2, borderColor: C.border,
            justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 4,
        },
        dotActive: { borderColor: C.brandPrimary, transform: [{ scale: 1.2 }] },
        dotComplete: { backgroundColor: C.brandPrimary, borderColor: C.brandPrimary },
        progressRing: { width: '100%', height: '100%', justifyContent: 'flex-end' },
        progressFill: { width: '100%', backgroundColor: C.brandPrimary },
        phaseLabel: { fontSize: 10, fontWeight: '700', color: C.textDim, textTransform: 'uppercase' },
        phaseLabelActive: { color: C.brandPrimary },
        connector: {
            flex: 1, height: 2, backgroundColor: C.border,
            marginHorizontal: -10, marginTop: -16, zIndex: -1,
        },
        connectorActive: { backgroundColor: C.brandPrimary },
    });
}
