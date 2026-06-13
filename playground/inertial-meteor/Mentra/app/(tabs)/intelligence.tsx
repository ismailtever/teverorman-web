import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router } from 'expo-router';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import Animated, {
  FadeInUp, FadeInDown,
  useSharedValue, useAnimatedProps, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import {
  BrainCircuit, RotateCcw, Target, Shield, Zap, Activity,
  ChevronRight, TrendingUp, TrendingDown, AlertCircle, Gauge,
  Sparkles, Award, Flame, Trophy, Clock, BarChart2, Brain,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { useI18n } from '@/services/i18n';
import { Storage } from '@/services/storage';
import { Streak, StreakData } from '@/services/streak';
import { AnalysisEngine } from '@/services/engine/AnalysisEngine';
import { CognitiveProfile, RawGameSession } from '@/services/engine/types';
import { EmptyState } from '@/components/EmptyState';
import { Card, SanctuaryCard } from '@/components/ui/Cards';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';
import { useUserStore } from '@/src/core/store/useUserStore';

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width, 600) * 0.78;
const RADIUS = CHART_SIZE * 0.34;
const CENTER = CHART_SIZE / 2;
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

// ─── Scale Pressable ──────────────────────────────────────────────────────
function ScalePressable({ onPress, style, children, disabled }: { onPress: () => void; style?: any; children: React.ReactNode; disabled?: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { if (!disabled) scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { if (!disabled) scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[animStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}

type ScoreKey = 'focus' | 'memory' | 'logic' | 'speed' | 'resilience' | 'stability';

function profileToScores(p: CognitiveProfile): Record<ScoreKey, number> {
  return {
    focus:      p.focus,
    memory:     p.memory,
    logic:      p.problem_solving,
    speed:      p.speed,
    resilience: p.flexibility,
    stability:  p.stabilityOffset,
  };
}



// --- Components ---
function WeeklyChart({ days, scores, t }: { days: string[], scores: number[], t: any }) {
  const validScores = scores.filter(s => s > 0);
  const isEmpty = validScores.length < 2;
  const max = Math.max(...scores, 1);
  const today = new Date().getDay();
  const mapped = [1,2,3,4,5,6,0]; // Mon-Sun

  return (
    <Animated.View entering={FadeInDown.delay(300).springify()}>
      <Card style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{t('actWeekTitle')}</ThemedText>
          {!isEmpty && <Text style={styles.sectionMeta}>{t('actAvgScore').replace('%{score}', Math.round(validScores.reduce((a,b)=>a+b,0)/validScores.length).toString())}</Text>}
        </View>
      {isEmpty ? (
        <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.sectionMeta}>{t('chartEmptyState')}</Text>
        </View>
      ) : (
        <View style={styles.chartRow}>
          {days.map((day, i) => {
            const score = scores[i];
            const barH = score > 0 ? Math.max((score / max) * 100, 8) : 4;
            const isToday = mapped[i] === today;
            const isActive = score > 0;
            return (
              <View key={i} style={styles.barCol}>
                <Text style={[styles.barScore, !isActive && { opacity: 0 }]}>{score}</Text>
                <View style={styles.barBg}>
                  <View style={[
                    styles.barFill,
                    { height: barH, backgroundColor: isToday ? Colors.mentra.brandPrimary : isActive ? Colors.mentra.brandSecondary : Colors.mentra.border }
                  ]} />
                </View>
                <Text style={[styles.barDay, isToday && { color: Colors.mentra.brandPrimary, fontWeight: '800' }]}>{day}</Text>
              </View>
            );
          })}
        </View>
        )}
      </Card>
    </Animated.View>
  );
}

function AnalystReport({ t }: { t: any }) {
  return (
    <Animated.View entering={FadeInDown.delay(250).springify()}>
      <Card variant="outline" style={styles.analystCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.analystBadge}>
            <Sparkles size={11} color="#FFF" />
            <Text style={styles.analystBadgeText}>{t('analystPro')}</Text>
          </View>
          <Text style={styles.sectionMeta}>{t('latestUpdate')}</Text>
        </View>
        <Text style={styles.analystTitle}>{t('scientistObservations')}</Text>

        <View style={styles.observationRow}>
          <View style={[styles.obsIcon, { backgroundColor: Colors.mentra.domains.focus.bg }]}><Shield size={14} color={Colors.mentra.domains.focus.color} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.obsLabel}>{t('prefrontalInhibition')}</Text>
            <Text style={styles.obsText}>{t('prefrontalInhibitionDesc')}</Text>
          </View>
        </View>
        <View style={styles.observationRow}>
          <View style={[styles.obsIcon, { backgroundColor: Colors.mentra.domains.resilience.bg }]}><Activity size={14} color={Colors.mentra.domains.resilience.color} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.obsLabel}>{t('dopamineBaseline')}</Text>
            <Text style={styles.obsText}>{t('dopamineBaselineDesc')}</Text>
          </View>
        </View>
        <View style={styles.analystFooter}>
          <Text style={styles.analystFooterText}>{t('deepProfilingComplete')}</Text>
        </View>
      </Card>
    </Animated.View>
  );
}

export default function IntelligenceScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();

  const DIMENSIONS = React.useMemo(() => [
    { label: t('focus'),      key: 'focus'      as ScoreKey, icon: Target,      color: Colors.mentra.domains.focus.color,      bg: Colors.mentra.domains.focus.bg,      emoji: '🎯', desc: t('descFocus') },
    { label: t('memory'),     key: 'memory'     as ScoreKey, icon: BrainCircuit,color: Colors.mentra.domains.memory.color,     bg: Colors.mentra.domains.memory.bg,     emoji: '🧠', desc: t('descMemory') },
    { label: t('logic'),      key: 'logic'      as ScoreKey, icon: Activity,    color: Colors.mentra.domains.productivity.color, bg: Colors.mentra.domains.productivity.bg, emoji: '💡', desc: t('descLogic') },
    { label: t('speed'),      key: 'speed'      as ScoreKey, icon: Zap,         color: Colors.mentra.domains.speed.color,      bg: Colors.mentra.domains.speed.bg,      emoji: '⚡', desc: t('descSpeed') },
    { label: t('resilience'), key: 'resilience' as ScoreKey, icon: Shield,      color: Colors.mentra.domains.resilience.color, bg: Colors.mentra.domains.resilience.bg, emoji: '🛡️', desc: t('descResilience') },
    { label: t('stability'),  key: 'stability'  as ScoreKey, icon: Gauge,       color: Colors.mentra.domains.stability.color,  bg: Colors.mentra.domains.stability.bg, emoji: '⚖️', desc: t('descStability') },
  ], [lang]);

  const animFocus      = useSharedValue(0);
  const animMemory     = useSharedValue(0);
  const animLogic      = useSharedValue(0);
  const animSpeed      = useSharedValue(0);
  const animResilience = useSharedValue(0);
  const animStability  = useSharedValue(0);

  const animMap: Record<ScoreKey, any> = {
    focus: animFocus, memory: animMemory, logic: animLogic,
    speed: animSpeed, resilience: animResilience, stability: animStability,
  };

  const animateChartTo = useCallback((s: Record<ScoreKey, number>) => {
    (Object.keys(s) as ScoreKey[]).forEach(k => {
      animMap[k].value = withSpring(s[k] / 100, { damping: 12 });
    });
  }, []);

  const { cognitiveProfile, recentSessions, streakData, hydrate } = useUserStore();

  const scores = React.useMemo(() => cognitiveProfile ? profileToScores(cognitiveProfile) : null, [cognitiveProfile]);
  
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const weekTrend = React.useMemo(() => {
    if (!recentSessions || recentSessions.length === 0) return null;
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeek = recentSessions.filter(s => (now - new Date(s.timestamp).getTime()) < weekMs);
    const lastWeek = recentSessions.filter(s => {
      const age = now - new Date(s.timestamp).getTime();
      return age >= weekMs && age < 2 * weekMs;
    });
    if (thisWeek.length === 0 || lastWeek.length === 0) return null;
    const avg = (arr: RawGameSession[]) => arr.reduce((sum, s) => sum + s.score, 0) / arr.length;
    return Math.round(avg(thisWeek) - avg(lastWeek));
  }, [recentSessions]);

  const weekScores = React.useMemo(() => {
    if (!recentSessions || recentSessions.length === 0) return [0, 0, 0, 0, 0, 0, 0];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const sums = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    recentSessions.forEach(s => {
      const age = now - new Date(s.timestamp).getTime();
      if (age < 7 * dayMs) {
        const idx = (new Date(s.timestamp).getDay() + 6) % 7;
        sums[idx] += s.score;
        counts[idx]++;
      }
    });
    return sums.map((sum, i) => counts[i] > 0 ? Math.round(sum / counts[i]) : 0);
  }, [recentSessions]);

  React.useEffect(() => {
    if (scores && !isAnalyzing) {
      animateChartTo(scores);
    }
  }, [scores, isAnalyzing, animateChartTo]);

  const loadData = useCallback(async () => {
    try {
      await hydrate();
    } finally {
      setIsLoading(false);
    }
  }, [hydrate]);

  useFocusEffect(React.useCallback(() => { void loadData(); }, [loadData]));

  const triggerRecalibration = async () => {
    if (isAnalyzing) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsAnalyzing(true);
    animateChartTo({ focus: 5, memory: 5, logic: 5, speed: 5, resilience: 5, stability: 5 });
    await loadData();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsAnalyzing(false);
  };

  const getCoords = (val: number, idx: number, total: number) => {
    const angle = (Math.PI * 2 * idx) / total - Math.PI / 2;
    return { x: CENTER + RADIUS * val * Math.cos(angle), y: CENTER + RADIUS * val * Math.sin(angle) };
  };

  const animatedProps = useAnimatedProps(() => {
    const keys: ScoreKey[] = ['focus', 'memory', 'logic', 'speed', 'resilience', 'stability'];
    const total = keys.length;
    const pts = keys.map((key, i) => {
      const shared = animMap[key];
      const v = shared.value ?? 0;
      const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
      const x = CENTER + RADIUS * v * Math.cos(angle);
      const y = CENTER + RADIUS * v * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    return { points: pts };
  });

  const scoreValues = scores ? Object.values(scores) : [];
  const avgScore = scoreValues.length > 0 ? Math.round(
    scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length,
  ) : 0;

  const weakestEntry = scores ? (Object.entries(scores) as [ScoreKey, number][])
    .reduce((a, b) => (a[1] < b[1] ? a : b)) : ['focus', 0] as [ScoreKey, number];
  const weakDim = DIMENSIONS.find(d => d.key === weakestEntry[0]) ?? DIMENSIONS[0];

  const WEEK_DAYS = React.useMemo(() => [t('calM'), t('calT1'), t('calW'), t('calT2'), t('calF'), t('calS1'), t('calS2')], [lang]);

  const [streak, setStreak] = useState<StreakData | { current: number; longest: number; lastPlayed: string | null; playedToday: boolean; isAtRisk: boolean }>({ current: 0, longest: 0, lastPlayed: null, playedToday: false, isAtRisk: false });
  useFocusEffect(useCallback(() => {
    if (streakData) setStreak(streakData);
  }, [streakData]));

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.mentra.brandPrimary} />
      </View>
    );
  }

  if (!scores) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{t('cognitiveMapTitle')}</Text>
              <Text style={styles.headerSub}>{t('diagnosticsSub')}</Text>
            </View>
        </View>
        <EmptyState
          icon={<Brain size={48} color={Colors.mentra.brandPrimary} />}
          title={t('diagnosticsEmptyTitle')}
          description={t('diagnosticsEmptyBody')}
          actionLabel={t('diagnosticsEmptyAction')}
          onAction={() => router.replace('/(tabs)/' as any)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('intelligenceHeaderTitle')}</Text>
          <Text style={styles.headerSub}>{t('intelligenceHeaderSubtitle')}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerBadge}>
            <Flame size={14} color={Colors.mentra.brandPrimary} />
            <Text style={styles.headerBadgeText}>{streak.current}</Text>
          </View>
          <ScalePressable onPress={triggerRecalibration} disabled={isAnalyzing} style={styles.recalcBtn}>
            <RotateCcw size={15} color={isAnalyzing ? Colors.mentra.muted : Colors.mentra.brandPrimary} />
          </ScalePressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <SanctuaryCard gradient={Colors.mentra.gradients.primary as any} glowColor="rgba(147,242,242,0.3)" style={styles.scoreSummary}>
            <View>
              <Text style={styles.scoreSumLabel}>{t('performanceIndexLabel')}</Text>
              <Text style={styles.scoreSumVal}>{avgScore}<Text style={styles.scoreSumMax}>{t('scoreOutOf100')}</Text></Text>
            </View>
            {weekTrend !== null && (
              <View style={styles.scoreSumRight}>
                {weekTrend >= 0 ? <TrendingUp size={20} color={Colors.mentra.brandSecondary} /> : <TrendingDown size={20} color={Colors.mentra.danger} />}
                <Text style={[styles.scoreSumTrend, weekTrend < 0 && { color: Colors.mentra.danger }]}>
                  {weekTrend >= 0 ? t('vsLastWeekPositive').replace('%{count}', String(weekTrend)) : t('vsLastWeekNegative').replace('%{count}', String(Math.abs(weekTrend)))}
                </Text>
              </View>
            )}
          </SanctuaryCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.chartContainer}>
           <View style={styles.chartCardInner}>
            <Svg width={CHART_SIZE} height={CHART_SIZE} style={{ alignSelf: 'center' }}>
                {[0.2, 0.4, 0.6, 0.8, 1].map((level, li) => {
                const pts = DIMENSIONS.map((_, i) => {
                    const { x, y } = getCoords(level, i, DIMENSIONS.length);
                    return `${x},${y}`;
                }).join(' ');
                return <Polygon key={li} points={pts} stroke={Colors.mentra.border} strokeWidth="1" fill="none" opacity={li === 4 ? 0.8 : 0.4} />;
                })}
                {DIMENSIONS.map((_, i) => {
                const { x, y } = getCoords(1.05, i, DIMENSIONS.length);
                return <Line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke={Colors.mentra.border} strokeWidth="1" opacity={0.3} />;
                })}
                <AnimatedPolygon animatedProps={animatedProps} fill={Colors.mentra.brandSecondary + '20'} stroke={Colors.mentra.brandPrimary} strokeWidth="2.5" strokeLinejoin="round" />
            </Svg>
            {DIMENSIONS.map((dim, i) => {
                const { x, y } = getCoords(1.28, i, DIMENSIONS.length);
                const isSelected = dim.key === selectedDomain;
                return (
                <Pressable key={i} onPress={() => { setSelectedDomain(isSelected ? null : dim.key); }} style={[styles.labelWrapper, { left: x - 32, top: y - 22 }]}>
                    <Text style={{ fontSize: 16 }}>{dim.emoji}</Text>
                    <Text style={[styles.labelText, isSelected && { color: dim.color, fontWeight: '800' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{dim.label}</Text>
                </Pressable>
                );
            })}
           </View>
        </Animated.View>

        <AnalystReport t={t} />
        <WeeklyChart days={WEEK_DAYS} scores={weekScores} t={t} />

        <View style={styles.domainGrid}>
          {DIMENSIONS.map((dim) => {
            const score = scores[dim.key] || 0;
            const isWeak = dim.key === weakestEntry[0];
            return (
              <ScalePressable key={dim.key} onPress={() => { Haptics.selectionAsync(); setSelectedDomain(dim.key); }}>
                <Card style={[styles.domainScoreCard, isWeak && styles.domainScoreCardWeak]}>
                  <View style={[styles.domainIconSmall, { backgroundColor: dim.bg }]}>
                      <Text style={{ fontSize: 14 }}>{dim.emoji}</Text>
                  </View>
                  <Text style={[styles.domainScoreVal, { color: dim.color }]}>{score}</Text>
                  <Text style={styles.domainScoreLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{dim.label}</Text>
                  <View style={styles.domainProgressBar}><View style={[styles.domainProgressFill, { width: `${score}%`, backgroundColor: dim.color }]} /></View>
                </Card>
              </ScalePressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{t('recommendedProgram')}</Text>
        <ScalePressable onPress={() => router.push('/training/daily-session' as any)}>
            <SanctuaryCard gradient={Colors.mentra.gradients.deepFocus as any} glowColor="rgba(255,255,255,0.15)" style={styles.programHero}>
                <View style={styles.programHeroBadge}><Text style={styles.programHeroBadgeText}>{t('protocol7Day')}</Text></View>
                <Text style={styles.programHeroTitle}>{weakDim.label} {t('mastery')}</Text>
                <Text style={styles.programHeroDesc}>{weakDim.desc}</Text>
                <View style={styles.programHeroFooter}>
                    <Text style={styles.programHeroMeta}>{t('estTime')}</Text>
                    <View style={styles.programHeroCTA}><Text style={styles.programHeroCTAText}>{t('programStart')}</Text></View>
                </View>
            </SanctuaryCard>
        </ScalePressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, maxWidth: 600, alignSelf: 'center', width: '100%' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: Colors.mentra.textDim },
  headerRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.mentra.brandPrimary + '14', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  headerBadgeText: { fontSize: 13, fontWeight: '800', color: Colors.mentra.brandPrimary },
  recalcBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.mentra.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.mentra.border },
  scroll: { paddingHorizontal: 20, maxWidth: 600, alignSelf: 'center', width: '100%' },
  scoreSummary: { borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, overflow: 'hidden' },
  scoreSumLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  scoreSumVal: { fontSize: 42, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  scoreSumMax: { fontSize: 18, color: 'rgba(255,255,255,0.4)' },
  scoreSumRight: { alignItems: 'center', gap: 5 },
  scoreSumTrend: { fontSize: 12, fontWeight: '700', color: Colors.mentra.brandSecondary },
  chartContainer: { marginBottom: 20 },
  chartCardInner: { 
    backgroundColor: Colors.mentra.surface, padding: 25, borderRadius: 24, borderWidth: 1, borderColor: Colors.mentra.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 8,
  },
  labelWrapper: { position: 'absolute', width: 64, alignItems: 'center' },
  labelText: { fontSize: 9, fontWeight: '700', color: Colors.mentra.textDim },
  analystCard: { 
    borderColor: Colors.mentra.brandPrimary + '40', marginBottom: 15,
  },
  analystBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.mentra.brandPrimary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  analystBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  analystTitle: { fontSize: 22, fontWeight: '800', color: Colors.mentra.text, marginTop: 12, marginBottom: 15, letterSpacing: -0.5 },
  observationRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  obsIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  obsLabel: { fontSize: 13, fontWeight: '700', color: Colors.mentra.text },
  obsText: { fontSize: 11, color: Colors.mentra.textDim, lineHeight: 16 },
  analystFooter: { borderTopWidth: 1, borderTopColor: Colors.mentra.border, paddingTop: 12, alignItems: 'center' },
  analystFooterText: { fontSize: 10, fontWeight: '700', color: Colors.mentra.brandPrimary },
  chartCard: { 
    marginBottom: 20,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.mentra.textDim, letterSpacing: -0.5, textTransform: 'uppercase' },
  sectionMeta: { fontSize: 11, color: Colors.mentra.textDim },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barCol: { alignItems: 'center', gap: 5 },
  barScore: { fontSize: 9, fontWeight: '700', color: Colors.mentra.textDim },
  barBg: { width: 28, height: '100%', backgroundColor: Colors.mentra.bg, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8 },
  barDay: { fontSize: 11, color: Colors.mentra.textDim },
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  domainScoreCard: { 
    width: (Math.min(width, 600) - 50) / 2,
  },
  domainScoreCardWeak: { borderColor: Colors.mentra.danger + '40', borderWidth: 1.5 },
  domainIconSmall: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  domainScoreVal: { fontSize: 26, fontWeight: '900', marginBottom: 2 },
  domainScoreLabel: { fontSize: 12, fontWeight: '700', color: Colors.mentra.textDim, marginBottom: 10 },
  domainProgressBar: { height: 4, backgroundColor: Colors.mentra.bg, borderRadius: 2 },
  domainProgressFill: { height: 4, borderRadius: 2 },
  programHero: { 
    marginBottom: 20,
  },
  programHeroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 15 },
  programHeroBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  programHeroTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
  programHeroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginBottom: 20 },
  programHeroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
  programHeroMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  programHeroCTA: { backgroundColor: Colors.mentra.brandSecondary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 18 },
  programHeroCTAText: { color: Colors.mentra.brandPrimary, fontSize: 12, fontWeight: '800' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  emptyBody: { fontSize: 15, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  emptyBtn: { backgroundColor: Colors.mentra.brandPrimary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  emptyBtnText: { color: '#FFF', fontWeight: '800' },
});
