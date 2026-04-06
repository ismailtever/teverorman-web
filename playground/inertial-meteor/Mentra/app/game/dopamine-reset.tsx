/**
 * DOPAMINE RESET — Awareness + Pattern Break
 * 
 * Science: Social media hijacks the mesolimbic dopamine system with 
 * variable-ratio reinforcement (same mechanism as slot machines).
 * Each scroll = "maybe this time there's something good" — unpredictable 
 * reward that creates the strongest conditioning known to neuroscience.
 * 
 * This exercise: Makes the unconscious habit conscious, then breaks it.
 * Based on: Habit loop awareness (cue → routine → reward) + urge surfing.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { X, ChevronRight, Brain, TrendingDown, BrainCircuit, Play, Sparkles } from 'lucide-react-native';
import { I18n, useI18n } from '@/services/i18n';
import { NeuroActivationWarmup } from '@/components/game/NeuroActivationWarmup';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/Colors';
import { Storage } from '@/services/storage';
import { AnalysisEngine, DEFAULT_COGNITIVE_PROFILE } from '@/services/engine/AnalysisEngine';
import { RawGameSession } from '@/services/engine/types';
import { Logger } from '@/services/logger';
import { Streak } from '@/services/streak';

type Phase = 'intro' | 'trigger' | 'urge' | 'reset' | 'done';


export default function DopamineResetGame() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();

  const TRIGGERS = React.useMemo(() => [
    { emoji: '😴', label: t('drBoredom'), desc: t('drBoredomDesc') },
    { emoji: '😰', label: t('drAnxiety'), desc: t('drAnxietyDesc') },
    { emoji: '😴', label: t('drTiredness'), desc: t('drTirednessDesc') },
    { emoji: '🍽️', label: t('drWaiting'), desc: t('drWaitingDesc') },
    { emoji: '😔', label: t('drLoneliness'), desc: t('drLonelinessDesc') },
    { emoji: '📵', label: t('drHabit'), desc: t('drHabitDesc') },
  ], [lang]);

  const RESET_EXERCISES = React.useMemo(() => [
    {
      title: t('exBreathTitle'),
      emoji: '🌬️',
      duration: `60 ${t('secDuration')}`,
      steps: [t('exBreathStep1'), t('exBreathStep2'), t('exBreathStep3'), t('exBreathStep4')],
      science: t('exBreathScience'),
    },
    {
      title: t('exBodyScanTitle'),
      emoji: '🧘',
      duration: `90 ${t('secDuration')}`,
      steps: [t('exBodyScanStep1'), t('exBodyScanStep2'), t('exBodyScanStep3'), t('exBodyScanStep4'), t('exBodyScanStep5')],
      science: t('exBodyScanScience'),
    },
    {
      title: t('exGroundTitle'),
      emoji: '🌍',
      duration: `60 ${t('secDuration')}`,
      steps: [t('exGroundStep1'), t('exGroundStep2'), t('exGroundStep3'), t('exGroundStep4'), t('exGroundStep5')],
      science: t('exGroundScience'),
    },
  ], [lang]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [selectedTrigger, setSelectedTrigger] = useState<any>(null);
  const [urgeLevel, setUrgeLevel] = useState(5);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  React.useEffect(() => {
    if (!selectedExercise) setSelectedExercise(RESET_EXERCISES[0]);
  }, [RESET_EXERCISES]);
  const [showWarmup, setShowWarmup] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [sessions, setSessions] = useState(0);

  const nextStep = () => {
    Haptics.selectionAsync();
    if (stepIdx < selectedExercise.steps.length - 1) {
      setStepIdx(s => s + 1);
    } else {
      finishReset();
    }
  };

  const finishReset = async () => {
    setSessions(s => s + 1);
    setPhase('done');

    // Create a virtual session for Analysis Engine
    // Dopamine Reset improves Stability and reduces Impulse Factor
    const session: RawGameSession = {
        sessionId: `${Date.now()}-dopamine-reset`,
        gameId: 'dopamine-reset',
        timestamp: new Date().toISOString(),
        durationSeconds: 90, // Nominal duration
        events: [],
        rtAllMs: [800, 800, 800], // Stable, controlled RTs
        rtCorrectMs: [800],
        score: 100,
        accuracy: 1.0,
        avgReactionTime: 800,
        maxStreak: 1
    };

    try {
        await Storage.saveSession(session);
        const currentProfile = await Storage.getCognitiveProfile() || DEFAULT_COGNITIVE_PROFILE;
        const updatedProfile = AnalysisEngine.updateProfile(currentProfile, session);
        await Storage.saveCognitiveProfile(updatedProfile);

        const newMentraScore = AnalysisEngine.calculateMentraScore(updatedProfile);
        await Storage.saveGlobalScore(newMentraScore);
        
        await Streak.recordSession();
        Logger.log('DopamineReset: Synced', newMentraScore);
    } catch (e) {
        Logger.error('DopamineReset sync error', e);
    }
  };


  if (phase === 'intro') return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <Pressable onPress={() => router.back()} style={styles.closeBtn}><X size={22} color={Colors.mentra.text} /></Pressable>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.springify()} style={styles.introBox}>
          <Text style={styles.introEmoji}>🎰</Text>
          <Text style={styles.introTitle}>{t('drTitle')}</Text>
          
          <View style={{ width: '100%', gap: 12, marginVertical: 20 }}>
            <View style={styles.instructionsBox}>
              <View style={styles.sectionHeader}>
                <Play size={14} color={Colors.mentra.brandPrimary} />
                <ThemedText style={styles.sectionLabel}>{t('howToPlay')}</ThemedText>
              </View>
              <ThemedText style={styles.cardDesc}>
                {t('drIntroHow')}
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
                {t('drIntroWhat')}
              </ThemedText>
              <ThemedText style={styles.scienceWhy}>
                {t('drIntroWhy')}
              </ThemedText>
            </View>
          </View>
 
          <Pressable onPress={() => setShowWarmup(true)} style={styles.startBtn}>
            <Text style={styles.startBtnText}>{t('drStart')}</Text>
          </Pressable>
 
          <NeuroActivationWarmup 
            visible={showWarmup} 
            gameTitle={t('drNeuroTitle')}
            tutorialText={t('gameDopamineResetTutorial' as any)}
            onComplete={() => {
                setShowWarmup(false);
                setPhase('trigger');
            }} 
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
 
  if (phase === 'trigger') return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable onPress={() => router.back()} style={styles.closeBtn}><X size={22} color={Colors.mentra.text} /></Pressable>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.springify()} style={{ gap: 20 }}>
          <Text style={styles.phaseTitle}>{t('drRateTitle')}</Text>
          <Text style={styles.phaseSub}>{t('drRateSub')}</Text>
          {TRIGGERS.map((t, i) => (
            <Pressable
              key={i}
              onPress={() => { setSelectedTrigger(t); Haptics.selectionAsync(); }}
              style={[styles.triggerCard, selectedTrigger?.label === t.label && styles.triggerCardActive]}
            >
              <Text style={styles.triggerEmoji}>{t.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.triggerLabel}>{t.label}</Text>
                <Text style={styles.triggerDesc}>{t.desc}</Text>
              </View>
              {selectedTrigger?.label === t.label && <Text style={{ color: Colors.mentra.brandPrimary, fontSize: 18 }}>✓</Text>}
            </Pressable>
          ))}
          {selectedTrigger && (
            <Pressable onPress={() => setPhase('urge')} style={styles.startBtn}>
              <Text style={styles.startBtnText}>{t('drContinue')}</Text>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
 
  if (phase === 'urge') return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.springify()} style={{ gap: 20 }}>
          <Text style={styles.phaseTitle}>{t('drRateTitle')}</Text>
          <Text style={styles.phaseSub}>{t('drRateSub')}</Text>
          <View style={styles.urgeRow}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <Pressable
                key={n}
                onPress={() => { setUrgeLevel(n); Haptics.selectionAsync(); }}
                style={[styles.urgeBtn, urgeLevel === n && { backgroundColor: Colors.mentra.brandPrimary }]}
              >
                <Text style={[styles.urgeBtnText, urgeLevel === n && { color: '#FFF' }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.urgeHint}>
            {urgeLevel >= 8 ? t('drUrgeHigh')
            : urgeLevel >= 5 ? t('drUrgeMid')
            : t('drUrgeLow')}
          </Text>
          <Text style={styles.setupLabel}>{t('drSetupLabel')}</Text>
          {RESET_EXERCISES.map((ex, i) => (
            <Pressable
              key={i}
              onPress={() => { setSelectedExercise(ex); Haptics.selectionAsync(); }}
              style={[styles.exCard, selectedExercise.title === ex.title && styles.exCardActive]}
            >
              <Text style={styles.exEmoji}>{ex.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.exTitle}>{ex.title}</Text>
                <Text style={styles.exDur}>{ex.duration}</Text>
              </View>
              {selectedExercise.title === ex.title && <ChevronRight size={18} color={Colors.mentra.brandPrimary} />}
            </Pressable>
          ))}
          <Pressable onPress={() => { setStepIdx(0); setPhase('reset'); }} style={styles.startBtn}>
            <Text style={styles.startBtnText}>{t('drBeginRef').replace('%{method}', (selectedExercise || {}).title)}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
 
  if (phase === 'reset') return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View entering={FadeInDown.springify()} style={styles.resetBox}>
        <Text style={styles.resetEmoji}>{(selectedExercise || {}).emoji}</Text>
        <Text style={styles.resetTitle}>{(selectedExercise || {}).title}</Text>
        <View style={styles.stepBox}>
          <Text style={styles.stepNum}>{t('drStepRef').replace('%{current}', (stepIdx + 1).toString()).replace('%{total}', (selectedExercise?.steps || []).length.toString())}</Text>
          <Text style={styles.stepText}>{(selectedExercise?.steps || [])[stepIdx]}</Text>
        </View>
        <View style={styles.stepDots}>
          {selectedExercise.steps.map((_: string, i: number) => (
            <View key={i} style={[styles.stepDot, i === stepIdx && styles.stepDotActive, i < stepIdx && styles.stepDotDone]} />
          ))}
        </View>
        <Pressable onPress={nextStep} style={styles.startBtn}>
          <Text style={styles.startBtnText}>{stepIdx < (selectedExercise?.steps || []).length - 1 ? t('drNextStep') : t('drCompleteReset')}</Text>
        </Pressable>
        <Text style={styles.scienceSmall}>{(selectedExercise || {}).science}</Text>
      </Animated.View>
    </View>
  );
 
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View entering={FadeInDown.springify()} style={styles.doneBox}>
        <Text style={{ fontSize: 64 }}>🧠</Text>
        <Text style={styles.doneTitle}>{t('drDoneTitle')}</Text>
        <Text style={styles.doneSub}>
          {t('drDoneSub')}
        </Text>
        <View style={styles.doneCard}>
          <TrendingDown size={16} color={Colors.mentra.success} />
          <Text style={styles.doneCardText}>
            {t('drTriggerLabel')}: <Text style={{ fontWeight: '700' }}>{selectedTrigger?.label}</Text>{'\n'}
            {t('drUrgeLevelLabel')}: <Text style={{ fontWeight: '700' }}>{urgeLevel}/10</Text>{'\n'}
            {t('drMethodLabel')}: <Text style={{ fontWeight: '700' }}>{(selectedExercise || {}).title}</Text>
          </Text>
        </View>
        <Text style={styles.doneTip}>
          {t('drDoneTip')}
        </Text>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.startBtn}>
          <Text style={styles.startBtnText}>{t('backToHome')}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← {t('drBack')}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  scroll: { padding: 24, paddingBottom: 60 },
  closeBtn: { margin: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.mentra.border, backgroundColor: Colors.mentra.surface, alignItems: 'center', justifyContent: 'center' },

  introBox: { alignItems: 'center', gap: 0 },
  introEmoji: { fontSize: 64, marginBottom: 16 },
  introTitle: { fontSize: 30, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -0.5 },
  instructionsBox: {
    backgroundColor: Colors.mentra.surface,
    padding: Metrics.spacing.m,
    borderRadius: Metrics.radius.m,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.mentra.border,
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
  startBtn: { backgroundColor: Colors.mentra.brandPrimary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, alignItems: 'center', width: '100%' },
  startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  phaseTitle: { fontSize: 26, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -0.5 },
  phaseSub: { fontSize: 14, color: Colors.mentra.textDim, lineHeight: 22 },
  triggerCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: Colors.mentra.surface, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  triggerCardActive: { borderColor: Colors.mentra.brandPrimary, backgroundColor: Colors.mentra.brandPrimary + '08' },
  triggerEmoji: { fontSize: 24 },
  triggerLabel: { fontSize: 16, fontWeight: '700', color: Colors.mentra.text },
  triggerDesc: { fontSize: 12, color: Colors.mentra.textDim },

  urgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  urgeBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.mentra.border, backgroundColor: Colors.mentra.surface, alignItems: 'center', justifyContent: 'center' },
  urgeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.mentra.text },
  urgeHint: { fontSize: 13, color: Colors.mentra.textDim, lineHeight: 20 },
  setupLabel: { fontSize: 11, fontWeight: '800', color: Colors.mentra.textDim, letterSpacing: 1.5 },
  exCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: Colors.mentra.surface, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  exCardActive: { borderColor: Colors.mentra.brandPrimary, backgroundColor: Colors.mentra.brandPrimary + '08' },
  exEmoji: { fontSize: 24 },
  exTitle: { fontSize: 16, fontWeight: '700', color: Colors.mentra.text },
  exDur: { fontSize: 12, color: Colors.mentra.textDim },

  resetBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  resetEmoji: { fontSize: 64 },
  resetTitle: { fontSize: 24, fontWeight: '900', color: Colors.mentra.text },
  stepBox: { width: '100%', backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 28, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.mentra.border },
  stepNum: { fontSize: 11, fontWeight: '800', color: Colors.mentra.textDim, letterSpacing: 1 },
  stepText: { fontSize: 22, fontWeight: '700', color: Colors.mentra.text, textAlign: 'center', lineHeight: 32 },
  stepDots: { flexDirection: 'row', gap: 8 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mentra.border },
  stepDotActive: { width: 24, backgroundColor: Colors.mentra.brandPrimary },
  stepDotDone: { backgroundColor: Colors.mentra.success },
  scienceSmall: { fontSize: 11, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 18, fontStyle: 'italic', paddingHorizontal: 16 },

  doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
  doneTitle: { fontSize: 28, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -0.5 },
  doneSub: { fontSize: 15, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 24 },
  doneCard: { flexDirection: 'row', gap: 10, backgroundColor: Colors.mentra.success + '12', padding: 16, borderRadius: 14, width: '100%', alignItems: 'flex-start' },
  doneCardText: { fontSize: 13, color: Colors.mentra.text, lineHeight: 22, flex: 1 },
  doneTip: { fontSize: 13, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 20 },
  backLink: { paddingVertical: 8 },
  backLinkText: { color: Colors.mentra.textDim, fontSize: 14, fontWeight: '600' },
});
