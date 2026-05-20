import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play, Target, Wind, BookOpen, BarChart2,
  Flame, TrendingUp, ChevronRight, Zap, Brain, Activity, Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Storage } from '@/services/storage';
import { getPremiumStatus } from '@/services/purchases';
import { Streak, StreakData } from '@/services/streak';
import { NotificationService } from '@/services/notifications';
import { I18n } from '@/services/i18n';

const { width } = Dimensions.get('window');

// ─── Growth Edge Card ─────────────────────────────────────────────────────────

function GrowthEdgeCard({ weakness }: { weakness: string }) {
  const C = useMentraTheme();
  const s = makeStyles(C);

  const actionLabels: Record<string, string> = {
    focus: I18n.t('actionFocus'),
    memory: I18n.t('actionMemory'),
    logic: I18n.t('actionLogic'),
    speed: I18n.t('actionSpeed'),
    resilience: I18n.t('actionResilience'),
  };
  const descriptions: Record<string, string> = {
    focus: I18n.t('descFocus'),
    memory: I18n.t('descMemory'),
    logic: I18n.t('descLogic'),
    speed: I18n.t('descSpeed'),
    resilience: I18n.t('descResilience'),
  };
  const action = actionLabels[weakness] || I18n.t('actionStartTraining');
  const desc = descriptions[weakness] || I18n.t('descDefault');

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={s.weaknessCard}>
      <View style={s.weaknessHeader}>
        <View style={[s.weaknessPill, { backgroundColor: C.brandPrimary + '15' }]}>
          <Text style={[s.weaknessPillText, { color: C.brandPrimary }]}>{I18n.t('todaysFocusArea')}</Text>
        </View>
        <Activity size={18} color={C.brandPrimary} />
      </View>
      <Text style={[s.weaknessValue, { color: C.text }]}>{weakness.charAt(0).toUpperCase() + weakness.slice(1)}</Text>
      <Text style={[s.weaknessDesc, { color: C.textDim }]}>{desc}</Text>
      <Pressable onPress={() => router.push('/(tabs)/training' as any)} style={[s.weaknessBtn, { backgroundColor: C.brandPrimary }]}>
        <Text style={s.weaknessBtnText}>{action} →</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Mentra Score Card ────────────────────────────────────────────────────────

function MentraScoreCard({ score, streak }: { score: number; streak: number }) {
  const C = useMentraTheme();
  const s = makeStyles(C);
  const percentage = Math.min(score, 100);
  const scoreLabel =
    score >= 85 ? I18n.t('scoreElite') :
    score >= 70 ? I18n.t('scoreStrong') :
    score >= 50 ? I18n.t('scoreBuilding') :
    I18n.t('scoreStarting');
  const tier = score >= 85 ? '🏆' : score >= 70 ? '⚡' : score >= 50 ? '🌱' : '🔰';

  return (
    <Animated.View entering={FadeInUp.springify()} style={s.scoreCard}>
      <LinearGradient
        colors={C.isDark ? ['#0F2820', '#1A3D2E'] : ['#194031', '#20503D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
      />
      {/* Subtle top highlight */}
      <View style={s.scoreHighlight} />

      <View style={s.scoreLeft}>
        <Text style={s.scoreLabel}>{I18n.t('mentraScoreLabel')}</Text>
        <Text style={s.scoreNumber}>{score}</Text>
        <Text style={s.scoreStatus}>{tier} {scoreLabel}</Text>
        <View style={s.streakRow}>
          <Flame size={13} color="#FDE68A" />
          <Text style={s.streakText}>{I18n.t('dayStreakFormatter', { streak })}</Text>
        </View>
      </View>
      <View style={s.scoreRight}>
        <View style={s.circleOuter}>
          <View style={[s.circleInner, { opacity: Math.max(0.15, percentage / 100) }]} />
          <Text style={s.circleText}>{percentage}</Text>
          <Text style={s.circlePct}>%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Analytics Row ────────────────────────────────────────────────────────────

function AnalyticsRow() {
  const C = useMentraTheme();
  const s = makeStyles(C);
  const stats = [
    { label: I18n.t('statFocusSessions'), value: '12', icon: <Target size={14} color={C.brandPrimary} /> },
    { label: I18n.t('statAvgAccuracy'),   value: '84%', icon: <TrendingUp size={14} color={C.brandPrimary} /> },
    { label: I18n.t('statBestMood'),      value: '😊', icon: <Zap size={14} color={C.warning} /> },
  ];
  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={s.analyticsRow}>
      {stats.map(stat => (
        <View key={stat.label} style={s.analyticsCard}>
          {stat.icon}
          <Text style={[s.analyticsValue, { color: C.text }]}>{stat.value}</Text>
          <Text style={[s.analyticsLabel, { color: C.textDim }]}>{stat.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickAction({ icon, label, accent, route }: { icon: React.ReactNode; label: string; accent: string; route: string }) {
  const C = useMentraTheme();
  const s = makeStyles(C);
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(route as any); }}
      style={({ pressed }) => [s.qaBtn, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={[s.qaIcon, { backgroundColor: accent + '18' }]}>{icon}</View>
      <Text style={[s.qaLabel, { color: C.text }]} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const C = useMentraTheme();
  const s = makeStyles(C);

  const [userName, setUserName]     = useState('there');
  const [streakData, setStreakData] = useState<StreakData>({ current: 0, longest: 0, lastPlayed: null, playedToday: false, isAtRisk: false });
  const [mentraScore, setMentraScore] = useState(72);   // ✅ pure ASCII — Cyrillic bug giderildi
  const [isPro, setIsPro]           = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const up = await Storage.getUserProfile();
        if (up?.name) setUserName(up.name.split(' ')[0]);
        if (up?.isPro) setIsPro(true);
        const sd = await Streak.get();
        setStreakData(sd);
        NotificationService.scheduleDailyStreakReminder();
      };
      load();
      getPremiumStatus().then(setIsPro);
    }, [])
  );

  const hour = new Date().getHours();
  const greetingWord = hour < 12 ? I18n.t('homeGoodMorning') : hour < 18 ? I18n.t('homeGoodAfternoon') : I18n.t('homeGoodEvening');
  const greetingMotivation = hour < 12 ? I18n.t('homeMotivMorning') : hour < 18 ? I18n.t('homeMotivAfternoon') : I18n.t('homeMotivEvening');

  const quickActions = [
    { icon: <Play size={20} color={C.brandPrimary} />,  label: I18n.t('quickActionDaily'),   accent: C.brandPrimary, route: '/training/daily-session' },
    { icon: <Target size={20} color="#6366F1" />,        label: I18n.t('quickActionGrid'),    accent: '#6366F1',       route: '/game/grid-focus' },
    { icon: <Wind size={20} color="#10B981" />,          label: I18n.t('quickActionBreathe'), accent: '#10B981',       route: '/game/dopamine-reset' },
    { icon: <BookOpen size={20} color="#F59E0B" />,      label: I18n.t('quickActionJournal'), accent: '#F59E0B',       route: '/(tabs)/journal' },
  ];

  const routines = [
    { title: I18n.t('routineMorning') ?? 'Morning Reset', icon: <Zap size={20} color="#F59E0B" />,  bg: C.isDark ? '#3D2E0A' : '#FEF3C7', route: '/training/daily-session' },
    { title: I18n.t('routineFocus')   ?? 'Deep Focus',    icon: <Brain size={20} color="#6366F1" />, bg: C.isDark ? '#1E1B3A' : '#EDE9FE', route: '/training/daily-session' },
    { title: I18n.t('routineSleep')   ?? 'Sleep Prep',    icon: <Wind size={20} color="#3B82F6" />,  bg: C.isDark ? '#0F1F3D' : '#DBEAFE', route: '/training/daily-session' },
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar style={C.statusBar} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Greeting ── */}
        <Animated.View entering={FadeInUp.springify()} style={s.greetingRow}>
          <View style={s.greetingText}>
            <Text style={[s.greeting, { color: C.text }]}>{greetingWord}, {userName} 👋</Text>
            <Text style={[s.greetingSub, { color: C.textDim }]}>{greetingMotivation}</Text>
          </View>
          {!isPro && (
            <Pressable
              onPress={() => router.push('/paywall/onboarding' as any)}
              style={[s.upgradePill, { backgroundColor: C.brandPrimary + '20', borderColor: C.brandPrimary + '40' }]}
            >
              <Zap size={12} color={C.brandPrimary} />
              <Text style={[s.upgradePillText, { color: C.brandPrimary }]}>{I18n.t('goPro')}</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* ── Score Card ── */}
        <MentraScoreCard score={mentraScore} streak={streakData.current} />

        {/* ── Growth Edge ── */}
        <GrowthEdgeCard weakness="focus" />

        {/* ── Quick Actions ── */}
        <Text style={[s.sectionTitle, { color: C.textDim }]}>{I18n.t('quickActionsTitle') ?? 'Quick Actions'}</Text>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.qaRow}>
          {quickActions.map(qa => (
            <QuickAction key={qa.route} {...qa} />
          ))}
        </Animated.View>

        {/* ── Active Program ── */}
        <Text style={[s.sectionTitle, { color: C.textDim }]}>{I18n.t('activeProgramTitle')}</Text>
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Pressable
            style={[s.highlightCard, { backgroundColor: C.brandPrimary }]}
            onPress={() => router.push('/game/grid-focus' as any)}
          >
            <View style={s.highlightIcon}>
              <Target size={28} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.highlightTag, { color: C.brandSecondary }]}>{I18n.t('programDayTracker', { day: '1' })}</Text>
              <Text style={s.highlightTitle}>{I18n.t('programTitle')}</Text>
              <Text style={s.highlightDesc}>{I18n.t('programSubtitle')}</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
          </Pressable>
        </Animated.View>

        {/* ── Analytics ── */}
        <Text style={[s.sectionTitle, { color: C.textDim }]}>{I18n.t('thisWeekTitle')}</Text>
        <AnalyticsRow />

        {/* ── Daily Insight ── */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={[s.insightCard, { backgroundColor: C.brandPrimary + '10', borderColor: C.brandPrimary + '20' }]}>
          <View style={s.insightHeader}>
            <Sparkles size={13} color={C.brandPrimary} />
            <Text style={[s.insightLabel, { color: C.brandPrimary }]}>{I18n.t('dailyInsightLabel') ?? 'DAILY INSIGHT'}</Text>
          </View>
          <Text style={[s.insightText, { color: C.text }]}>{I18n.t('dailyInsightQuote')}</Text>
        </Animated.View>

        {/* ── Upsell banner ── */}
        {!isPro && (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={[s.upsellBanner, { backgroundColor: C.surface, borderColor: C.border }]}>
            <BarChart2 size={20} color={C.brandPrimary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.upsellTitle, { color: C.text }]}>{I18n.t('paywallHeroTitle')}</Text>
              <Text style={[s.upsellSub, { color: C.textDim }]}>{I18n.t('paywallFeat4')}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/paywall/onboarding' as any)}
              style={[s.upsellBtn, { backgroundColor: C.brandPrimary }]}
            >
              <Text style={s.upsellBtnText}>{I18n.t('exploreTryFree')}</Text>
            </Pressable>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}

// ─── Dynamic Styles ───────────────────────────────────────────────────────────

function makeStyles(C: ReturnType<typeof import('@/hooks/useMentraTheme').useMentraTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },

    greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8, marginBottom: 20 },
    greetingText: { flex: 1, paddingRight: 8 },
    greeting: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
    greetingSub: { fontSize: 14, marginTop: 2 },
    upgradePill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, flexShrink: 0 },
    upgradePillText: { fontSize: 12, fontWeight: '700' },

    // Score card
    scoreCard: { borderRadius: 24, padding: 22, flexDirection: 'row', marginBottom: 24, overflow: 'hidden', minHeight: 130 },
    scoreHighlight: { position: 'absolute', top: 0, left: 20, right: 20, height: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 1 },
    scoreLeft: { flex: 1, justifyContent: 'center', gap: 4 },
    scoreLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase' },
    scoreNumber: { fontSize: 56, fontWeight: '900', color: '#FFF', letterSpacing: -3, lineHeight: 60 },
    scoreStatus: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
    streakText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
    scoreRight: { justifyContent: 'center', alignItems: 'center', paddingLeft: 16 },
    circleOuter: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
    circleInner: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.15)' },
    circleText: { fontSize: 22, fontWeight: '900', color: '#FFF', zIndex: 1, lineHeight: 26 },
    circlePct: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', zIndex: 1 },

    // Weakness / Growth Edge
    weaknessCard: { backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.brandPrimary + '40', marginBottom: 24, marginHorizontal: 4 },
    weaknessHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    weaknessPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    weaknessPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    weaknessValue: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
    weaknessDesc: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
    weaknessBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    weaknessBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

    // Quick Actions
    sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionLink: { fontSize: 13, fontWeight: '600' },
    qaRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    qaBtn: { flex: 1, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center', gap: 8 },
    qaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    qaLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

    // Highlight
    highlightCard: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
    highlightIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    highlightTag: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
    highlightTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', marginBottom: 2 },
    highlightDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },

    // Analytics
    analyticsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    analyticsCard: { flex: 1, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12, gap: 4 },
    analyticsValue: { fontSize: 18, fontWeight: '800' },
    analyticsLabel: { fontSize: 11, lineHeight: 14 },

    // Routines strip
    routinesStrip: { gap: 10, paddingBottom: 4, marginBottom: 20 },
    routineChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    routineChipText: { fontSize: 13, fontWeight: '700' },

    // Insight
    insightCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
    insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    insightLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
    insightText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },

    // Upsell
    upsellBanner: { borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 4 },
    upsellTitle: { fontSize: 14, fontWeight: '700' },
    upsellSub: { fontSize: 12 },
    upsellBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    upsellBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  });
}
