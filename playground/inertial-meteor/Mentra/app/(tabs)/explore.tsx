import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Lock, Clock, ChevronRight, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/Colors';


const CATEGORIES = [
  { id: 'all',        label: 'All',        emoji: '✨' },
  { id: 'focus',      label: 'Focus',      emoji: '🎯' },
  { id: 'memory',     label: 'Memory',     emoji: '🧠' },
  { id: 'speed',      label: 'Speed',      emoji: '⚡' },
  { id: 'sleep',      label: 'Sleep',      emoji: '🌙' },
  { id: 'resilience', label: 'Resilience', emoji: '🛡️' },
];

interface Pack {
  id: string; title: string; desc: string; category: string;
  duration: string; difficulty: 'Easy' | 'Medium' | 'Hard';
  emoji: string; color: string; bg: string; gradient: [string, string];
  isPro: boolean; route?: string; featured?: boolean;
  brainBenefit: string;
  isPhased?: boolean;
}

const PACKS: Pack[] = [
  {
    id: 'grid-focus', title: 'Grid Focus', desc: 'Schulte table training. Find sequential numbers to expand peripheral vision and rebuild sustained attention.',
    category: 'focus', duration: '3-5 min', difficulty: 'Medium',
    emoji: '🎯', color: Colors.mentra.brandPrimary, bg: '#E8F5F0', gradient: ['#194031', '#20503D'],
    isPro: false, route: '/game/grid-focus', featured: true,
    brainBenefit: 'Prefrontal cortex · Attention networks',
  },
  {
    id: 'memory-grid', title: 'Memory Grid', desc: 'Watch the illuminated sequence and replay it. Trains working memory and pattern encoding in the hippocampus.',
    category: 'memory', duration: '4-6 min', difficulty: 'Medium',
    emoji: '🧠', color: '#6366F1', bg: '#EDECFD', gradient: ['#4F46E5', '#7C3AED'],
    isPro: false, route: '/game/memory-grid',
    brainBenefit: 'Hippocampus · Working memory',
  },
  {
    id: 'speed-match', title: 'Speed Match', desc: 'Does the shape match the previous one? Trains rapid pattern recognition and decision speed under pressure.',
    category: 'speed', duration: '3-4 min', difficulty: 'Hard',
    emoji: '⚡', color: '#10B981', bg: '#ECFDF5', gradient: ['#059669', '#10B981'],
    isPro: false, route: '/game/speed-match',
    brainBenefit: 'Processing speed · Inhibitory control',
    isPhased: true,
  },
  {
    id: 'morning-reset', title: 'Morning Reset', desc: 'A structured cognitive activation routine. Box breathing + grid focus + intention setting for peak morning state.',
    category: 'focus', duration: '12 min', difficulty: 'Easy',
    emoji: '🌅', color: '#F59E0B', bg: '#FFFBEB', gradient: ['#D97706', '#F59E0B'],
    isPro: false, route: '/training/daily-session',
    brainBenefit: 'Dopamine · Prefrontal activation',
  },
  {
    id: 'deep-focus', title: 'Deep Focus Protocol', desc: 'Advanced 18-minute concentration block. Trains sustained attention at the edge of cognitive capacity.',
    category: 'focus', duration: '18 min', difficulty: 'Hard',
    emoji: '🔬', color: '#6366F1', bg: '#EDECFD', gradient: ['#4F46E5', '#6366F1'],
    isPro: true,
    brainBenefit: 'Default mode network · Task switching',
  },
  {
    id: 'sleep-prep', title: 'Sleep Wind-Down', desc: 'Calm your cognitive load before bed. Progressive muscle relaxation + breathing + mental decompression.',
    category: 'sleep', duration: '10 min', difficulty: 'Easy',
    emoji: '🌙', color: '#3B82F6', bg: '#DBEAFE', gradient: ['#1D4ED8', '#3B82F6'],
    isPro: true,
    brainBenefit: 'Cortisol reduction · Sleep architecture',
  },
  {
    id: 'stress-reset', title: 'Anxiety Drop', desc: 'CBT-based cognitive reframing + 4-7-8 breathing. Disrupt the anxiety loop in under 15 minutes.',
    category: 'resilience', duration: '15 min', difficulty: 'Medium',
    emoji: '🌊', color: '#8B5CF6', bg: '#F5F3FF', gradient: ['#7C3AED', '#8B5CF6'],
    isPro: true,
    brainBenefit: 'Amygdala regulation · HRV improvement',
  },
  {
    id: 'impulse-control',
    title: 'Impulse Control', desc: 'Train your brain\'s \"stop\" signal. Resist social media notification bait while tapping real brain stimuli. Rebuilds prefrontal inhibitory control.',
    category: 'focus', duration: '3-4 min', difficulty: 'Medium',
    emoji: '🛑', color: Colors.mentra.danger, bg: '#FEF2F2', gradient: ['#DC2626', '#EF4444'],
    isPro: false, route: '/game/impulse-control',
    brainBenefit: 'Prefrontal cortex · Inhibitory control',
    isPhased: true,
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus Timer', desc: 'Monotasking timer with progressive difficulty. Trains sustained attention — the skill social media steals most.',
    category: 'focus', duration: '5-30 min', difficulty: 'Medium',
    emoji: '🎯', color: '#6366F1', bg: '#EDECFD', gradient: ['#4F46E5', '#6366F1'],
    isPro: false, route: '/game/deep-focus',
    brainBenefit: 'Sustained attention · Default mode network',
  },
  {
    id: 'dopamine-reset',
    title: 'Dopamine Reset', desc: 'Break the scroll urge in real-time. Identify your trigger, rate the craving, then rewire with a 60-second neurological reset.',
    category: 'resilience', duration: '3-5 min', difficulty: 'Easy',
    emoji: '🔄', color: '#8B5CF6', bg: '#F5F3FF', gradient: ['#7C3AED', '#8B5CF6'],
    isPro: false, route: '/game/dopamine-reset',
    brainBenefit: 'Dopamine regulation · Habit loop breaking',
  },
  {
    id: 'memory-palace', title: 'Memory Palace', desc: 'Build a mental spatial map to anchor memories. Method-of-loci technique used by world memory champions.',
    category: 'memory', duration: '20 min', difficulty: 'Hard',
    emoji: '🏛️', color: '#EC4899', bg: '#FCE7F3', gradient: ['#DB2777', '#EC4899'],
    isPro: true,
    brainBenefit: 'Spatial memory · Long-term encoding',
  },
  {
    id: 'impulse-control', title: 'Impulse Control', desc: 'Rebuild the prefrontal "stop" network weakened by infinite scrolling. Go on green, stop on red. Used in clinical neuroscience research.',
    category: 'focus', duration: '3-4 min', difficulty: 'Hard',
    emoji: '🛑', color: '#EF4444', bg: '#FEF2F2', gradient: ['#DC2626', '#EF4444'],
    isPro: false, route: '/game/impulse-control',
    brainBenefit: 'Prefrontal inhibitory control · Stop signal',
  },
  {
    id: 'deep-focus', title: 'Deep Focus Builder', desc: 'The antidote to TikTok Brain. Train sustained attention from 10 to 30 seconds — the exact capacity destroyed by short-form video.',
    category: 'focus', duration: '5-7 min', difficulty: 'Medium',
    emoji: '🎯', color: Colors.mentra.brandPrimary, bg: '#E8F5F0', gradient: ['#194031', '#20503D'],
    isPro: false, route: '/game/deep-focus',
    brainBenefit: 'Sustained attention · Prefrontal-parietal network',
  },
];

function FeaturedBanner({ pack }: { pack: Pack }) {
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
              <Text style={styles.featuredTag}>FEATURED · FREE</Text>
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
              <Text style={[styles.featuredBtnText, { color: pack.color }]}>Try Free</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function PackCard({ pack, index }: { pack: Pack; index: number }) {
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
                <Text style={[styles.packDiffText, { color: Colors.mentra.brandPrimary }]}>ELITE LAB</Text>
              </View>
            ) : (
              <View style={[styles.packDiff, { borderColor: diffColors[pack.difficulty] }]}>
                <Text style={[styles.packDiffText, { color: diffColors[pack.difficulty] }]}>{pack.difficulty}</Text>
              </View>
            )}
          </View>
          <Text style={styles.packDesc} numberOfLines={2}>
            {pack.isPhased ? 'Experimental: Scientific research trial in progress. Unlocking in the next research wave.' : pack.desc}
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
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
        <Text style={styles.screenTitle}>Explore</Text>
        <Text style={styles.screenSub}>Science-backed cognitive training</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color={Colors.mentra.textDim} />
        <TextInput
          style={styles.searchInput} placeholder="Search programs..."
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
          <View style={styles.empty}><Text style={styles.emptyText}>No programs found.</Text></View>
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
