import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CircuitBoard, Brain, Target, Shield, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const VerbatimGameCard = ({ title, desc, level, delay }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.whiteCardFull}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.levelBadge}>
        <Text style={styles.levelValue}>LVL {level}</Text>
      </View>
    </View>
    <Text style={styles.cardInfo}>Cognitive Calibrator · Seance {level}</Text>
    <Text style={styles.cardSummary}>{desc}</Text>
    <View style={styles.cardFooter}>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>🕒 15m</Text>
        <Text style={styles.metaText}>🔥 +45 XP</Text>
      </View>
      <Pressable style={styles.engageActionBtn}>
        <Text style={styles.engageActionText}>Engage</Text>
        <ChevronRight size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  </Animated.View>
);

export default function VerbatimGamesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[Colors.nexus.bg, Colors.nexus.bgDark]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.pageHeader}>
        <Text style={styles.pageLabel}>NEUROBOOST AI LAB</Text>
        <Text style={styles.pageTitle}>Games Archive</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.list}>
          <VerbatimGameCard 
            title="Logic Pivot" 
            desc="Dynamic reasoning engine requiring real-time strategy adjustment as rulesets evolve." 
            level="05" 
            delay={100} 
          />
          <VerbatimGameCard 
            title="Pattern Pulse" 
            desc="Visual-spatial sequences calibrated to neural flow benchmarks for working memory." 
            level="03" 
            delay={200} 
          />
          <VerbatimGameCard 
            title="Neural Cascade" 
            desc="Multi-threaded attention management training via cascading stimulus processing." 
            level="07" 
            delay={300} 
          />
          <VerbatimGameCard 
            title="Shield Protocol" 
            desc="Inhibitory control training designed to reduce cognitive interference and noise." 
            level="01" 
            delay={400} 
          />
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B172A' },
  scroll: { paddingHorizontal: 20 },
  pageHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 32 },
  pageLabel: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: Colors.nexus.brandPrimary, letterSpacing: 2, marginBottom: 8 },
  pageTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 34, color: '#FFFFFF' },

  list: { gap: 20 },
  whiteCardFull: { 
    backgroundColor: '#F8FAFC', borderRadius: 32, padding: 24, 
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#0F172A' },
  levelBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  levelValue: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#475569' },
  cardInfo: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.nexus.brandPrimary, marginBottom: 12 },
  cardSummary: { fontFamily: 'Manrope-Medium', fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 24 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#94A3B8' },
  engageActionBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 
  },
  engageActionText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' },
});
