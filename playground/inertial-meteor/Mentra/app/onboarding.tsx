import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/Buttons';
import { Card } from '@/components/ui/Cards';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { Storage } from '@/services/storage';
import { I18n } from '@/services/i18n';
import { BrainCircuit } from 'lucide-react-native';

// Map identity key → starting level i18n key
const IDENTITY_LEVEL_MAP: Record<string, string> = {
    idFocused:     'lvlBeginner',
    idDisciplined: 'lvlArchitect',
    idCalm:        'lvlBeginner',
    idStructured:  'lvlBuilder',
    idConsistent:  'lvlMaster',
};

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [identity, setIdentity] = useState<keyof typeof import('@/locales/en.json')>('idStructured');

    const identityKeys = ['idFocused', 'idDisciplined', 'idCalm', 'idStructured', 'idConsistent'] as const;

    const handleNext = async () => {
        if (step === 0 && name.trim().length > 0) {
            setStep(1);
        } else if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            try {
                const levelKey = IDENTITY_LEVEL_MAP[identity as string] ?? 'lvlBeginner';
                await Storage.saveUserProfile({
                    name: name.trim(),
                    identity,
                    joinedDate: new Date().toISOString(),
                    isOnboardingCompleted: true,
                    identityLevel: I18n.t(levelKey as any),
                    consistencyScore: 100,
                    flowDays: 1,
                });
                router.replace('/(tabs)');
            } catch (e) {
                Alert.alert(I18n.t('error'), I18n.t('couldNotSave'));
            }
        }
    };

    const isNextDisabled = step === 0 && name.trim().length === 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <ThemedText style={styles.title}>
                        {step === 0 ? I18n.t('welcomeOnboarding') : step === 1 ? I18n.t('appPurposeTitle') : I18n.t('coreIdentityTitle')}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {step === 0 ? I18n.t('setupProfile') : step === 1 ? '' : I18n.t('whoToBecome')}
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    {step === 0 && (
                        <Card variant="default">
                            <ThemedText style={styles.label}>
                                {I18n.t('whatsYourName')}
                            </ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder={I18n.t('enterName')}
                                placeholderTextColor={Colors.mentra.muted}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                            />
                        </Card>
                    )}

                    {step === 1 && (
                        <Card variant="default" style={styles.purposeCard}>
                            <View style={styles.iconCircle}>
                                <BrainCircuit size={40} color={Colors.mentra.brandPrimary} />
                            </View>
                            <ThemedText style={styles.purposeDesc}>
                                {I18n.t('appPurposeDesc')}
                            </ThemedText>
                        </Card>
                    )}

                    {step === 2 && (
                        <View style={{ gap: Metrics.spacing.s }}>
                            {identityKeys.map((idKey) => (
                                <Pressable key={idKey} onPress={() => setIdentity(idKey as any)}>
                                    <Card variant="default" style={[
                                        styles.goalCard,
                                        identity === idKey && { borderColor: Colors.mentra.brandPrimary, borderWidth: 2, backgroundColor: Colors.mentra.surface2 }
                                    ]}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <ThemedText style={[styles.goalText, identity === idKey && { fontWeight: '700' }]}>{I18n.t(idKey)}</ThemedText>
                                            {identity === idKey && <ThemedText style={{ color: Colors.mentra.brandPrimary, fontWeight: 'bold' }}>✓</ThemedText>}
                                        </View>
                                    </Card>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        title={step === 2 ? I18n.t('buildStructureBtn') : step === 1 ? I18n.t('continue') : I18n.t('next')}
                        onPress={handleNext}
                        fullWidth
                        disabled={isNextDisabled}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.mentra.bg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: Metrics.spacing.xl,
    },
    header: {
        marginBottom: Metrics.spacing.xxl,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.mentra.text,
        textAlign: 'center',
        marginBottom: Metrics.spacing.s,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.mentra.textDim,
        textAlign: 'center',
    },
    form: {
        marginBottom: Metrics.spacing.xxl,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.mentra.text,
        marginBottom: Metrics.spacing.m,
    },
    input: {
        fontSize: 20,
        color: Colors.mentra.text,
        paddingVertical: Metrics.spacing.m,
        borderBottomWidth: 2,
        borderBottomColor: Colors.mentra.border,
    },
    goalCard: {
        borderWidth: 2,
        borderColor: 'transparent',
    },
    goalText: {
        fontSize: 18,
        color: Colors.mentra.text,
    },
    purposeCard: {
