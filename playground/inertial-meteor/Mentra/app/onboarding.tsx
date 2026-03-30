import React, { useState, useEffect, memo } from 'react';
import {
    View, StyleSheet, TextInput, Pressable,
    KeyboardAvoidingView, Platform, Alert, Text, ScrollView,
    Dimensions, I18nManager
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BrainCircuit, CheckCircle2, ShieldCheck, Sparkles, Zap, ChevronRight } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { Storage } from '@/services/storage';
import { I18n, LANG_META, Lang } from '@/services/i18n';

const { width } = Dimensions.get('window');

// ─── Challenge Options ──────────────────────────────────────────────────────
const CHALLENGES = [
    { key: 'brainFog',     emoji: '🌫️', color: '#6366F1', bg: '#EDECFD' },
    { key: 'stress',       emoji: '😤', color: '#EF4444', bg: '#FEF2F2' },
    { key: 'focus',        emoji: '🎯', color: Colors.mentra.brandPrimary, bg: '#E8F5F0' },
    { key: 'memory',       emoji: '🧠', color: '#8B5CF6', bg: '#F5F3FF' },
    { key: 'sleep',        emoji: '😴', color: '#3B82F6', bg: '#DBEAFE' },
    { key: 'productivity', emoji: '📈', color: '#F59E0B', bg: '#FFFBEB' },
] as const;

type ChallengeKey = typeof CHALLENGES[number]['key'];

const IDENTITY_OPTIONS = [
    { key: 'idFocused',     emoji: '🎯' },
    { key: 'idDisciplined', emoji: '⚡' },
    { key: 'idCalm',        emoji: '🌊' },
    { key: 'idStructured',  emoji: '🏗️' },
    { key: 'idConsistent',  emoji: '🔄' },
] as const;

const LANG_OPTIONS: Lang[] = ['en', 'tr', 'zh', 'ar', 'fr', 'de', 'hi'];

// ─── Step dots ──────────────────────────────────────────────────────────────
const StepDots = memo(({ total, current }: { total: number; current: number }) => {
    return (
        <View style={styles.stepDots}>
            {Array.from({ length: total }).map((_, i) => (
                <View key={i} style={[styles.stepDot, i <= current && styles.stepDotActive]} />
            ))}
        </View>
    );
});

export default function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [challenge, setChallenge] = useState<ChallengeKey | null>(null);
    const [identity, setIdentity] = useState<string>('idStructured');
    const [selectedLang, setSelectedLang] = useState<Lang>(I18n.getLanguage() as Lang);

    useEffect(() => {
        const unsub = I18n.subscribe(() => {
            setSelectedLang(I18n.getLanguage() as Lang);
        });
        return unsub;
    }, []);

    const handleLangSelect = async (code: Lang) => {
        await I18n.setLanguage(code);
        setSelectedLang(code);
    };

    const handleNext = async () => {
        if (step === 0) setStep(1); // To Mission
        else if (step === 1) setStep(2); // To Name
        else if (step === 2) {
            if (!name.trim()) return;
            setStep(3); // To Challenge
        } else if (step === 3) {
            if (!challenge) return;
            setStep(4); // To Identity
        } else if (step === 4) {
            try {
                await Storage.saveUserProfile({
                    name: name.trim(),
                    identity: identity as any,
                    joinedDate: new Date().toISOString(),
                    isOnboardingCompleted: true,
                    identityLevel: 'Structured Beginner',
                    consistencyScore: 100,
                    flowDays: 1,
                    primaryChallenge: challenge ?? 'focus',
                    preferredLang: selectedLang,
                });
                router.replace('/(tabs)');
            } catch (e) {
                Alert.alert(I18n.t('error'), I18n.t('couldNotSave'));
            }
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Language
                return (
                    <Animated.View entering={FadeInUp.springify()} style={styles.stepContainer}>
                        <View style={styles.logoRow}>
                            <LinearGradient colors={['#194031', '#20503D']} style={styles.logoBox}>
                                <BrainCircuit size={32} color={Colors.mentra.brandSecondary} />
                            </LinearGradient>
                        </View>
                        <Text style={styles.bigTitle}>Mentra</Text>
                        <Text style={styles.bigSub}>Choose your language</Text>
                        <View style={styles.langGrid}>
                            {LANG_OPTIONS.map((code) => {
                                const meta = LANG_META[code];
                                const isActive = selectedLang === code;
                                return (
                                    <Pressable
                                        key={code}
                                        onPress={() => handleLangSelect(code)}
                                        style={({ pressed }) => [
                                            styles.langCard,
                                            isActive && styles.langCardActive,
                                            pressed && { opacity: 0.85 },
                                        ]}
                                    >
                                        <Text style={styles.langFlag}>{meta.flag}</Text>
                                        <Text style={[styles.langNative, isActive && { color: '#FFF' }]}>
                                            {meta.nativeLabel}
                                        </Text>
                                        {isActive && <CheckCircle2 size={14} color={Colors.mentra.brandSecondary} />}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Animated.View>
                );

            case 1: // Mission & Science
                return (
                    <Animated.View entering={FadeInUp.springify()} style={styles.stepContainer}>
                        <View style={[styles.stepIconBox, { backgroundColor: Colors.mentra.brandPrimary + '15' }]}>
                            <ShieldCheck size={40} color={Colors.mentra.brandPrimary} />
                        </View>
                        <Text style={styles.stepTitle}>{I18n.t('onboardingMissionTitle' as any)}</Text>
                        <Text style={styles.stepSub}>{I18n.t('onboardingMissionDesc' as any)}</Text>
                        
                        <View style={styles.scienceCard}>
                             <Text style={styles.scienceLabel}>{I18n.t('onboardingScienceFoundations' as any)}</Text>
                             <View style={styles.scienceRow}>
                                <Zap size={16} color={Colors.mentra.brandSecondary} />
                                <Text style={styles.scienceText}>{I18n.t('onboardingScienceStanford' as any)}</Text>
                             </View>
                             <View style={styles.scienceRow}>
                                <Sparkles size={16} color={Colors.mentra.brandPrimary} />
                                <Text style={styles.scienceText}>{I18n.t('onboardingScienceIISc' as any)}</Text>
                             </View>
                        </View>
                    </Animated.View>
                );

            case 2: // Name
                return (
                    <Animated.View entering={FadeInUp.springify()} style={styles.stepContainer}>
                        <View style={[styles.stepIconBox, { backgroundColor: '#E8F5F0' }]}>
                            <Text style={{ fontSize: 36 }}>👋</Text>
                        </View>
                        <Text style={styles.stepTitle}>{I18n.t('welcomeOnboarding')}</Text>
                        <Text style={styles.stepSub}>{I18n.t('setupProfile')}</Text>
                        <View style={styles.inputCard}>
                            <Text style={styles.inputLabel}>{I18n.t('whatsYourName')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={I18n.t('enterName')}
                                placeholderTextColor={Colors.mentra.muted}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                returnKeyType="next"
                                onSubmitEditing={handleNext}
                            />
                        </View>
                    </Animated.View>
                );

            case 3: // Challenge
                return (
                    <Animated.View entering={FadeInUp.springify()} style={styles.stepContainer}>
                        <View style={[styles.stepIconBox, { backgroundColor: '#EDECFD' }]}>
                            <Text style={{ fontSize: 36 }}>🎯</Text>
                        </View>
                        <Text style={styles.stepTitle}>{I18n.t('challengeTitle')}</Text>
                        <Text style={styles.stepSub}>{I18n.t('challengeSub')}</Text>
                        <View style={styles.challengeGrid}>
                            {CHALLENGES.map((c) => {
                                const isSelected = challenge === c.key;
                                const labelKey = ('challenge' + c.key.charAt(0).toUpperCase() + c.key.slice(1)) as any;
                                return (
                                    <Pressable
                                        key={c.key}
                                        onPress={() => setChallenge(c.key)}
                                        style={[
                                            styles.challengeCard,
                                            { backgroundColor: c.bg, borderColor: isSelected ? c.color : 'transparent' },
                                        ]}
                                    >
                                        <Text style={styles.challengeEmoji}>{c.emoji}</Text>
                                        <Text style={[styles.challengeLabel, isSelected && { color: c.color, fontWeight: '800' }]}>
                                            {I18n.t(labelKey)}
                                        </Text>
                                        {isSelected && (
                                            <View style={[styles.challengeCheck, { backgroundColor: c.color }]}>
                                                <CheckCircle2 size={12} color="#FFF" />
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Animated.View>
                );

            case 4: // Identity
                return (
                    <Animated.View entering={FadeInUp.springify()} style={styles.stepContainer}>
                        <View style={[styles.stepIconBox, { backgroundColor: '#E8F5F0' }]}>
                            <BrainCircuit size={32} color={Colors.mentra.brandPrimary} />
                        </View>
                        <Text style={styles.stepTitle}>{I18n.t('coreIdentityTitle')}</Text>
                        <Text style={styles.stepSub}>{I18n.t('whoToBecome')}</Text>
                        <View style={styles.identityList}>
                            {IDENTITY_OPTIONS.map(({ key, emoji }) => {
                                const isSelected = identity === key;
                                return (
                                    <Pressable
                                        key={key}
                                        onPress={() => setIdentity(key)}
                                        style={[styles.identityRow, isSelected && styles.identityRowActive]}
                                    >
                                        <Text style={{ fontSize: 22 }}>{emoji}</Text>
                                        <Text style={[styles.identityText, isSelected && { color: Colors.mentra.brandPrimary, fontWeight: '800' }]}>
                                            {I18n.t(key as any)}
                                        </Text>
                                        {isSelected && (
                                            <CheckCircle2 size={18} color={Colors.mentra.brandPrimary} style={styles.rowCheck} />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Animated.View>
                );
        }
    };

    const canProceed =
        step === 0 ? true :
        step === 1 ? true :
        step === 2 ? name.trim().length > 0 :
        step === 3 ? challenge !== null :
        true;

    const ctaLabel = step === 4 ? I18n.t('buildStructureBtn') : I18n.t('continue');

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <StepDots total={5} current={step} />
                    {renderStep()}
                    <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.footer}>
                        <Pressable
                            onPress={handleNext}
                            disabled={!canProceed}
                            style={({ pressed }) => [
                                styles.ctaBtn,
                                !canProceed && styles.ctaBtnDisabled,
                                pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                            ]}
                        >
                            <Text style={styles.ctaBtnText}>{ctaLabel}</Text>
                        </Pressable>
                        {step > 0 && (
                            <Pressable onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
                                <Text style={styles.backBtnText}>← {I18n.t('cancel')}</Text>
                            </Pressable>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.mentra.bg },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 60 },

    stepDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 40 },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mentra.border },
    stepDotActive: { width: 24, backgroundColor: Colors.mentra.brandPrimary },

    stepContainer: { flex: 1, alignItems: 'center', paddingBottom: 32 },

    // Step 0 — Language
    logoRow: { marginBottom: 16 },
    logoBox: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    bigTitle: { fontSize: 40, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -1, marginBottom: 6 },
    bigSub: { fontSize: 15, color: Colors.mentra.textDim, marginBottom: 28, fontWeight: '500' },
    langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' },
    langCard: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16,
        backgroundColor: Colors.mentra.surface, borderWidth: 2, borderColor: Colors.mentra.border,
        width: '47%',
    },
    langCardActive: { backgroundColor: Colors.mentra.brandPrimary, borderColor: Colors.mentra.brandPrimary },
    langFlag: { fontSize: 22 },
    langNative: { fontSize: 14, fontWeight: '700', color: Colors.mentra.text, flex: 1, textAlign: 'left' },

    // Step 1 — Mission
    scienceCard: {
        width: '100%', backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: Colors.mentra.border, gap: 12, marginTop: 10,
    },
    scienceLabel: { fontSize: 10, fontWeight: '800', color: Colors.mentra.muted, letterSpacing: 1.5, marginBottom: 4 },
    scienceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    scienceText: { fontSize: 15, fontWeight: '700', color: Colors.mentra.text },

    // Steps 1–3
    stepIconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    stepTitle: { fontSize: 26, fontWeight: '900', color: Colors.mentra.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: 10 },
    stepSub: { fontSize: 15, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 23, marginBottom: 20, paddingHorizontal: 10 },

    // Step 2 — Name
    inputCard: {
        width: '100%', backgroundColor: Colors.mentra.surface,
        borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.mentra.border,
    },
    inputLabel: { fontSize: 11, fontWeight: '800', color: Colors.mentra.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    input: { fontSize: 22, fontWeight: '700', color: Colors.mentra.text, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: Colors.mentra.brandPrimary },

    // Step 3 — Challenge
    challengeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%', justifyContent: 'center' },
    challengeCard: { width: (width - 68) / 2, padding: 16, borderRadius: 18, alignItems: 'center', gap: 6, borderWidth: 2, position: 'relative' },
    challengeEmoji: { fontSize: 28 },
    challengeLabel: { fontSize: 13, fontWeight: '800', color: Colors.mentra.text, textAlign: 'center' },
    challengeCheck: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

    // Step 4 — Identity
    identityList: { gap: 10, width: '100%' },
    identityRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 16, backgroundColor: Colors.mentra.surface, borderRadius: 18,
        borderWidth: 2, borderColor: 'transparent',
    },
    identityRowActive: { borderColor: Colors.mentra.brandPrimary, backgroundColor: Colors.mentra.brandPrimary + '08' },
    identityText: { fontSize: 16, fontWeight: '700', color: Colors.mentra.text },
    rowCheck: { marginLeft: 'auto' },

    // Footer
    footer: { marginTop: 8, gap: 12 },
    ctaBtn: {
        backgroundColor: Colors.mentra.brandPrimary, borderRadius: 18,
        paddingVertical: 18, alignItems: 'center',
        shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12,
    },
    ctaBtnDisabled: { backgroundColor: Colors.mentra.muted, shadowOpacity: 0 },
    ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#FFF', letterSpacing: 0.2 },
    backBtn: { alignItems: 'center', paddingVertical: 8 },
    backBtnText: { fontSize: 14, fontWeight: '600', color: Colors.mentra.textDim },
});
