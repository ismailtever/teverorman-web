/**
 * DEEP FOCUS — Monotasking Timer
 * Trains sustained attention — the skill social media steals most.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { X, Brain, BrainCircuit, Play, Pause, RotateCcw, Sparkles } from 'lucide-react-native';
import { I18n } from '@/services/i18n';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import { Storage } from '@/services/storage';
import { AnalysisEngine, DEFAULT_COGNITIVE_PROFILE } from '@/services/engine/AnalysisEngine';
import { RawGameSession } from '@/services/engine/types';
import { Logger } from '@/services/logger';
import { Streak } from '@/services/streak';

type Phase = 'setup' | 'focus' | 'done';

const DURATIONS = [
  { mins: 5,  label: '5 min',  desc: 'Starter',   color: '#10B981' },
  { mins: 10, label: '10 min', desc: 'Builder',    color: '#194031' },
  { mins: 20, label: '20 min', desc: 'Deep Work',  color: '#6366F1' },
  { mins: 30, label: '30 min', desc: 'Flow State', color: '#8B5CF6' },
];

const FOCUS_QUOTES = [
  "Your brain is rebuilding its ability to hold a single thought.",
  "Every second without checking your phone is a rep for your prefrontal cortex.",
  "Boredom is not a problem — it's your dopamine system resetting.",
  "The discomfort you feel is neuroplasticity happening.",
  "Deep work is the skill social media stole. You're taking it back.",
];

import { NeuroActivationWarmup } from '@/components/game/NeuroActivationWarmup';

export default function DeepFocusGame() {
  const insets = useSafeAreaInsets();
  const C = useMentraTheme();
  const styles = makeStyles(C);
  const [phase, setPhase]             = useState<Phase>('setup');
  const [selectedDur, setSelectedDur] = useState(DURATIONS[0]);
  const [task, setTask]               = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused]       = useState(false);
  const [showWarmup, setShowWarmup]   = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [quoteIdx]                    = useState(Math.floor(Math.random() * FOCUS_QUOTES.length));

  // Refs to avoid stale closures inside setInterval
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef     = useRef(false);
  const secondsRef      = useRef(0);
  const distractionsRef = useRef(0); // mirrors distractions state — safe to read from timer
  const selectedDurRef  = useRef(DURATIONS[0]); // mirrors selectedDur
  const totalSecs    = selectedDur.mins * 60;
  const progress     = useSharedValue(1);
  const progStyle    = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` as any }));

  // Keep refs in sync with state
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { secondsRef.current = secondsLeft; }, [secondsLeft]);
  useEffect(() => { distractionsRef.current = distractions; }, [distractions]);
  useEffect(() => { selectedDurRef.current = selectedDur; }, [selectedDur]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { stopTimer(); }, [stopTimer]);

  const startGame = useCallback(() => {
    const total = selectedDur.mins * 60;
    setPhase('focus');
    setSecondsLeft(total);
    secondsRef.current = total;
    setIsPaused(false);
    setDistractions(0);
    progress.value = 1;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // BUG FIX 1: Single interval, reads from refs — no deps on state
    stopTimer();
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return; // Skip tick while paused — don't clear
      const next = secondsRef.current - 1;
      secondsRef.current = next;
      setSecondsLeft(next);
      progress.value = withTiming(next / total, { duration: 900 });
      if (next <= 0) {
        stopTimer();
        finishFocusSession();
      }
    }, 1000);
  }, [selectedDur, stopTimer]);

  const finishFocusSession = async () => {
    setPhase('done');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Use refs — avoids stale closure when called from setInterval
    const currentDistractions = distractionsRef.current;
    const currentDurMins = selectedDurRef.current.mins;
    const finalFocusScore = Math.max(0, 100 - currentDistractions * 20);

    const session: RawGameSession = {
        sessionId: `${Date.now()}-focus-flow`,
        gameId: 'focus-flow',
        timestamp: new Date().toISOString(),
        durationSeconds: currentDurMins * 60,
        events: [],
        rtAllMs: [],
        rtCorrectMs: [],
        score: finalFocusScore,
        accuracy: 1.0,
        avgReactionTime: 0,
        maxStreak: currentDurMins
    };

    try {
        await Storage.saveSession(session);
        await Storage.saveGameScore('focus-flow', finalFocusScore);

        const currentProfile = await Storage.getCognitiveProfile() || DEFAULT_COGNITIVE_PROFILE;
        const updatedProfile = AnalysisEngine.updateProfile(currentProfile, session);
        await Storage.saveCognitiveProfile(updatedProfile);

        const newMentraScore = AnalysisEngine.calculateMentraScore(updatedProfile);
        await Storage.saveGlobalScore(newMentraScore);
        
        await Streak.recordSession();
        Logger.log('DeepFocus: Synced', newMentraScore);
    } catch (e) {
        Logger.error('DeepFocus sync error', e);
    }
  };

  // BUG FIX 2: Distraction count logic was inverted (counted when RESUMING, not pausing)
  const togglePause = useCallback(() => {
    const nowPaused = !isPausedRef.current;
    isPausedRef.current = nowPaused;
    setIsPaused(nowPaused);
    if (nowPaused) {
      // User paused = distraction
      setDistractions(d => d + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setIsPaused(false);
    setSecondsLeft(totalSecs);
    secondsRef.current = totalSecs;
    progress.value = withTiming(1, { duration: 400 });
  }, [totalSecs, stopTimer]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const focusScore = Math.max(0, 100 - distractions * 20);

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style={C.statusBar} />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}><X size={20} color={C.text} /></Pressable>
          <Text style={styles.headerTitle}>Deep Focus</Text>
          <View style={{ width: 40 }} />
        </View>
        <Animated.View entering={FadeIn.springify()} style={styles.setupContent}>
          <View style={styles.scienceBox}>
            <View style={styles.sectionHeader}>
              <BrainCircuit size={14} color={C.brandSecondary} />
              <ThemedText style={[styles.sectionLabel, { color: C.brandSecondary }]}>
                {I18n.t('scienceBehind')}
              </ThemedText>
            </View>
            <ThemedText style={styles.scienceWhat}>
              {I18n.t('dfIntroWhat')}
            </ThemedText>
            <ThemedText style={styles.scienceWhy}>
              {I18n.t('dfIntroWhy')}
            </ThemedText>
          </View>
          <Text style={styles.setupLabel}>WHAT WILL YOU WORK ON?</Text>
          <TextInput
            style={styles.taskInput}
            placeholder="e.g. Read 20 pages, Write report intro..."
            placeholderTextColor={C.muted}
            value={task} onChangeText={setTask} multiline
          />
          <Text style={styles.setupLabel}>CHOOSE DURATION</Text>
          <View style={styles.durGrid}>
            {DURATIONS.map(d => (
              <Pressable key={d.mins}
                onPress={() => { setSelectedDur(d); Haptics.selectionAsync(); }}
                style={[styles.durCard, selectedDur.mins === d.mins && { borderColor: d.color, backgroundColor: d.color + '10' }]}
              >
                <Text style={[styles.durLabel, { color: d.color }]}>{d.label}</Text>
                <Text style={styles.durDesc}>{d.desc}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setShowWarmup(true)} style={[styles.startBtn, { backgroundColor: selectedDur.color }]}>
            <Play size={18} color="#FFF" />
            <Text style={styles.startBtnText}>Start Deep Focus</Text>
          </Pressable>
        </Animated.View>

        <NeuroActivationWarmup 
            visible={showWarmup} 
            gameTitle="DEEP FOCUS"
            tutorialText={I18n.t('gameDeepFocusTutorial' as any)}
            onComplete={() => {
                setShowWarmup(false);
                startGame();
            }} 
        />
      </View>
    </KeyboardAvoidingView>
  );

  // ── Done ───────────────────────────────────────────────────────────────────
  if (phase === 'done') return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: C.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={C.statusBar} />
      <Animated.View entering={FadeIn.springify()} style={styles.doneBox}>
        <Text style={{ fontSize: 72 }}>🎯</Text>
        <Text style={styles.doneTitle}>Deep Work Done</Text>
        <Text style={styles.doneTask}>{task || 'Focus session'}</Text>
        <View style={styles.doneStats}>
          <View style={styles.doneStat}><Text style={styles.doneStatVal}>{selectedDur.mins}</Text><Text style={styles.doneStatLabel}>minutes</Text></View>
          <View style={styles.doneStat}>
            <Text style={[styles.doneStatVal, { color: focusScore >= 80 ? C.success : C.warning }]}>{focusScore}</Text>
            <Text style={styles.doneStatLabel}>focus score</Text>
          </View>
          <View style={styles.doneStat}>
            <Text style={[styles.doneStatVal, distractions > 0 ? { color: C.danger } : { color: C.success }]}>{distractions}</Text>
            <Text style={styles.doneStatLabel}>pauses</Text>
          </View>
        </View>
        <Text style={styles.doneTip}>
          {distractions === 0
            ? "Perfect focus. Your prefrontal cortex just got a full workout."
            : `${distractions} pause${distractions > 1 ? 's' : ''}. Each one was a pull from your old habit. You still finished — that's the win.`}
        </Text>
        <Pressable onPress={() => setPhase('setup')} style={[styles.startBtn, { backgroundColor: selectedDur.color }]}>
          <Text style={styles.startBtnText}>Another Session</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Home</Text>
        </Pressable>
      </Animated.View>
    </View>
  );

  // ── Focus mode ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <LinearGradient colors={['#194031', '#0F2820']} style={StyleSheet.absoluteFill} />
      <View style={styles.focusHeader}>
        <Pressable onPress={() => { stopTimer(); router.back(); }} style={styles.closeBtnDark}>
          <X size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <View style={styles.distractionBadge}>
          <Text style={styles.distractionText}>{distractions} pause{distractions !== 1 ? 's' : ''}</Text>
        </View>
      </View>
      <Animated.View entering={FadeIn} style={styles.focusCenter}>
        <Text style={styles.focusTask}>{task || 'Deep Focus'}</Text>
        <View style={styles.timerCircle}>
          <View style={styles.timerCircleInner} />
          <Text style={styles.timerDisplay}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</Text>
          <Text style={styles.timerLabel}>{isPaused ? 'PAUSED' : 'FOCUSED'}</Text>
        </View>
        <Text style={styles.focusQuote}>"{FOCUS_QUOTES[quoteIdx]}"</Text>
      </Animated.View>
      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressFill, { backgroundColor: selectedDur.color }, progStyle]} />
      </View>
      <View style={styles.focusControls}>
        <Pressable onPress={resetTimer} style={styles.controlBtn}>
          <RotateCcw size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <Pressable onPress={togglePause} style={[styles.mainControlBtn, { backgroundColor: selectedDur.color }]}>
          {isPaused ? <Play size={28} color="#FFF" /> : <Pause size={28} color="#FFF" />}
        </Pressable>
        <View style={{ width: 52 }} />
      </View>
    </View>
  );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },
    closeBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
    closeBtnDark: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    setupContent: { flex: 1, paddingHorizontal: 24, paddingTop: 8, gap: 16 },
    scienceBox: {
      backgroundColor: C.brandSecondary + '18',
      padding: Metrics.spacing.m,
      borderRadius: Metrics.radius.m,
      width: '100%',
      borderWidth: 1,
      borderColor: C.brandSecondary + '30',
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
      color: C.brandPrimary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    scienceWhat: {
      fontSize: 15,
      fontWeight: '700',
      color: C.text,
      marginBottom: 4,
    },
    scienceWhy: {
      fontSize: 13,
      color: C.textDim,
      lineHeight: 18,
    },
    setupLabel: { fontSize: 11, fontWeight: '800', color: C.textDim, letterSpacing: 1.5 },
    taskInput: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, fontSize: 15, color: C.text, minHeight: 72 },
    durGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    durCard: { width: '47%', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: C.border, backgroundColor: C.surface, alignItems: 'center', gap: 4 },
    durLabel: { fontSize: 18, fontWeight: '800' },
    durDesc: { fontSize: 11, color: C.textDim, fontWeight: '600' },
    startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 4 },
    startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    focusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
    distractionBadge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    distractionText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
    focusCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 28 },
    focusTask: { fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textAlign: 'center' },
    timerCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    timerCircleInner: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(74,222,128,0.06)' },
    timerDisplay: { fontSize: 52, fontWeight: '900', color: '#FFF', letterSpacing: -2 },
    timerLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 2 },
    focusQuote: { fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 22, fontStyle: 'italic', paddingHorizontal: 16 },
    progressBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 24, borderRadius: 2, marginBottom: 24 },
    progressFill: { height: 3, borderRadius: 2 },
    focusControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingBottom: 40 },
    controlBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    mainControlBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
    doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
    doneTitle: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
    doneTask: { fontSize: 14, color: C.textDim, textAlign: 'center' },
    doneStats: { flexDirection: 'row', gap: 12 },
    doneStat: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
    doneStatVal: { fontSize: 28, fontWeight: '900', color: C.text },
    doneStatLabel: { fontSize: 10, color: C.textDim, fontWeight: '600', marginTop: 2 },
    doneTip: { fontSize: 13, color: C.textDim, textAlign: 'center', lineHeight: 20 },
    backLink: { paddingVertical: 8 },
    backLinkText: { color: C.textDim, fontSize: 14, fontWeight: '600' },
  });
}
