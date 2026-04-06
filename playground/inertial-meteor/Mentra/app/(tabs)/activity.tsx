import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Flame, Trophy, Brain,
  Clock, BarChart2, Award, BrainCircuit, Sparkles, Activity, ShieldPlus
} from 'lucide-react-native';
import { I18n, useI18n } from '@/services/i18n';
import { ThemedText } from '@/components/themed-text';
import { Metrics } from '@/constants/Theme';

import { Colors } from '@/constants/Colors';
import { Storage } from '@/services/storage';
import { Streak, StreakData } from '@/services/streak';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// ─── Weekly Activity Bar Chart ──────────────────────────────────────────────
function WeeklyChart({ days, scores, t }: { days: string[], scores: number[], t: any }) {
  const max = Math.max(...scores, 1);
  const today = new Date().getDay(); // 0=Sun
  const mapped = [1,2,3,4,5,6,0]; // Mon-Sun

  return (
    <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.chartCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{I18n.t('actWeekTitle')}</Text>
        <Text style={styles.sectionMeta}>{I18n.t('actAvgScore').replace('%{score}', Math.round(scores.filter(s=>s>0).reduce((a,b)=>a+b,0)/scores.filter(s=>s>0).length).toString())}</Text>
      </View>
      <View style={styles.chartRow}>
        {days.map((day, i) => {
          const score = scores[i];
          const barH = score > 0 ? Math.max((score / max) * 80, 8) : 4;
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
    </Animated.View>
  );
}

// ─── Analyst Report (Wave 4) ────────────────────────────────────────────────
function AnalystReport() {
  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.analystCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.analystBadge}>
          <Sparkles size={11} color="#FFF" />
          <Text style={styles.analystBadgeText}>{I18n.t('analystPro') || 'ANALYST PRO'}</Text>
        </View>
        <Text style={styles.sectionMeta}>{I18n.t('latestUpdate') || 'Latest Update'}</Text>
      </View>
      <Text style={styles.analystTitle}>{I18n.t('scientistObservations') || "Cognitive Scientist's Observations"}</Text>
      <View style={styles.observationRow}>
        <View style={[styles.obsIcon, { backgroundColor: '#E8F5F0' }]}><ShieldPlus size={14} color={Colors.mentra.brandPrimary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.obsLabel}>{I18n.t('prefrontalInhibition') || 'Prefrontal Inhibition'}</Text>
          <Text style={styles.obsText}>{I18n.t('prefrontalInhibitionDesc') || 'Your \"stop-signal\" networks are showing 12% increased density after the last 5 sessions.'}</Text>
        </View>
      </View>
      <View style={styles.observationRow}>
        <View style={[styles.obsIcon, { backgroundColor: '#F5F3FF' }]}><Activity size={14} color="#8B5CF6" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.obsLabel}>{I18n.t('dopamineBaseline') || 'Dopamine Baseline'}</Text>
          <Text style={styles.obsText}>{I18n.t('dopamineBaselineDesc') || 'Dopamine receptor sensitivity is stabilizing.'}</Text>
        </View>
      </View>
      <View style={styles.analystFooter}>
        <Text style={styles.analystFooterText}>{I18n.t('deepProfilingComplete') || 'Deep analytical profiling complete.'}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Stats Strip ────────────────────────────────────────────────────────────
function StatsStrip({ streak }: { streak: StreakData }) {
  const stats = [
    { icon: <Flame size={18} color="#F59E0B" />, val: streak.current, label: 'Streak' },
    { icon: <Trophy size={18} color="#6366F1" />, val: streak.longest, label: 'Best' },
    { icon: <BarChart2 size={18} color={Colors.mentra.brandPrimary} />, val: 18, label: 'Sessions' },
    { icon: <Clock size={18} color='#10B981' />, val: '3.6h', label: 'Trained' },
  ];
  return (
    <Animated.View entering={FadeInDown.delay(40).springify()} style={styles.statsStrip}>
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          <View style={styles.statItem}>
            {s.icon}
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
          {i < stats.length - 1 && <View style={styles.statDivider} />}
        </React.Fragment>
      ))}
    </Animated.View>
  );
}

// ─── Domain Progress ────────────────────────────────────────────────────────
function DomainProgress({ progress }: { progress: any[] }) {
  return (
    <Animated.View entering={FadeInDown.delay(140).springify()}>
      <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
        <Text style={styles.sectionTitle}>{I18n.t('actDomainTitle')}</Text>
      </View>
      {progress.map((d) => (
        <View key={d.key} style={styles.domainRow}>
          <Text style={{ fontSize: 18, width: 26 }}>{d.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.domainLabelRow}>
              <Text style={styles.domainKey}>{d.key}</Text>
              <Text style={[styles.domainChange, { color: d.change >= 0 ? Colors.mentra.success : Colors.mentra.danger }]}>
                {d.change >= 0 ? `+${d.change}` : d.change}
              </Text>
            </View>
            <View style={styles.domainBarBg}>
              {/* Before bar (ghost) */}
              <View style={[styles.domainBarGhost, { width: `${d.before}%` }]} />
              {/* After bar */}
              <View style={[styles.domainBarFill, { width: `${d.after}%`, backgroundColor: d.color }]} />
            </View>
            <View style={styles.domainNumbers}>
              <Text style={styles.domainNum}>{d.before} → </Text>
              <Text style={[styles.domainNum, { fontWeight: '800', color: d.color }]}>{d.after}</Text>
            </View>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

// ─── Achievements ────────────────────────────────────────────────────────────
function AchievementsGrid({ achievements }: { achievements: any[] }) {
  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
        <Text style={styles.sectionTitle}>{I18n.t('actAchievTitle')}</Text>
        <Text style={styles.sectionMeta}>{achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked</Text>
      </View>
      <View style={styles.achieveGrid}>
        {achievements.map((a, i) => (
          <View key={i} style={[styles.achieveCard, !a.unlocked && styles.achieveCardLocked]}>
            <Text style={[styles.achieveEmoji, !a.unlocked && { opacity: 0.3 }]}>{a.emoji}</Text>
            <Text style={[styles.achieveTitle, !a.unlocked && { color: Colors.mentra.muted }]}>{a.title}</Text>
            <Text style={styles.achieveDesc} numberOfLines={2}>{a.desc}</Text>
            {a.unlocked && (
              <View style={styles.achieveUnlockedDot} />
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Recent Sessions ─────────────────────────────────────────────────────────

function RecentSessions({ sessions, t }: { sessions: any[], t: any }) {
  const dayLabel = (d: number) => d === 0 ? t('today') : d === 1 ? t('yesterday') : t('daysAgo').replace('%{count}', d.toString());
  return (
    <Animated.View entering={FadeInDown.delay(240).springify()}>
      <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
        <Text style={styles.sectionTitle}>{I18n.t('actRecentTitle')}</Text>
      </View>
      {sessions.map((s, i) => (
        <View key={i} style={styles.sessionRow}>
          <View style={styles.sessionIconBox}>
            <Brain size={18} color={Colors.mentra.brandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>{s.title}</Text>
            <Text style={styles.sessionMeta}>{s.domains} · {s.mins} min · {dayLabel(s.daysAgo)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.sessionScore}>{s.score}{s.fpq ? ' FPQ' : ''}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();

  const WEEK_DAYS = React.useMemo(() => [t('calM'), t('calT1'), t('calW'), t('calT2'), t('calF'), t('calS1'), t('calS2')], [lang]);
  const WEEK_SCORES = [72, 78, 65, 82, 79, 0, 88];

  const DOMAIN_PROGRESS = React.useMemo(() => [
    { key: t('focus'),      color: Colors.mentra.brandPrimary, emoji: '🎯', before: 48, after: 55, change: +7  },
    { key: t('memory'),     color: '#6366F1',                  emoji: '🧠', before: 68, after: 72, change: +4  },
    { key: t('speed'),      color: '#10B981',                  emoji: '⚡', before: 70, after: 68, change: -2  },
    { key: t('logic'),      color: '#F59E0B',                  emoji: '💡', before: 38, after: 41, change: +3  },
    { key: t('resilience'), color: '#8B5CF6',                  emoji: '🛡️', before: 55, after: 60, change: +5  },
  ], [lang]);

  const ACHIEVEMENTS = React.useMemo(() => [
    { emoji: '🔥', title: t('ach7DayStreak'),   desc: t('ach7DayStreakDesc'),  unlocked: true  },
    { emoji: '🧠', title: t('achMemoryMaster'),  desc: t('achMemoryMasterDesc'), unlocked: true  },
    { emoji: '⚡', title: t('achSpeedDemon'),    desc: t('achSpeedDemonDesc'),   unlocked: false },
    { emoji: '🏆', title: t('achEliteFocus'),    desc: t('achEliteFocusDesc'),   unlocked: false },
    { emoji: '📅', title: t('ach30DayVeteran'),  desc: t('ach30DayVeteranDesc'), unlocked: false },
    { emoji: '🌙', title: t('achNightOwl'),      desc: t('achNightOwlDesc'),     unlocked: false },
  ], [lang]);

  const RECENT = React.useMemo(() => [
    { title: t('dailyTrainingTitle'), domains: `${t('memory')} · ${t('speed')}`, score: 88, mins: 12, daysAgo: 0 },
    { title: t('gameGridFocus'),     domains: t('focus'),          score: 920, mins: 4,  daysAgo: 1, fpq: true },
    { title: t('gameMemoryGrid'),    domains: t('memory'),         score: 76,  mins: 5,  daysAgo: 1 },
    { title: t('dailyTrainingTitle'), domains: `${t('memory')} · ${t('speed')}`, score: 79,  mins: 11, daysAgo: 2 },
    { title: t('gameSpeedMatch'),    domains: t('speed'),          score: 84,  mins: 3,  daysAgo: 3 },
  ], [lang]);

  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastPlayed: null, playedToday: false, isAtRisk: false });

  useFocusEffect(useCallback(() => {
    Streak.get().then(setStreak);
  }, []));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{I18n.t('actProgressTitle')}</Text>
          <Text style={styles.headerSub}>{I18n.t('actProgressSub')}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Award size={16} color={Colors.mentra.brandPrimary} />
          <Text style={styles.headerBadgeText}>{I18n.t('actLevelBadge')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <StatsStrip streak={streak} />
        <AnalystReport />
        <WeeklyChart days={WEEK_DAYS} scores={WEEK_SCORES} t={t} />

        <View style={styles.card}>
          <DomainProgress progress={DOMAIN_PROGRESS} />
        </View>

        <View style={styles.card}>
          <AchievementsGrid achievements={ACHIEVEMENTS} />
        </View>

        <View style={styles.card}>
          <RecentSessions sessions={RECENT} t={t} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: Colors.mentra.textDim, marginTop: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.mentra.brandPrimary + '14', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  headerBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.mentra.brandPrimary },
  scroll: { paddingHorizontal: 20 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: Colors.mentra.textDim, letterSpacing: 1.5 },
  sectionMeta: { fontSize: 12, fontWeight: '600', color: Colors.mentra.textDim },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 20, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.mentra.textDim, letterSpacing: 0.3 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.mentra.border },

  // Weekly chart
  chartCard: {
    backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: 12,
  },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, height: 110 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barScore: { fontSize: 9, fontWeight: '700', color: Colors.mentra.textDim },
  barBg: { flex: 1, width: 28, justifyContent: 'flex-end', backgroundColor: Colors.mentra.surface2, borderRadius: 8, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8 },
  barDay: { fontSize: 11, fontWeight: '600', color: Colors.mentra.textDim },

  card: {
    backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: 12,
  },

  // Domain progress
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  domainLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  domainKey: { fontSize: 13, fontWeight: '700', color: Colors.mentra.text },
  domainChange: { fontSize: 13, fontWeight: '800' },
  domainBarBg: { height: 8, backgroundColor: Colors.mentra.surface2, borderRadius: 4, position: 'relative', marginBottom: 4 },
  domainBarGhost: { position: 'absolute', height: 8, backgroundColor: Colors.mentra.border, borderRadius: 4 },
  domainBarFill: { position: 'absolute', height: 8, borderRadius: 4 },
  domainNumbers: { flexDirection: 'row' },
  domainNum: { fontSize: 11, color: Colors.mentra.textDim },

  // Achievements
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveCard: {
    width: (width - 88) / 3, padding: 12, borderRadius: 14,
    backgroundColor: Colors.mentra.surface2, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.mentra.border, position: 'relative',
  },
  achieveCardLocked: { backgroundColor: Colors.mentra.bg },
  achieveEmoji: { fontSize: 22 },
  achieveTitle: { fontSize: 10, fontWeight: '800', color: Colors.mentra.text, textAlign: 'center' },
  achieveDesc: { fontSize: 9, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 13 },
  achieveUnlockedDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mentra.success },

  // Recent sessions
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.mentra.border },
  sessionIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.mentra.brandPrimary + '14', alignItems: 'center', justifyContent: 'center' },
  sessionTitle: { fontSize: 14, fontWeight: '700', color: Colors.mentra.text },
  sessionMeta: { fontSize: 11, color: Colors.mentra.textDim, marginTop: 2 },
  sessionScore: { fontSize: 15, fontWeight: '800', color: Colors.mentra.brandPrimary },

  // Analyst Card
  analystCard: {
    backgroundColor: Colors.mentra.surface, borderRadius: 24, padding: 20,
    borderWidth: 1.5, borderColor: Colors.mentra.brandAccent + '30', marginBottom: 12,
    shadowColor: Colors.mentra.brandAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
  },
  analystBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.mentra.brandAccent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  analystBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  analystTitle: { fontSize: 18, fontWeight: '800', color: Colors.mentra.text, marginTop: 14, marginBottom: 16 },
  observationRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  obsIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  obsLabel: { fontSize: 13, fontWeight: '700', color: Colors.mentra.text, marginBottom: 2 },
  obsText: { fontSize: 11, color: Colors.mentra.textDim, lineHeight: 16 },
  analystFooter: { borderTopWidth: 1, borderTopColor: Colors.mentra.border, paddingTop: 12, alignItems: 'center' },
  analystFooterText: { fontSize: 10, fontWeight: '700', color: Colors.mentra.brandAccent, letterSpacing: 0.5 },
});
