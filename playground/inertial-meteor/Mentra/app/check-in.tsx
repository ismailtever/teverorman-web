import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card, Section } from '@/components/ui/Cards';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { SectionTitle } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/Progress';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';
import { I18n } from '@/services/i18n';

export default function CheckInScreen() {
    const C = useMentraTheme();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [_, forceUpdate] = useState(0);

    React.useEffect(() => {
        return I18n.subscribe(() => forceUpdate(n => n + 1));
    }, []);

    const CHECK_IN_STEPS = [
        {
            id: 'mood',
            question: I18n.t('moodQuestion'),
            options: [I18n.t('moodClear'), I18n.t('moodNeutral'), I18n.t('moodAnxious'), I18n.t('moodFatigued')]
        },
        {
            id: 'sleep',
            question: I18n.t('sleepQuestion'),
            options: [I18n.t('sleepOptimal'), I18n.t('sleepAdequate'), I18n.t('sleepDeficient')]
        },
        {
            id: 'focus',
            question: I18n.t('focusQuestion'),
            options: [I18n.t('focusReady'), I18n.t('focusLight'), I18n.t('focusSkip')]
        }
    ];

    const handleSelect = (option: string) => {
        setAnswers({ ...answers, [CHECK_IN_STEPS[step].id]: option });
    };

    const handleNext = () => {
        if (step < CHECK_IN_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            router.replace('/(tabs)');
        }
    };

    const currentStepData = CHECK_IN_STEPS[step];
    const progress = ((step + 1) / CHECK_IN_STEPS.length);
    const canProceed = !!answers[currentStepData.id];
    const styles = makeStyles(C);

    return (
        <View style={styles.container}>
            <StatusBar style={C.statusBar} />
            <AppHeader title={I18n.t('dailyCheckIn')} showBack={false} />

            <View style={styles.content}>
                {/* Progress Indicator */}
                <View style={styles.progressSection}>
                    <ProgressBar progress={progress} color={C.brandPrimary} />
                    <ThemedText style={styles.stepText}>{I18n.t('step')} {step + 1} {I18n.t('of')} {CHECK_IN_STEPS.length}</ThemedText>
                </View>

                {/* Question Section */}
                <Section style={styles.questionSection}>
                    <SectionTitle title={currentStepData.question} />

                    <View style={styles.optionsContainer}>
                        {currentStepData.options.map((option) => {
                            const isSelected = answers[currentStepData.id] === option;
                            return (
                                <SecondaryButton
                                    key={option}
                                    title={option}
                                    onPress={() => handleSelect(option)}
                                    style={[
                                        styles.optionButton,
                                        isSelected && { borderColor: C.brandPrimary, backgroundColor: C.surface2, borderWidth: 2 }
                                    ]}
                                    fullWidth
                                />
                            );
                        })}
                    </View>
                </Section>

                <View style={{ flex: 1 }} />

                {/* Footer Controls */}
                <View style={styles.footer}>
                    <PrimaryButton
                        title={step === CHECK_IN_STEPS.length - 1 ? I18n.t('finish') : I18n.t('next')}
                        onPress={handleNext}
                        disabled={!canProceed}
                        fullWidth
                    />
                </View>
            </View>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: C.bg },
        content: { flex: 1, padding: Metrics.spacing.l },
        progressSection: { marginBottom: Metrics.spacing.xxl },
        stepText: { marginTop: Metrics.spacing.s, color: C.textDim, fontSize: 14, fontWeight: '500', textAlign: 'right' },
        questionSection: { marginTop: Metrics.spacing.l },
        optionsContainer: { marginTop: Metrics.spacing.xl, gap: Metrics.spacing.m },
        optionButton: {
            justifyContent: 'flex-start',
            paddingHorizontal: Metrics.spacing.l,
            height: 64,
            backgroundColor: C.surface,
            borderColor: C.border,
        },
        footer: { paddingBottom: Metrics.spacing.xl },
    });
}
