import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Dimensions, RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Flame, ChevronRight, Zap, BrainCircuit, Play,
  TrendingUp, CheckCircle2, Lock, Sparkles, User, Brain, Clock, ShieldCheck
} from 'lucide-react-native';
import { I18n, useI18n } from '@/services/i18n';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';

import { Colors } from '@/constants/Colors';
import { Storage } from '@/services/storage';
import { getPremiumStatus } from '@/services/purchases';
import { Streak, StreakData } from '@/services/streak';
import { NotificationService } from '@/services/notifications';
import { RamadanService } from '@/services/ramadan';

const { width } = Dimensions.get('window');


// ─── Score Ring ────────────────────────────────────────────────────────────
const ScoreRing = React.memo(({ score, size = 78 }: { score: number; size?: number }) => {
  const { t } = useI18n();
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 6, borderColor: 'rgba(255,255,255,0.18)' }} />
      <View style={{ position: 'absolute', width: size - 18, height: size - 18, borderRadius: size, backgroundColor: 'rgba(74,222,128,0.12)' }} />
      <Text style={{ fontSize: size * 0.29, fontWeight: '900', color: '#FFF', letterSpacing: -1 }}>{score}</Text>
      <Text style={{ fontSize: size * 0.11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5 }}>{t('score' as any).toUpperCase()}</Text>
    </View>
  );
});

// ─── Hero Card ─────────────────────────────────────────────────────────────
const HeroCard = React.memo(({ score, streak, name, sessionCount, trend }: { score: number; streak: number; name: string, sessionCount: number, trend: number }) => {
  const { t } = useI18n();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning' as any) : hour < 18 ? t('goodAfternoon' as any) : t('goodEvening' as any);
  const tagline = score >= 80 ? t('peakForm' as any) : score >= 60 ? t('steadyProgress' as any) : t('warmingUp' as any);


  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.heroWrapper}>
      <LinearGradient colors={['#194031', '#0F2820']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.heroProtectionBadge}>
              <ShieldCheck size={10} color={Colors.mentra.brandPrimary} />
              <Text style={styles.heroProtectionText}>{t('protectionActiveShort')}</Text>
            </View>
            <Text style={styles.heroGreeting}>{greeting}, {name} 👋</Text>
            <Text style={styles.heroTagline}>{tagline}</Text>
          </View>
          <ScoreRing score={score} />
        </View>
        <Pressable 
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/activity' as any); }}
          style={styles.heroStats}
        >
          <View style={styles.heroStat}>
            <Flame size={14} color="#F59E0B" />
            <Text style={styles.heroStatVal}>{streak}</Text>
            <Text style={styles.heroStatLabel}>{t('consistency' as any)}</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <TrendingUp size={14} color={trend >= 0 ? Colors.mentra.brandSecondary : Colors.mentra.danger} />
            <Text style={styles.heroStatVal}>{trend > 0 ? '+' : ''}{trend}%</Text>
            <Text style={styles.heroStatLabel}>{t('thisWeekTitle' as any)}</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <CheckCircle2 size={14} color={Colors.mentra.success} />
            <Text style={styles.heroStatVal}>{sessionCount}</Text>
            <Text style={styles.heroStatLabel}>{t('sessions' as any)}</Text>
          </View>
          <View style={{ marginLeft: 8 }}>
            <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
          </View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
});

const NewsFlash = React.memo(() => {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(50).springify()}>
      <Pressable 
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/training' as any); }}
        style={styles.newsFlash}
      >
        <LinearGradient 
          colors={[Colors.mentra.brandAccent + '20', Colors.mentra.brandAccent + '05']} 
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
          style={StyleSheet.absoluteFill} 
        />
        <View style={styles.newsIcon}>
          <Sparkles size={14} color={Colors.mentra.brandAccent} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.newsTitle}>{t('latestResearch' as any)}</ThemedText>
          <ThemedText style={styles.newsSub}>{t('scienceBehindPrompt' as any)}</ThemedText>
        </View>
        <ChevronRight size={14} color={Colors.mentra.brandAccent} />
      </Pressable>
    </Animated.View>
  );
});

// ─── Daily Session CTA ─────────────────────────────────────────────────────
const DailySessionCard = React.memo(() => {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(80).springify()}>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/training/daily-session' as any); }}
        style={({ pressed }) => [styles.dailyCard, pressed && { opacity: 0.93, transform: [{ scale: 0.985 }] }]}
      >
        <LinearGradient colors={[Colors.mentra.brandSecondary + 'BB', Colors.mentra.brandSecondary + '44']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.dailyLeft}>
          <View style={styles.dailyTag}>
            <Sparkles size={10} color={Colors.mentra.brandPrimary} />
            <Text style={styles.dailyTagText}>{t('dailyWorkoutTag' as any)}</Text>
          </View>
          <Text style={styles.dailyTitle}>{t('dailyTrainingTitle' as any)}</Text>
          <Text style={styles.dailyDesc}>{t('dailyTrainingSubtitle' as any)}</Text>
          <View style={styles.dailyMeta}>
            <View style={styles.dailyDot} />
            <Text style={styles.dailyMetaText}>{t('adaptiveDifficulty' as any)}</Text>
          </View>
        </View>
        <View style={styles.dailyPlayBtn}>
          <Play size={20} color={Colors.mentra.brandPrimary} />
        </View>
      </Pressable>
    </Animated.View>
  );
});

// ─── Domain Strip ──────────────────────────────────────────────────────────
const DomainStrip = React.memo(({ domains }: { domains: any[] }) => {
  const { t } = useI18n();
  const weakest = domains.reduce((a: any, b: any) => (a.score < b.score ? a : b));
  return (
    <Animated.View entering={FadeInDown.delay(130).springify()}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('cognitiveProfileTitle' as any)}</Text>
        <Pressable onPress={() => router.push('/(tabs)/training' as any)}>
          <Text style={styles.sectionLink}>{t('fullRadarLink' as any)}</Text>
        </Pressable>
      </View>
      <View style={styles.domainStrip}>
        {domains.map((d) => {
          const isWeak = d.key === weakest.key;
          return (
            <Pressable key={d.key} onPress={() => router.push('/(tabs)/training' as any)} style={[styles.domainPill, isWeak && { borderColor: d.color + '60' }]}>
              <Text style={styles.domainEmoji}>{d.emoji}</Text>
              <Text style={[styles.domainLabel, isWeak && { color: d.color, fontWeight: '800' }]}>{d.label}</Text>
              <View style={styles.domainBarBg}>
                <View style={[styles.domainBarFill, { width: `${d.score}%`, backgroundColor: d.color }]} />
              </View>
              {isWeak && <View style={[styles.domainWeakDot, { backgroundColor: d.color }]} />}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
});


// ─── Ramadan Banner ────────────────────────────────────────────────────────
function RamadanBanner({ rec }: { rec: { title: string; desc: string; shouldTrain: boolean } }) {
  return (
    <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.ramadanCard}>
      <Text style={styles.ramadanEmoji}>🌙</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.ramadanTitle}>{rec.title}</Text>
        <Text style={styles.ramadanDesc}>{rec.desc}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Growth Edge Card ──────────────────────────────────────────────────────
function GrowthEdgeCard({ primaryChallengeKey, domains }: { primaryChallengeKey?: string, domains: any[] }) {
  const { t } = useI18n();
  // Map primaryChallenge → domain key
  const challengeToDomain: Record<string, string> = {
    brainFog: 'focus', stress: 'resilience', focus: 'focus',
    memory: 'memory', sleep: 'resilience', productivity: 'speed',
  };
  const domainFromChallenge = primaryChallengeKey ? challengeToDomain[primaryChallengeKey] : null;
  const weakest = domainFromChallenge
    ? (domains.find(d => d.key === domainFromChallenge) ?? domains.reduce((a, b) => (a.score < b.score ? a : b)))
    : domains.reduce((a, b) => (a.score < b.score ? a : b));
  const tips: Record<string, string> = {
    focus:      t('tipFocus'),
    memory:     t('tipMemory'),
    speed:      t('tipSpeed'),
    logic:      t('tipLogic'),
    resilience: t('tipResilience'),
  };
  const routes: Record<string, string> = {
    focus: '/game/grid-focus', memory: '/game/memory-grid',
    speed: '/game/speed-match', logic: '/game/grid-focus', resilience: '/training/daily-session',
  };
  return (
    <Animated.View entering={FadeInDown.delay(170).springify()} style={[styles.edgeCard, { borderColor: weakest.color + '35' }]}>
      <View style={[styles.edgeIconBox, { backgroundColor: weakest.bg }]}>
        <Text style={{ fontSize: 22 }}>{weakest.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={[styles.edgePill, { backgroundColor: weakest.color + '16' }]}>
          <Text style={[styles.edgePillText, { color: weakest.color }]}>{t('growthEdgeTag')}</Text>
        </View>
        <Text style={styles.edgeDomain}>{weakest.label}</Text>
        <Text style={styles.edgeTip}>{tips[weakest.key]}</Text>
        <Pressable onPress={() => router.push(routes[weakest.key])} style={[styles.edgeBtn, { backgroundColor: weakest.color }]}>
          <Text style={styles.edgeBtnText}>{t('exploreStart')} {weakest.label} {t('finish')} →</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Social Media Detox Section ──────────────────────────────────────────────
function DetoxSection() {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(195).springify()} style={detoxStyles.card}>
      <View style={detoxStyles.header}>
        <View style={detoxStyles.badge}>
          <Text style={detoxStyles.badgeText}>{t('badgeEliteLabs')}</Text>
        </View>
        <Text style={detoxStyles.title}>{t('titleDigitalDetox')}</Text>
      </View>
      <Text style={detoxStyles.desc}>
        {t('detoxDescription')}
      </Text>
      <View style={detoxStyles.games}>
        <Pressable
          style={({ pressed }) => [detoxStyles.gameBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push('/game/impulse-control');
          }}
        >
          <Text style={[detoxStyles.gameBtnEmoji]}>🛑</Text>
          <Text style={[detoxStyles.gameBtnLabel, { color: Colors.mentra.text }]}>{t('btnImpulseControl')}</Text>
          <Text style={detoxStyles.gameBtnSub}>{t('btnRebuildAttention')}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [detoxStyles.gameBtn, detoxStyles.gameBtnGreen, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push('/game/deep-focus')}
        >
          <Text style={detoxStyles.gameBtnEmoji}>🎯</Text>
          <Text style={detoxStyles.gameBtnLabel}>{t('btnDeepFocus')}</Text>
          <Text style={detoxStyles.gameBtnSub}>{t('btnRebuildAttention')}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const detoxStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 18,
    borderWidth: 1.5, borderColor: Colors.mentra.brandAccent + '30', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: { backgroundColor: Colors.mentra.brandAccent, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  title: { fontSize: 16, fontWeight: '800', color: Colors.mentra.text },
  desc: { fontSize: 13, color: Colors.mentra.textDim, lineHeight: 19, marginBottom: 14 },
  games: { flexDirection: 'row', gap: 10 },
  gameBtn: {
    flex: 1, backgroundColor: Colors.mentra.bg, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.mentra.border,
  },
  lockOverlay: {
    position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.mentra.brandAccent + '15', alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  gameBtnGreen: { backgroundColor: '#E8F5F0', borderColor: Colors.mentra.brandPrimary + '30' },
  gameBtnEmoji: { fontSize: 26 },
  gameBtnLabel: { fontSize: 13, fontWeight: '800', color: Colors.mentra.text },
  gameBtnSub: { fontSize: 10, color: Colors.mentra.textDim, fontWeight: '600' },
});


function QuickGamesRow({ isPro, games }: { isPro: boolean; games: any[] }) {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(210).springify()}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('brainGames')}</Text>
        <Pressable onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.sectionLink}>{t('seeAll')}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gamesRow}>
        {games.map((g) => {
          const locked = g.pro && !isPro;
          return (
            <Pressable
              key={g.title}
              onPress={() => { 
                if (g.phased) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                router.push(g.route); 
              }}
              style={({ pressed }) => [styles.gameCard, { backgroundColor: g.bg, opacity: pressed ? 0.86 : 1 }]}
            >
              <View style={[styles.gameIconBox, { backgroundColor: g.color + '22' }]}>
                <Text style={{ fontSize: 24, opacity: g.phased ? 0.4 : 1 }}>{g.emoji}</Text>
                {locked && <View style={styles.gameLock}><Lock size={10} color="#FFF" /></View>}
                {g.phased && <View style={[styles.gameLock, { backgroundColor: g.color }]}><Clock size={10} color="#FFF" /></View>}
              </View>
              <Text style={[styles.gameTitle, { color: g.color }]}>{g.title}</Text>
              <Text style={styles.gameSub}>{g.phased ? t('comingSoon') : g.sub}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}


function RoutinesSection({ isPro, routines }: { isPro: boolean; routines: any[] }) {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(250).springify()}>
      <View style={[styles.sectionHeader, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>{t('routines')}</Text>
      </View>
      {routines.map((r) => {
        const locked = r.pro && !isPro;
        return (
          <Pressable
            key={r.title}
            onPress={() => router.push((locked ? '/paywall/feature-gate' : r.route) as any)}
            style={({ pressed }) => [styles.routineRow, pressed && { backgroundColor: Colors.mentra.surface2 }]}
          >
            <View style={[styles.routineIconBox, { backgroundColor: r.bg }]}>
              <Text style={{ fontSize: 20 }}>{r.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.routineTitle}>{r.title}</Text>
              <Text style={styles.routineDesc}>{r.desc} · {r.dur}</Text>
            </View>
            {locked ? (
              <View style={styles.routineProBadge}>
                <Zap size={11} color={Colors.mentra.brandPrimary} />
                <Text style={styles.routineProText}>{t('routineProText')}</Text>
              </View>
            ) : (
              <ChevronRight size={18} color={Colors.mentra.muted} />
            )}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}


// ─── Social Media Detox Section ───────────────────────────────────────────

function SocialMediaSection({ detoxGames }: { detoxGames: any[] }) {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(295).springify()} style={{ marginBottom: 20 }}>
      <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
        <Text style={styles.sectionTitle}>📵 {t('digitalDetoxTitle' as any)}</Text>
        <Pressable onPress={() => router.push('/(tabs)/explore' as any)}>
          <Text style={styles.sectionLink}>{t('seeAll' as any)}</Text>
        </Pressable>
      </View>
      <View style={styles.detoxBox}>
        <Text style={styles.detoxHeadline}>{t('detoxHeadline')}</Text>
        <Text style={styles.detoxSub}>{t('detoxSub')}</Text>
        <View style={styles.detoxRow}>
          {detoxGames.map(g => (
            <Pressable
              key={g.title}
              onPress={() => { router.push(g.route as any); }}
              style={[styles.detoxCard, { backgroundColor: g.bg }]}
            >
              <Text style={{ fontSize: 26 }}>{g.emoji}</Text>
              <Text style={[styles.detoxCardTitle, { color: g.color }]}>{g.title}</Text>
              <Text style={styles.detoxCardSub}>{g.sub}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Journal Quick Card ────────────────────────────────────────────────────
function JournalCard() {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(285).springify()}>
      <Pressable
        onPress={() => router.push('/(tabs)/journal' as any)}
        style={({ pressed }) => [styles.journalCard, pressed && { opacity: 0.9 }]}
      >
        <View style={styles.journalLeft}>
          <View style={styles.journalIcon}><Text style={{ fontSize: 20 }}>📔</Text></View>
          <View>
            <Text style={styles.journalTitle}>{t('journalTitle' as any)}</Text>
            <Text style={styles.journalSub}>{t('journalFeelPrompt' as any)}</Text>
          </View>
        </View>
        <ChevronRight size={18} color={Colors.mentra.muted} />
      </Pressable>
    </Animated.View>
  );
}

function InsightCard({ insights }: { insights: string[] }) {
  const { t } = useI18n();
  const insight = insights[new Date().getDay() % insights.length];
  return (
    <Animated.View entering={FadeInDown.delay(290).springify()} style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <BrainCircuit size={15} color={Colors.mentra.brandPrimary} />
        <Text style={styles.insightLabel}>{t('dailyInsight')}</Text>
      </View>
      <Text style={styles.insightText}>{insight}</Text>
    </Animated.View>
  );
}

function UpsellBanner() {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.delay(320).springify()}>
      <Pressable onPress={() => router.push('/paywall/onboarding' as any)} style={({ pressed }) => [styles.upsellCard, pressed && { opacity: 0.9 }]}>
        <LinearGradient colors={['#194031', '#20503D']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        <View style={styles.upsellCircle} />
        <View style={{ flex: 1 }}>
          <Text style={styles.upsellTitle}>{t('upsellTitle')}</Text>
          <Text style={styles.upsellSub}>{t('upsellSub')}</Text>
        </View>
        <View style={styles.upsellBtn}><Text style={styles.upsellBtnText}>{t('btnGoPro')}</Text></View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Top Header ───────────────────────────────────────────────────────────
function HomeHeader() {
  const { t } = useI18n();
  return (
    <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <Text style={styles.brandTitle}>{t('mentraBrand')}</Text>
        <View style={styles.brandDot} />
      </View>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(tabs)/profile' as any);
        }}
        style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
      >
        <User size={20} color={Colors.mentra.text} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();

  const DOMAINS = React.useMemo(() => [
    { key: 'focus',      label: t('focus' as any),      color: Colors.mentra.brandPrimary, bg: '#E8F5F0', emoji: '🎯', score: 55 },
    { key: 'memory',     label: t('memory' as any),     color: '#6366F1',                  bg: '#EDECFD', emoji: '🧠', score: 72 },
    { key: 'speed',      label: t('speed' as any),      color: '#10B981',                  bg: '#ECFDF5', emoji: '⚡', score: 68 },
    { key: 'logic',      label: t('logic' as any),      color: '#F59E0B',                  bg: '#FFFBEB', emoji: '💡', score: 41 },
    { key: 'resilience', label: t('resilience' as any), color: '#8B5CF6',                  bg: '#F5F3FF', emoji: '🛡️', score: 60 },
  ], [lang]);

  const QUICK_GAMES = React.useMemo(() => [
    { title: t('gameGridFocus'),   sub: t('focus'),   emoji: '🎯', color: Colors.mentra.brandPrimary, bg: '#E8F5F0', route: '/game/grid-focus',   pro: false },
    { title: t('gameMemoryGrid'), sub: t('memory'),  emoji: '🧠', color: '#6366F1',                  bg: '#EDECFD', route: '/game/memory-grid',  pro: false },
    { title: t('exploreEliteBadge'),   sub: t('latestResearch'), emoji: '🔬', color: Colors.mentra.brandAccent,  bg: Colors.mentra.brandAccent + '10', route: '/(tabs)/explore', pro: false },
    { title: t('gameDopamineReset'),    sub: t('drTitle'),   emoji: '🔄', color: '#8B5CF6',                  bg: '#F5F3FF', route: '/game/dopamine-reset', pro: false },
  ], [lang]);

  const ROUTINES = React.useMemo(() => [
    { title: t('morningResetTitle'),   icon: '🌅', desc: t('morningResetDesc'),  dur: '8 min',  color: '#F59E0B', bg: '#FFFBEB', route: '/training/daily-session', pro: false },
    { title: t('deepFocusTitle'),      icon: '🎯', desc: t('deepFocusDesc'), dur: '15 min', color: Colors.mentra.brandPrimary, bg: '#E8F5F0', route: '/training/daily-session', pro: true },
    { title: t('sleepWindDownTitle'), icon: '🌙', desc: t('sleepWindDownDesc'),  dur: '10 min', color: '#6366F1', bg: '#EDECFD', route: '/training/daily-session', pro: true },
  ], [lang]);

  const DETOX_GAMES = React.useMemo(() => [
    { emoji: '🛑', title: t('impulseControlTitle'), sub: t('drPhaseTriggerSub'), color: Colors.mentra.danger, bg: '#FEF2F2', route: '/game/impulse-control' },
    { emoji: '🎯', title: t('deepFocusTitle'),       sub: '5–30 min timer',   color: '#6366F1',             bg: '#EDECFD', route: '/game/deep-focus' },
    { emoji: '🔄', title: t('drTitle'),   sub: t('drRateSub'),   color: '#8B5CF6',             bg: '#F5F3FF', route: '/game/dopamine-reset' },
  ], [lang]);

  const INSIGHTS = React.useMemo(() => [
    t('insight1' as any),
    t('insight2' as any),
    t('insight3' as any),
    t('insight4' as any),
  ], [lang]);

  const [userName, setUserName] = useState('there');
  const [streakData, setStreakData] = useState<StreakData>({ current: 0, longest: 0, lastPlayed: null, playedToday: false, isAtRisk: false });
  const [mentraScore, setMentraScore] = useState(72);
  const [sessionCount, setSessionCount] = useState(0);
  const [trendScore, setTrendScore] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ramadanActive, setRamadanActive] = useState(false);
  const [ramadanRec, setRamadanRec] = useState<{ title: string; desc: string; shouldTrain: boolean } | null>(null);
  const [primaryChallenge, setPrimaryChallenge] = useState<string>('logic');

  const calculateTrend = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return 0;
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeek = sessions.filter(s => now - new Date(s.timestamp).getTime() < oneWeekMs);
    const lastWeek = sessions.filter(s => {
      const t = now - new Date(s.timestamp).getTime();
      return t >= oneWeekMs && t < 2 * oneWeekMs;
    });
    if (thisWeek.length === 0) return 0;
    if (lastWeek.length === 0) return Math.min(Math.round(thisWeek.length * 2.5), 15);
    const avgThis = thisWeek.reduce((acc, s) => acc + (s.score || 0), 0) / thisWeek.length;
    const avgLast = lastWeek.reduce((acc, s) => acc + (s.score || 0), 0) / lastWeek.length;
    if (avgLast === 0) return 100;
    return Math.round(((avgThis - avgLast) / avgLast) * 100);
  };

  const loadData = useCallback(async () => {
    const [up, sd, pro, isRamadan, score, sessions] = await Promise.all([
      Storage.getUserProfile(),
      Streak.get(),
      getPremiumStatus(),
      RamadanService.isRamadanModeActive(),
      Storage.getGlobalScore(),
      Storage.getRecentSessions(50),
    ]);
    if (up?.name) setUserName(up.name.split(' ')[0]);
    if (up?.primaryChallenge) setPrimaryChallenge(up.primaryChallenge);
    setStreakData(sd);
    setIsPro(pro);
    setMentraScore(score);
    setSessionCount(sessions.length);
    setTrendScore(calculateTrend(sessions));
    setRamadanActive(isRamadan);
    if (isRamadan) {
      setRamadanRec(RamadanService.getTrainingRecommendation(new Date().getHours()));
    }
    NotificationService.scheduleDailyStreakReminder();
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false); }} tintColor={Colors.mentra.brandPrimary} />}
      >
        <HomeHeader />
        <HeroCard score={mentraScore} streak={streakData.current} name={userName} sessionCount={sessionCount} trend={trendScore} />
        {ramadanActive && ramadanRec && <RamadanBanner rec={ramadanRec} />}
        <DailySessionCard />
        <DomainStrip domains={DOMAINS} />
        <NewsFlash />
        <GrowthEdgeCard primaryChallengeKey={primaryChallenge} domains={DOMAINS} />
        <DetoxSection />
        <QuickGamesRow isPro={isPro} games={QUICK_GAMES} />
        <RoutinesSection isPro={isPro} routines={ROUTINES} />
        <JournalCard />
        <SocialMediaSection detoxGames={DETOX_GAMES} />
        <InsightCard insights={INSIGHTS} />
        {!isPro && <UpsellBanner />}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  scroll: { paddingHorizontal: 20 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brandTitle: { fontSize: 22, fontWeight: '900', color: Colors.mentra.text, letterSpacing: -0.8 },
  brandDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.mentra.brandPrimary, marginTop: 8 },
  profileBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.mentra.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.mentra.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
  },

  heroWrapper: { marginBottom: 16, marginTop: 8 },
  heroCard: {
    borderRadius: 24, padding: 22, overflow: 'hidden',
    shadowColor: Colors.mentra.brandPrimary,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
  },
  heroCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(74,222,128,0.07)', top: -60, right: -40 },
  heroCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(74,222,128,0.05)', bottom: -20, left: 40 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  heroGreeting: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
  heroProtectionBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 8, paddingVertical: 3, 
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 6,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)'
  },
  heroProtectionText: { fontSize: 9, fontWeight: '800', color: Colors.mentra.brandPrimary, letterSpacing: 1 },
  heroTagline: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '500' },
  heroStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12 },
  heroStat: { flex: 1, alignItems: 'center', gap: 3 },
  heroStatVal: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 0.3 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },

  dailyCard: {
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 22, overflow: 'hidden', borderWidth: 1, borderColor: Colors.mentra.brandSecondary + '50',
  },
  dailyLeft: { flex: 1, gap: 4 },
  dailyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  dailyTagText: { fontSize: 9, fontWeight: '800', color: Colors.mentra.brandPrimary, letterSpacing: 1.5 },
  dailyTitle: { fontSize: 20, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.3 },
  dailyDesc: { fontSize: 13, color: Colors.mentra.textDim, fontWeight: '500' },
  dailyMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  dailyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.mentra.success },
  dailyMetaText: { fontSize: 11, color: Colors.mentra.textDim, fontWeight: '600' },
  dailyPlayBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.mentra.brandPrimary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: Colors.mentra.textDim, letterSpacing: 1.5 },
  sectionLink: { fontSize: 13, fontWeight: '700', color: Colors.mentra.brandPrimary },

  domainStrip: { flexDirection: 'row', gap: 7, marginBottom: 20 },
  domainPill: {
    flex: 1, alignItems: 'center', gap: 4, backgroundColor: Colors.mentra.surface,
    borderRadius: 14, padding: 10, borderWidth: 1.5, borderColor: Colors.mentra.border,
  },
  domainEmoji: { fontSize: 16 },
  domainLabel: { fontSize: 9, fontWeight: '700', color: Colors.mentra.textDim, letterSpacing: 0.3 },
  domainBarBg: { width: '100%', height: 3, backgroundColor: Colors.mentra.border, borderRadius: 2 },
  domainBarFill: { height: 3, borderRadius: 2 },
  domainWeakDot: { width: 5, height: 5, borderRadius: 2.5 },

  edgeCard: {
    flexDirection: 'row', gap: 14, padding: 18, backgroundColor: Colors.mentra.surface,
    borderRadius: 20, borderWidth: 1.5, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  edgeIconBox: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  edgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 4 },
  edgePillText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  edgeDomain: { fontSize: 20, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.3, marginBottom: 4 },
  edgeTip: { fontSize: 13, color: Colors.mentra.textDim, lineHeight: 19, marginBottom: 12 },
  edgeBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'flex-start' },
  edgeBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  gamesRow: { gap: 10, paddingBottom: 4, marginBottom: 24 },
  gameCard: {
    width: 102, borderRadius: 16, padding: 14, gap: 8, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  gameIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  gameLock: {
    position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.mentra.muted, alignItems: 'center', justifyContent: 'center',
  },
  gameTitle: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2 },
  gameSub: { fontSize: 10, color: Colors.mentra.textDim, fontWeight: '600' },

  routineRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: Colors.mentra.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: 8,
  },
  routineIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  routineTitle: { fontSize: 15, fontWeight: '700', color: Colors.mentra.text, marginBottom: 2 },
  routineDesc: { fontSize: 12, color: Colors.mentra.textDim },
  routineProBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.mentra.brandSecondary + '25', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  routineProText: { fontSize: 11, fontWeight: '800', color: Colors.mentra.brandPrimary },

  insightCard: {
    backgroundColor: Colors.mentra.brandPrimary + '08', borderRadius: 16, padding: 18,
    marginTop: 8, marginBottom: 16, borderWidth: 1, borderColor: Colors.mentra.brandPrimary + '20',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  insightLabel: { fontSize: 10, fontWeight: '800', color: Colors.mentra.brandPrimary, letterSpacing: 1.5 },
  insightText: { fontSize: 14, color: Colors.mentra.text, lineHeight: 22, fontStyle: 'italic', fontWeight: '500' },

  upsellCard: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden', marginBottom: 8 },
  upsellCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.mentra.brandSecondary, opacity: 0.12, right: -30, top: -30 },
  upsellTitle: { fontSize: 15, fontWeight: '800', color: '#FFF', marginBottom: 3 },
  upsellSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  upsellBtn: { backgroundColor: Colors.mentra.brandSecondary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  upsellBtnText: { fontSize: 13, fontWeight: '800', color: Colors.mentra.brandPrimary },

  journalCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.mentra.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: 8,
  },
  journalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  journalIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  journalTitle: { fontSize: 15, fontWeight: '700', color: Colors.mentra.text },
  journalSub: { fontSize: 12, color: Colors.mentra.textDim },
  detoxBox: { backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: Colors.mentra.danger + '30' },
  detoxHeadline: { fontSize: 15, fontWeight: '800', color: Colors.mentra.text, marginBottom: 4 },
  detoxSub: { fontSize: 12, color: Colors.mentra.textDim, marginBottom: 14 },
  detoxRow: { flexDirection: 'row', gap: 8 },
  detoxCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6 },
  detoxCardTitle: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  detoxCardSub: { fontSize: 10, color: Colors.mentra.textDim, textAlign: 'center' },

  newsFlash: {
    backgroundColor: Colors.mentra.surface, borderRadius: 16, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.mentra.brandAccent + '20', overflow: 'hidden',
  },
  newsIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.mentra.brandAccent + '15', alignItems: 'center', justifyContent: 'center' },
  newsTitle: { fontSize: 10, fontWeight: '800', color: Colors.mentra.brandAccent, letterSpacing: 1, marginBottom: 2 },
  newsSub: { fontSize: 12, color: Colors.mentra.text, fontWeight: '600' },

  // Ramadan banner
  ramadanCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A1040', borderRadius: 16, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#6366F1' + '40',
  },
  ramadanEmoji: { fontSize: 24 },
  ramadanTitle: { fontSize: 14, fontWeight: '800', color: '#C4B5FD', marginBottom: 2 },
  ramadanDesc: { fontSize: 12, color: 'rgba(196,181,253,0.75)', lineHeight: 17 },
});
