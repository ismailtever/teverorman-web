import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Play, CheckCircle2, Zap, Brain } from 'lucide-react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card, Section } from '@/components/ui/Cards';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { SectionTitle } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/Progress';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';
import { ListRow } from '@/components/ui/ListRow';

export default function TrainingSessionScreen() {
    const C = useMentraTheme();
    const styles = makeStyles(C);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // SESSION_STEPS defined inside component so C.* colors are available
    const SESSION_STEPS = [
        {
            id: 'warmup',
            title: 'Speed Match (Warm-up)',
            duration: '2 min',
            icon: <Zap size={24} color={C.warning} />,
            route: '/game/speed-match'
        },
        {
            id: 'core',
            title: 'Memory Grid (Core)',
            duration: '5 min',
            icon: <Brain size={24} color={C.brandPrimary} />,
            route: '/game/memory-grid'
        },
        {
            id: 'cooldown',
            title: 'Focus Breathing',
            duration: '3 min',
            icon: <CheckCircle2 size={24} color={C.brandAccent} />,
            route: '/(tabs)' // Placeholder for now
        }
    ];

    const handleStartGame = () => {
        const route = SESSION_STEPS[currentStepIndex].route;
        router.push(route as any);

        // Simulate progressing to the next step when they come back
        if (currentStepIndex < SESSION_STEPS.length - 1) {
            setTimeout(() => setCurrentStepIndex(c => c + 1), 1000);
        }
    };

    const handleFinish = () => {
        router.replace('/(tabs)');
    };

    const progress = (currentStepIndex / SESSION_STEPS.length);
    const isFinished = currentStepIndex >= SESSION_STEPS.length;

    return (
        <View style={styles.container}>
            <StatusBar style={C.statusBar} />
            <AppHeader title="Today's Session" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Progress Header */}
                <Section style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <SectionTitle title="Session Progress" />
                        <ThemedText style={styles.progressText}>
                            {Math.min(currentStepIndex + 1, SESSION_STEPS.length)} / {SESSION_STEPS.length}
                        </ThemedText>
                    </View>
                    <ProgressBar progress={progress} color={C.brandPrimary} />
                </Section>

                {/* Session Steps List */}
                <Section>
                    <Card variant="outline" style={styles.stepsCard}>
                        {SESSION_STEPS.map((step, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isActive = index === currentStepIndex;
                            const isLocked = index > currentStepIndex;

                            return (
                                <ListRow
                                    key={step.id}
                                    icon={
                                        isCompleted ?
                                            <CheckCircle2 size={24} color={C.success} /> :
                                            step.icon
                                    }
                                    title={step.title}
                                    subtitle={step.duration}
                                    style={[
                                        index !== SESSION_STEPS.length - 1 && styles.borderBottom,
                                        isLocked && styles.opacityLocked,
                                        isActive && styles.activeRow
                                    ]}
                                    rightElement={
                                        isActive ? (
                                            <View style={styles.activeBadge}>
                                                <ThemedText style={styles.activeBadgeText}>UP NEXT</ThemedText>
                                            </View>
                                        ) : undefined
                                    }
                                />
                            );
                        })}
                    </Card>
                </Section>

                <View style={{ height: 40 }} />

            </ScrollView>

            <View style={styles.footer}>
                {!isFinished ? (
                    <PrimaryButton
                        title={`Start ${SESSION_STEPS[currentStepIndex].title}`}
                        icon={<Play size={18} color={C.surface} />}
                        onPress={handleStartGame}
                        fullWidth
                    />
                ) : (
                    <PrimaryButton
                        title="Complete Session"
                        icon={<CheckCircle2 size={18} color={C.surface} />}
                        onPress={handleFinish}
                        fullWidth
                    />
                )}
            </View>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: C.bg,
        },
        content: {
            padding: Metrics.spacing.l,
        },
        progressSection: {
            marginBottom: Metrics.spacing.xl,
        },
        progressHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: Metrics.spacing.s,
        },
        progressText: {
            fontSize: 14,
            fontWeight: '700',
            color: C.brandPrimary,
        },
        stepsCard: {
            padding: 0,
            overflow: 'hidden',
        },
        borderBottom: {
            borderBottomWidth: 1,
            borderBottomColor: C.divider,
        },
        opacityLocked: {
            opacity: 0.5,
        },
        activeRow: {
            backgroundColor: C.surface2,
        },
        activeBadge: {
            backgroundColor: C.brandAccent,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: Metrics.radius.s,
        },
        activeBadgeText: {
            fontSize: 10,
            fontWeight: '800',
            color: C.bg,
        },
        footer: {
            padding: Metrics.spacing.l,
            paddingBottom: Metrics.spacing.xl,
            borderTopWidth: 1,
            borderTopColor: C.divider,
            backgroundColor: C.surface,
        }
    });
}
