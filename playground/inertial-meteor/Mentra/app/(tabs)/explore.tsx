import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Brain,
  Zap,
  Moon,
  Wind,
  Dumbbell,
  Target,
  Lock,
  Star,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useMentraTheme } from '@/hooks/useMentraTheme';
import { I18n } from '@/services/i18n';

// ─── Category Keys (raw keys, NOT translated strings) ─────────────────────────
// Bu sayede dil değişse bile filtreler bozulmaz.
const CAT_ALL      = 'catAll';
const CAT_FOCUS    = 'catFocus';
const CAT_SLEEP    = 'catSleep';
const CAT_STRESS   = 'catStress';
const CAT_ENERGY   = 'catEnergy';
const CAT_MEMORY   = 'catMemory';

const CATEGORY_KEYS = [CAT_ALL, CAT_FOCUS, CAT_SLEEP, CAT_STRESS, CAT_ENERGY, CAT_MEMORY];

// ─── Pack Definition ──────────────────────────────────────────────────────────

interface Pack {
  id: string;
  titleKey: string;
  descKey: string;
  categoryKey: string;
  duration: string;
  difficultyKey: string;
  icon: React.ReactNode;
  accent: string;
  isPro: boolean;
  route?: string;
  sessions: number;
}

function getPacks(C: ReturnType<typeof import('@/hooks/useMentraTheme').useMentraTheme>): Pack[] {
  return [
    {
      id: 'grid-focus',
      titleKey: 'packGridTitle',
      descKey: 'packGridDesc',
      categoryKey: CAT_FOCUS,
      duration: '3–5 min',
      difficultyKey: 'diffMedium',
      icon: <Target size={28} color="#FFF" />,
      accent: C.brandPrimary,
      isPro: false,
      route: '/game/grid-focus',
      sessions: 1,
    },
    {
      id: 'morning-reset',
      titleKey: 'packMorningTitle',
      descKey: 'packMorningDesc',
      categoryKey: CAT_ENERGY,
      duration: '12 min',
      difficultyKey: 'diffEasy',
      icon: <Zap size={28} color="#FFF" />,
      accent: '#F59E0B',
      isPro: false,
      route: '/training/daily-session',
      sessions: 3,
    },
    {
      id: 'deep-focus',
      titleKey: 'packDeepTitle',
      descKey: 'packDeepDesc',
      categoryKey: CAT_FOCUS,
      duration: '18 min',
      difficultyKey: 'diffHard',
      icon: <Brain size={28} color="#FFF" />,
      accent: '#6366F1',
      isPro: true,
      sessions: 4,
    },
    {
      id: 'better-sleep',
      titleKey: 'packSleepTitle',
      descKey: 'packSleepDesc',
      categoryKey: CAT_SLEEP,
      duration: '10 min',
      difficultyKey: 'diffEasy',
      icon: <Moon size={28} color="#FFF" />,
      accent: '#3B82F6',
      isPro: true,
      sessions: 5,
    },
    {
      id: 'anxiety-drop',
      titleKey: 'packAnxietyTitle',
      descKey: 'packAnxietyDesc',
      categoryKey: CAT_STRESS,
      duration: '15 min',
      difficultyKey: 'diffMedium',
      icon: <Wind size={28} color="#FFF" />,
      accent: '#10B981',
      isPro: true,
      sessions: 2,
    },
    {
      id: 'memory-palace',
      titleKey: 'packMemoryTitle',
      descKey: 'packMemoryDesc',
      categoryKey: CAT_MEMORY,          // ✅ key değil translated string
      duration: '15 min',
      difficultyKey: 'diffHard',
      icon: <Brain size={28} color="#FFF" />,
      accent: '#EC4899',
      isPro: true,
      sessions: 5,
    },
    {
      id: 'fitness-consistency',
      titleKey: 'packFitnessTitle',
      descKey: 'packFitnessDesc',
      categoryKey: CAT_ENERGY,          // ✅ key bazlı
      duration: '20 min',
      difficultyKey: 'diffMedium',
      icon: <Dumbbell size={28} color="#FFF" />,
      accent: '#F97316',
      isPro: false,
      route: '/training/daily-session',
      sessions: 4,
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DifficultyBadge({ diffKey, C }: { diffKey: string; C: ReturnType<typeof import('@/hooks/useMentraTheme').useMentraTheme> }) {
  const label = I18n.t(diffKey as any);
  const colorMap: Record<string, string> = {
    diffEasy:   C.brandPrimary,
    diffMedium: C.warning,
    diffHard:   C.danger,
  };
  const color = colorMap[diffKey] ?? C.muted;
  return (
    <View style={[styles.diffBadge, { borderColor: color }]}>
      <Text style={[styles.diffBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function PackCard({ pack, index, C }: { pack: Pack; index: number; C: ReturnType<typeof import('@/hooks/useMentraTheme').useMentraTheme> }) {
  const handlePress = () => {
    if (pack.isPro) {
      router.push('/paywall/feature-gate' as any);
    } else if (pack.route) {
      router.push(pack.route as any);
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.card, {
          backgroundColor: C.surface,
          borderColor: C.border,
          opacity: pressed ? 0.92 : 1,
        }]}
      >
        {/* Colour strip */}
        <View style={[styles.cardStrip, { backgroundColor: pack.accent }]}>
          {pack.icon}
          {pack.isPro && (
            <View style={styles.lockBadge}>
              <Lock size={12} color="#FFF" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: C.text }]} numberOfLines={1}>
              {I18n.t(pack.titleKey as any)}
            </Text>
            <DifficultyBadge diffKey={pack.difficultyKey} C={C} />
          </View>
          <Text style={[styles.cardDesc, { color: C.textDim }]} numberOfLines={2}>
            {I18n.t(pack.descKey as any)}
          </Text>
          <View style={styles.cardMeta}>
            <Clock size={12} color={C.muted} />
            <Text style={[styles.cardMetaText, { color: C.muted }]}>{pack.duration}</Text>
            <Text style={[styles.cardMetaDot, { color: C.muted }]}>·</Text>
            <Star size={12} color={C.muted} />
            <Text style={[styles.cardMetaText, { color: C.muted }]}>{pack.sessions} {I18n.t('sessions')}</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={16} color={C.muted} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const C = useMentraTheme();

  const [search, setSearch]             = useState('');
  const [activeCatKey, setActiveCatKey] = useState(CAT_ALL);

  const PACKS = getPacks(C);

  const filtered = PACKS.filter(p => {
    const matchesCat  = activeCatKey === CAT_ALL || p.categoryKey === activeCatKey;
    const matchSearch = search.trim() === '' ||
      I18n.t(p.titleKey as any).toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <StatusBar style={C.statusBar} />

      {/* ── Header ── */}
      <View style={styles.screenHeader}>
        <Text style={[styles.screenTitle, { color: C.text }]}>{I18n.t('exploreTitle')}</Text>
      </View>

      {/* ── Search ── */}
      <View style={[styles.searchBar, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Search size={20} color={C.textDim} />
        <TextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder={I18n.t('searchPlaceholder')}
          placeholderTextColor={C.textDim}
          value={search}
          onChangeText={setSearch}
          selectionColor={C.brandPrimary}
        />
      </View>

      {/* ── Category Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CATEGORY_KEYS.map(key => {
          const isActive = activeCatKey === key;
          return (
            <Pressable
              key={key}
              onPress={() => setActiveCatKey(key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? C.brandPrimary : C.surface,
                  borderColor:     isActive ? C.brandPrimary : C.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: isActive ? '#FFF' : C.textDim }]}>
                {I18n.t(key as any)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Pack List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {/* Featured banner */}
        {(activeCatKey === CAT_ALL || activeCatKey === CAT_FOCUS) && search === '' && (
          <Animated.View entering={FadeInDown.springify()} style={[styles.featuredBanner, { backgroundColor: C.brandPrimary }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.featuredTag, { color: C.brandSecondary }]}>⚡ {I18n.t('featuredTag')}</Text>
              <Text style={styles.featuredTitle}>{I18n.t('packGridTitle')}</Text>
              <Text style={styles.featuredDesc}>
                {I18n.t('packGridDesc')}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/game/grid-focus' as any)}
              style={[styles.featuredBtn, { backgroundColor: C.brandSecondary }]}
            >
              <Text style={[styles.featuredBtnText, { color: C.brandPrimary }]}>{I18n.t('exploreTryFree')}</Text>
            </Pressable>
          </Animated.View>
        )}

        {filtered.map((pack, i) => (
          <PackCard key={pack.id} pack={pack} index={i} C={C} />
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: C.textDim }]}>
              {I18n.t('noDataYet')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1 },

  screenHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  screenTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, marginBottom: 12,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },

  chipsRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },

  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },

  // Featured Banner
  featuredBanner: {
    borderRadius: CARD_RADIUS + 4,
    padding: 20, flexDirection: 'row', alignItems: 'center',
    marginBottom: 4, gap: 12,
  },
  featuredTag: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  featuredTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  featuredDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
  featuredBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  featuredBtnText: { fontSize: 13, fontWeight: '800' },

  // Pack Card
  card: {
    borderRadius: CARD_RADIUS, borderWidth: 1, overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  cardStrip: { width: 64, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lockBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3,
  },
  cardBody: { flex: 1, padding: 14, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardMetaText: { fontSize: 12 },
  cardMetaDot: { fontSize: 12 },

  diffBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  diffBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16 },
});
