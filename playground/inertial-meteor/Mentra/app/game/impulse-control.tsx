/**
 * IMPULSE CONTROL — Go/No-Go Game
 * Trains prefrontal inhibitory control — the neural brake social media erodes.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeOut, ZoomIn,
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { X, Brain, BrainCircuit, Play, Sparkles } from 'lucide-react-native';
import { useI18n } from '@/services/i18n';
import { NeuroActivationWarmup } from '@/components/game/NeuroActivationWarmup';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/Colors';
import { Storage } from '@/services/storage';
import { AnalysisEngine, DEFAULT_COGNITIVE_PROFILE } from '@/services/engine/AnalysisEngine';
import { RawGameSession } from '@/services/engine/types';
import { Logger } from '@/services/logger';
import { Streak } from '@/services/streak';

const { width } = Dimensions.get('window');

const TOTAL_ROUNDS = 20;
const STIMULUS_MS  = 1000;
const GAP_MS       = 500;

type GamePhase = 'intro' | 'playing' | 'results';

export default function ImpulseControlGame() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();

  const GO_STIMULI = React.useMemo(() => [
    { emoji: '🧠', label: t('icStimBrain'), color: Colors.mentra.brandPrimary, bg: '#E8F5F0', tap: true  },
    { emoji: '⚡', label: t('icStimFocus'), color: '#10B981',                  bg: '#ECFDF5', tap: true  },
    { emoji: '💡', label: t('icStimLogic'), color: '#F59E0B',                  bg: '#FFFBEB', tap: true  },
    { emoji: '🎯', label: t('icStimSharp'), color: '#6366F1',                  bg: '#EDECFD', tap: true  },
  ], [lang, t]);

  const NOGO_STIMULI = React.useMemo(() => [
    { emoji: '❤️',  label: t('icBaitLikes'),       color: '#EF4444', bg: '#FEF2F2', tap: false },
    { emoji: '💬',  label: t('icBaitComments'),     color: '#3B82F6', bg: '#DBEAFE', tap: false },
    { emoji: '🔔',  label: t('icBaitNotif'),   color: '#F59E0B', bg: '#FFFBEB', tap: false },
    { emoji: '👀',  label: t('icBaitViews'), color: '#8B5CF6', bg: '#F5F3FF', tap: false },
    { emoji: '🔥',  label: t('icBaitTrending'),   color: '#EF4444', bg: '#FEF2F2', tap: false },
    { emoji: '📲',  label: t('icBaitMessage'),    color: '#10B981', bg: '#ECFDF5', tap: false },
  ], [lang, t]);

  const [phase, setPhase]           = useState<GamePhase>('intro');
  const [score, setScore]           = useState(0);
  const [showWarmup, setShowWarmup] = useState(false);
  const [misses, setMisses]         = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [round, setRound]           = useState(0);
  const [current, setCurrent]       = useState<(typeof GO_STIMULI[0]) | null>(null);
  const [feedback, setFeedback]     = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft]     = useState(45);

  // BUG FIX 3: Use refs to avoid stale closures in showNext
  const phaseRef        = useRef<GamePhase>('intro');
  const roundRef        = useRef(0);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const stimRef         = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const nextRef         = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const isProcessingRef = useRef(false);
  const sessionStartTime = useRef(0);
  const rtAllMs = useRef<number[]>([]);
  const rtCorrectMs = useRef<number[]>([]);
  const lastStimTime = useRef<number>(0);

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (stimRef.current)  { clearTimeout(stimRef.current);   stimRef.current  = null; }
    if (nextRef.current)  { clearTimeout(nextRef.current);   nextRef.current  = null; }
  }, []);

  useEffect(() => () => { clearAllTimers(); }, [clearAllTimers]);

  const showNext = useCallback((roundNum: number) => {
    // BUG FIX 3: Always check phase ref — never continue after results
    if (phaseRef.current !== 'playing') return;
    if (roundNum >= TOTAL_ROUNDS) {
      finishSession(score, misses, falseAlarms);
      return;
    }
    isProcessingRef.current = false;
    const isNoGo = Math.random() < 0.4;
    const pool = isNoGo ? NOGO_STIMULI : GO_STIMULI;
    const stim = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(stim);
    setFeedback(null);
    lastStimTime.current = Date.now();

    // Auto-expire after STIMULUS_MS
    stimRef.current = setTimeout(() => {
      setCurrent(prev => {
        if (prev?.tap) {
          setMisses(m => m + 1); // missed GO
          rtAllMs.current.push(STIMULUS_MS); // count as slow RT for stability
        }
        return null;
      });
      const nextRound = roundNum + 1;
      roundRef.current = nextRound;
      setRound(nextRound);
      nextRef.current = setTimeout(() => showNext(nextRound), GAP_MS);
    }, STIMULUS_MS);
  }, [GO_STIMULI, NOGO_STIMULI, score, misses, falseAlarms, clearAllTimers]);

  const finishSession = useCallback(async (finalScore: number, finalMisses: number, finalFalseAlarms: number) => {
    clearAllTimers();
    phaseRef.current = 'results';
    setPhase('results');

    const duration = (Date.now() - sessionStartTime.current) / 1000;
    const totalPossible = TOTAL_ROUNDS;
    const correct = totalPossible - finalMisses - finalFalseAlarms;
    const acc = totalPossible > 0 ? correct / totalPossible : 0;
    const avgRt = rtCorrectMs.current.length > 0 
      ? rtCorrectMs.current.reduce((a, b) => a + b, 0) / rtCorrectMs.current.length 
      : 800;

    const session: RawGameSession = {
      sessionId: `${Date.now()}-impulse-control`,
      gameId: 'impulse-control',
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      events: [],
      rtAllMs: rtAllMs.current,
      rtCorrectMs: rtCorrectMs.current,
      score: finalScore,
      accuracy: acc,
      avgReactionTime: avgRt,
      maxStreak: correct
    };

    try {
      await Storage.saveSession(session);
      await Storage.saveGameScore('impulse-control', finalScore);

      const currentProfile = await Storage.getCognitiveProfile() || DEFAULT_COGNITIVE_PROFILE;
      const updatedProfile = AnalysisEngine.updateProfile(currentProfile, session);
      await Storage.saveCognitiveProfile(updatedProfile);

      const newMentraScore = AnalysisEngine.calculateMentraScore(updatedProfile);
      await Storage.saveGlobalScore(newMentraScore);
      
      await Streak.recordSession();
      Logger.log('ImpulseControl: Synced', newMentraScore);
    } catch (e) {
      Logger.error('ImpulseControl sync error', e);
    }
  }, [clearAllTimers]);


  const startGame = useCallback(() => {
    clearAllTimers();
    phaseRef.current = 'playing';
    roundRef.current = 0;
    isProcessingRef.current = false;
    setPhase('playing');
    setScore(0); setMisses(0); setFalseAlarms(0); setRound(0);
    setTimeLeft(45); setCurrent(null); setFeedback(null);
    sessionStartTime.current = Date.now();
    rtAllMs.current = [];
    rtCorrectMs.current = [];
    lastStimTime.current = 0;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          finishSession(score, misses, falseAlarms);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    nextRef.current = setTimeout(() => showNext(0), 500);
  }, [showNext, clearAllTimers, score, misses, falseAlarms, finishSession]);

  const handleTap = useCallback(() => {
    // BUG FIX: Prevent double-tap processing
    if (isProcessingRef.current || !current || phaseRef.current !== 'playing') return;
    isProcessingRef.current = true;

    // Reset auto-expire
    if (stimRef.current) { clearTimeout(stimRef.current); stimRef.current = null; }

    const rt = Date.now() - lastStimTime.current;

    if (current.tap) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setScore(s => s + 10);
      setFeedback('correct');
      rtCorrectMs.current.push(rt);
      rtAllMs.current.push(rt);
      scale.value = withSequence(withSpring(1.12), withSpring(1));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setFalseAlarms(f => f + 1);
      setFeedback('wrong');
      rtAllMs.current.push(rt);
      scale.value = withSequence(withTiming(0.92, { duration: 80 }), withSpring(1));
    }

    setCurrent(null);
    const nextRound = roundRef.current + 1;
    roundRef.current = nextRound;
    setRound(nextRound);
    nextRef.current = setTimeout(() => showNext(nextRound), GAP_MS);
  }, [current, showNext, scale]);

  const inhibitionScore = Math.max(0, 100 - falseAlarms * 15 - misses * 5);
  const grade = inhibitionScore >= 85
    ? { label: t('eliteControl'),  color: Colors.mentra.success }
    : inhibitionScore >= 65
    ? { label: t('goodControl'),   color: '#6366F1' }
    : { label: t('keepTraining'),  color: '#F59E0B' };

  if (phase === 'intro') return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.closeBtn}><X size={22} color={Colors.mentra.text} /></Pressable>
      <Animated.View entering={FadeIn.springify()} style={styles.introBox}>
        <View style={styles.introIconBox}><Text style={{ fontSize: 48 }}>🛑</Text></View>
        <Text style={styles.introTitle}>{t('gameImpulseControl')}</Text>
        
        <View style={{ width: '100%', gap: 12, marginVertical: 20 }}>
          <View style={styles.instructionsBox}>
            <View style={styles.sectionHeader}>
              <Play size={14} color={Colors.mentra.brandPrimary} />
              <ThemedText style={styles.sectionLabel}>{t('howToPlay')}</ThemedText>
            </View>
            <ThemedText style={styles.cardDesc}>
              {t('icIntroHow') || 'Tap brain stimuli, ignore social media bait.'}
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
              {t('icIntroWhat')}
            </ThemedText>
            <ThemedText style={styles.scienceWhy}>
              {t('icIntroWhy')}
            </ThemedText>
          </View>
        </View>

        <Pressable onPress={() => setShowWarmup(true)} style={styles.startBtn}>
          <Text style={styles.startBtnText}>{t('exploreStart')}</Text>
        </Pressable>

        <NeuroActivationWarmup 
            visible={showWarmup} 
            gameTitle={t('gameImpulseControl').toUpperCase()}
            tutorialText={t('gameImpulseControlTutorial')}
            onComplete={() => {
                setShowWarmup(false);
                startGame();
            }} 
        />
      </Animated.View>
    </View>
  );

  if (phase === 'results') return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View entering={FadeIn.springify()} style={styles.resultsBox}>
        <Text style={styles.resultsEmoji}>🧠</Text>
        <Text style={styles.resultsTitle}>{t('sessionCompleteText')}</Text>
        <View style={[styles.gradeBox, { borderColor: grade.color + '40' }]}>
          <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label}</Text>
          <Text style={styles.inhibScore}>{inhibitionScore}<Text style={{ fontSize: 18 }}>/100</Text></Text>
          <Text style={styles.inhibLabel}>{t('mentraIndex')}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statVal}>{score}</Text><Text style={styles.statLabel}>{t('scoreLabel')}</Text></View>
          <View style={styles.statItem}><Text style={[styles.statVal, { color: Colors.mentra.success }]}>{TOTAL_ROUNDS - misses - falseAlarms}</Text><Text style={styles.statLabel}>{t('correctLabel')}</Text></View>
          <View style={styles.statItem}><Text style={[styles.statVal, { color: Colors.mentra.danger }]}>{falseAlarms}</Text><Text style={styles.statLabel}>{t('baitTakenText')}</Text></View>
        </View>
        <Text style={styles.resultsTip}>
          {falseAlarms > 3
            ? t('icResultsTipLow')
            : t('icResultsTipHigh')}
        </Text>
        <Pressable onPress={startGame} style={styles.startBtn}><Text style={styles.startBtnText}>{t('playAgain')}</Text></Pressable>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backLink}><Text style={styles.backLinkText}>← {t('back')}</Text></Pressable>
      </Animated.View>
    </View>
  );

  // ── Playing ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={styles.gameHeader}>
        <Pressable onPress={() => { clearAllTimers(); router.canGoBack() ? router.back() : router.replace('/'); }} style={styles.closeBtn}>
          <X size={20} color={Colors.mentra.text} />
        </Pressable>
        <View style={styles.timerBox}>
          <Text style={[styles.timerText, timeLeft <= 10 && { color: Colors.mentra.danger }]}>{timeLeft}s</Text>
        </View>
        <View style={styles.scoreBadge}><Text style={styles.scoreText}>{score}</Text></View>
      </View>

      <Text style={styles.instruction}>
        {current?.tap === false ? t('dontTap') : current?.tap ? t('tapIt') : ''}
      </Text>

      <Pressable onPress={handleTap} style={styles.stimArea}>
        {current && (
          <Animated.View key={`${round}-${current.label}`} entering={ZoomIn.duration(160)}>
            <Animated.View style={[styles.stimCard, { backgroundColor: current.bg, borderColor: current.color + '40' }, animStyle]}>
              <Text style={styles.stimEmoji}>{current.emoji}</Text>
              <Text style={[styles.stimLabel, { color: current.color }]}>{current.label}</Text>
              {!current.tap && (
                <View style={styles.stimBaitTag}><Text style={styles.stimBaitText}>{t('socialMediaTag')}</Text></View>
              )}
            </Animated.View>
          </Animated.View>
        )}
        {feedback === 'correct' && (
          <Animated.View key="fb-correct" entering={FadeIn} exiting={FadeOut} style={styles.feedbackPos}>
            <Text style={[styles.feedbackText, { color: Colors.mentra.success }]}>+10 ✓</Text>
          </Animated.View>
        )}
        {feedback === 'wrong' && (
          <Animated.View key="fb-wrong" entering={FadeIn} exiting={FadeOut} style={styles.feedbackPos}>
            <Text style={[styles.feedbackText, { color: Colors.mentra.danger }]}>{t('baitLabel')} ✗</Text>
          </Animated.View>
        )}
      </Pressable>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(round / TOTAL_ROUNDS) * 100}%` }]} />
      </View>
      <Text style={styles.roundText}>{round}/{TOTAL_ROUNDS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  closeBtn: { padding: 10, backgroundColor: Colors.mentra.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.mentra.border },
  gameHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  timerBox: { backgroundColor: Colors.mentra.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.mentra.border },
  timerText: { fontSize: 16, fontWeight: '800', color: Colors.mentra.text },
  scoreBadge: { backgroundColor: Colors.mentra.brandPrimary + '18', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  scoreText: { fontSize: 16, fontWeight: '800', color: Colors.mentra.brandPrimary },
  instruction: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.mentra.text, marginVertical: 8, paddingHorizontal: 20, minHeight: 28 },
  stimArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stimCard: {
    width: width * 0.65, padding: 32, borderRadius: 28, alignItems: 'center', gap: 10, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
  },
  stimEmoji: { fontSize: 56 },
  stimLabel: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  stimBaitTag: { backgroundColor: '#EF444420', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  stimBaitText: { fontSize: 10, fontWeight: '800', color: Colors.mentra.danger, letterSpacing: 1 },
  feedbackPos: { position: 'absolute', top: '15%' },
  feedbackText: { fontSize: 26, fontWeight: '900' },
  progressBar: { height: 4, backgroundColor: Colors.mentra.border, marginHorizontal: 20, borderRadius: 2, marginBottom: 6 },
  progressFill: { height: 4, backgroundColor: Colors.mentra.brandPrimary, borderRadius: 2 },
  roundText: { textAlign: 'center', fontSize: 12, color: Colors.mentra.textDim, marginBottom: 16 },
  introBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 0 },
  introIconBox: { width: 96, height: 96, borderRadius: 28, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
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
  startBtn: { backgroundColor: Colors.mentra.brandPrimary, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, marginTop: 8, shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, width: '100%', alignItems: 'center' },
  startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  resultsBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  resultsEmoji: { fontSize: 60 },
  resultsTitle: { fontSize: 28, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -0.5 },
  gradeBox: { width: '100%', borderRadius: 20, borderWidth: 2, padding: 20, alignItems: 'center', gap: 4, backgroundColor: Colors.mentra.surface },
  gradeLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  inhibScore: { fontSize: 52, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -2 },
  inhibLabel: { fontSize: 12, color: Colors.mentra.textDim },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1, alignItems: 'center', backgroundColor: Colors.mentra.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.mentra.border },
  statVal: { fontSize: 24, fontWeight: '900', color: Colors.mentra.text },
  statLabel: { fontSize: 11, color: Colors.mentra.textDim, marginTop: 2 },
  resultsTip: { fontSize: 13, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 20 },
  backLink: { paddingVertical: 8 },
  backLinkText: { color: Colors.mentra.textDim, fontSize: 14, fontWeight: '600' },
});
