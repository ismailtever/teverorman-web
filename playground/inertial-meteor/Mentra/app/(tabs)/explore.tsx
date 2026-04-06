import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, BrainCircuit, Lock, ChevronRight, Zap, Target, Search, Clock } from 'lucide-react-native';
import { I18n, useI18n } from '@/services/i18n';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/Colors';




function FeaturedBanner({ pack }: { pack: any }) {
  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.featuredWrapper}>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push((pack.route ?? '/') as any); }}
        style={({ pressed }) => [{ opacity: pressed ? 0.93 : 1 }]}
      >
        <LinearGradient colors={pack.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredCard}>
          <View style={styles.featuredGlow} />
          <View style={styles.featuredTop}>
            <View style={styles.featuredTagRow}>
              <Sparkles size={11} color={Colors.mentra.brandSecondary} />
              <Text style={styles.featuredTag}>{I18n.t('exploreFeaturedBadge')}</Text>
            </View>
            <Text style={{ fontSize: 36 }}>{pack.emoji}</Text>
          </View>
          <Text style={styles.featuredTitle}>{pack.title}</Text>
          <Text style={styles.featuredDesc} numberOfLines={2}>{pack.desc}</Text>
          <View style={styles.featuredFooter}>
            <View style={styles.featuredMeta}>
              <Clock size={11} color="rgba(255,255,255,0.6)" />
              <Text style={styles.featuredMetaText}>{pack.duration}</Text>
              <Text style={styles.featuredDot}>·</Text>
              <Text style={styles.featuredMetaText}>{pack.brainBenefit}</Text>
            </View>
            <View style={styles.featuredBtn}>
              <Text style={[styles.featuredBtnText, { color: pack.color }]}>{I18n.t('exploreTryFree')}</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function PackCard({ pack, index }: { pack: any; index: number }) {
  const handlePress = () => {
    if (pack.isPhased) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push((pack.isPro ? '/paywall/feature-gate' : (pack.route ?? '/')) as any);
  };

  const diffColors = { Easy: Colors.mentra.success, Medium: '#F59E0B', Hard: Colors.mentra.danger };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.packCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
        {/* Color strip */}
        <LinearGradient colors={pack.isPhased ? ['#334155', '#1e293b'] : pack.gradient} style={styles.packStrip}>
          <Text style={[styles.packEmoji, pack.isPhased && { opacity: 0.4 }]}>{pack.emoji}</Text>
          {pack.isPro && !pack.isPhased && <View style={styles.packLock}><Lock size={11} color="#FFF" /></View>}
          {pack.isPhased && <View style={styles.packLock}><Clock size={11} color="#FFF" /></View>}
        </LinearGradient>

        <View style={styles.packBody}>
          <View style={styles.packHeader}>
            <Text style={[styles.packTitle, pack.isPhased && { color: Colors.mentra.textDim }]} numberOfLines={1}>{pack.title}</Text>
            {pack.isPhased ? (
              <View style={[styles.packDiff, { borderColor: Colors.mentra.brandPrimary, backgroundColor: Colors.mentra.brandPrimary + '15' }]}>
                <Text style={[styles.packDiffText, { color: Colors.mentra.brandPrimary }]}>{I18n.t('exploreEliteBadge')}</Text>
              </View>
            ) : (
              <View style={[styles.packDiff, { borderColor: diffColors[pack.difficulty] }]}>
                <Text style={[styles.packDiffText, { color: diffColors[pack.difficulty] }]}>{pack.difficulty}</Text>
              </View>
            )}
          </View>
          <Text style={styles.packDesc} numberOfLines={2}>
            {pack.isPhased ? I18n.t('experimentalFeature') : pack.desc}
          </Text>
          <View style={styles.packMeta}>
            <Clock size={11} color={Colors.mentra.muted} />
            <Text style={styles.packMetaText}>{pack.duration}</Text>
            <Text style={styles.packDot}>·</Text>
            <Text style={[styles.packBenefit, { color: pack.color }]}>{pack.category}</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={15} color={Colors.mentra.muted} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const CATEGORIES = React.useMemo(() => [
    { id: 'all',        label: t('catAll'),        emoji: '✨' },
    { id: 'focus',      label: t('catFocus'),      emoji: '🎯' },
    { id: 'memory',     label: t('catMemory'),     emoji: '🧠' },
    { id: 'speed',      label: t('catSpeed'),      emoji: '⚡' },
    { id: 'sleep',      label: t('catSleep'),      emoji: '🌙' },
    { id: 'resilience', label: t('catResilience'), emoji: '🛡️' },
  ], [lang]);

  const PACKS = React.useMemo(() => [
    {
      id: 'grid-focus', title: t('gameGridFocus'), desc: t('gfHowTo'),
      category: t('catFocus'), duration: '3-5 min', difficulty: 'Medium',
      emoji: '🎯', color: Colors.mentra.brandPrimary, bg: '#E8F5F0', gradient: ['#194031', '#20503D'],
      isPro: false, route: '/game/grid-focus', featured: true,
      brainBenefit: t('prefrontalInhibition'),
    },
    {
      id: 'memory-grid', title: t('gameMemoryGrid'), desc: t('memoryGridDesc'),
      category: t('catMemory'), duration: '4-6 min', difficulty: 'Medium',
      emoji: '🧠', color: '#6366F1', bg: '#EDECFD', gradient: ['#4F46E5', '#7C3AED'],
      isPro: false, route: '/game/memory-grid',
      brainBenefit: t('memory'),
    },
    {
      id: 'speed-match', title: t('gameSpeedMatch'), desc: t('speedMatchDesc'),
      category: t('catSpeed'), duration: '3-4 min', difficulty: 'Hard',
      emoji: '⚡', color: '#10B981', bg: '#ECFDF5', gradient: ['#059669', '#10B981'],
      isPro: false, route: '/game/speed-match',
      brainBenefit: t('speed'),
      isPhased: true,
    },
    {
      id: 'morning-reset', title: t('morningResetTitle'), desc: t('morningResetDescLong'),
      category: t('catFocus'), duration: '12 min', difficulty: 'Easy',
      emoji: '🌅', color: '#F59E0B', bg: '#FFFBEB', gradient: ['#D97706', '#F59E0B'],
      isPro: false, route: '/training/daily-session',
      brainBenefit: t('dopamineBaseline'),
    },
    {
      id: 'deep-focus-pro', title: t('deepFocusTitle'), desc: t('deepFocusDescLong'),
      category: t('catFocus'), duration: '18 min', difficulty: 'Hard',
      emoji: '🔬', color: '#6366F1', bg: '#EDECFD', gradient: ['#4F46E5', '#6366F1'],
      isPro: true,
      brainBenefit: t('focus'),
    },
    {
      id: 'sleep-prep', title: t('sleepWindDownTitle'), desc: t('sleepWindDownDescLong'),
      category: t('catSleep'), duration: '10 min', difficulty: 'Easy',
      emoji: '🌙', color: '#3B82F6', bg: '#DBEAFE', gradient: ['#1D4ED8', '#3B82F6'],
      isPro: true,
      brainBenefit: t('catSleep'),
    },
    {
      id: 'stress-reset', title: t('anxietyDropTitle'), desc: t('anxietyDropDesc'),
      category: t('catResilience'), duration: '15 min', difficulty: 'Medium',
      emoji: '🌊', color: '#8B5CF6', bg: '#F5F3FF', gradient: ['#7C3AED', '#8B5CF6'],
      isPro: true,
      brainBenefit: t('catResilience'),
    },
    {
      id: 'impulse-control',
      title: t('impulseControlTitle'), desc: t('impulseControlDescLong'),
      category: t('catFocus'), duration: '3-4 min', difficulty: 'Medium',
      emoji: '🛑', color: Colors.mentra.danger, bg: '#FEF2F2', gradient: ['#DC2626', '#EF4444'],
      isPro: false, route: '/game/impulse-control',
      brainBenefit: t('prefrontalInhibition'),
    },
    {
      id: 'deep-focus-timer',
      title: t('deepFocusTimerTitle'), desc: t('deepFocusTimerDescLong'),
      category: t('catFocus'), duration: '5-30 min', difficulty: 'Medium',
      emoji: '🎯', color: '#6366F1', bg: '#EDECFD', gradient: ['#4F46E5', '#6366F1'],
      isPro: false, route: '/game/deep-focus',
      brainBenefit: t('focus'),
    },
    {
      id: 'dopamine-reset',
      title: t('gameDopamineReset'), desc: t('drResetCompleteSub'),
      category: t('catResilience'), duration: '3-5 min', difficulty: 'Easy',
      emoji: '🔄', color: '#8B5CF6', bg: '#F5F3FF', gradient: ['#7C3AED', '#8B5CF6'],
      isPro: false, route: '/game/dopamine-reset',
      brainBenefit: t('dopamineBaseline'),
    },
    {
      id: 'memory-palace', title: t('memoryPalaceTitle'), desc: t('memoryPalaceDesc'),
      category: t('catMemory'), duration: '20 min', difficulty: 'Hard',
      emoji: '🏛️', color: '#EC4899', bg: '#FCE7F3', gradient: ['#DB2777', '#EC4899'],
      isPro: true,
      brainBenefit: t('scienceBehindGrounding'),
    },
  ], [lang]);

  const featured = PACKS.find(p => p.featured);
  const filtered = PACKS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && !p.featured;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{I18n.t('exploreTitle')}</Text>
        <Text style={styles.screenSub}>{I18n.t('exploreSub')}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color={Colors.mentra.textDim} />
        <TextInput
          style={styles.searchInput} placeholder={I18n.t('searchPlaceholder')}
          placeholderTextColor={Colors.mentra.muted} value={search} onChangeText={setSearch}
          selectionColor={Colors.mentra.brandPrimary}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat.id); }}
            style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catLabel, activeCategory === cat.id && styles.catLabelActive]}>{cat.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {/* Featured */}
        {featured && activeCategory === 'all' && !search && <FeaturedBanner pack={featured} />}

        {/* Pack list */}
        {filtered.map((pack, i) => <PackCard key={pack.id} pack={pack} index={i} />)}
        {filtered.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>{I18n.t('exploreEmpty')}</Text></View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  screenHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.5 },
  screenSub: { fontSize: 13, color: Colors.mentra.textDim, marginTop: 2 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.mentra.surface, marginHorizontal: 20, marginTop: 14, marginBottom: 12,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: Colors.mentra.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.mentra.text },

  categories: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.mentra.border, backgroundColor: Colors.mentra.surface,
  },
  catChipActive: { backgroundColor: Colors.mentra.brandPrimary, borderColor: Colors.mentra.brandPrimary },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 13, fontWeight: '600', color: Colors.mentra.textDim },
  catLabelActive: { color: '#FFF' },

  list: { paddingHorizontal: 20, gap: 12 },

  // Featured
  featuredWrapper: { marginBottom: 4 },
  featuredCard: { borderRadius: 22, padding: 22, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  featuredGlow: { position: 'absolute', top: -60, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)' },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  featuredTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featuredTag: { fontSize: 10, fontWeight: '800', color: Colors.mentra.brandSecondary, letterSpacing: 1 },
  featuredTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
  featuredDesc: { fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 20, marginBottom: 18 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 14 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  featuredMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  featuredDot: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginHorizontal: 2 },
  featuredBtn: { backgroundColor: Colors.mentra.brandSecondary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  featuredBtnText: { fontSize: 12, fontWeight: '800' },

  // Pack card
  packCard: {
    flexDirection: 'row', backgroundColor: Colors.mentra.surface,
    borderRadius: 18, borderWidth: 1, borderColor: Colors.mentra.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8,
  },
  packStrip: { width: 70, alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 100 },
  packEmoji: { fontSize: 28 },
  packLock: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  packBody: { flex: 1, padding: 14, gap: 5 },
  packHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  packTitle: { fontSize: 16, fontWeight: '700', color: Colors.mentra.text, flex: 1 },
  packDiff: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  packDiffText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  packDesc: { fontSize: 12, color: Colors.mentra.textDim, lineHeight: 18 },
  packMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  packMetaText: { fontSize: 11, color: Colors.mentra.muted },
  packDot: { fontSize: 11, color: Colors.mentra.muted },
  packBenefit: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: Colors.mentra.textDim },
});
