import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import Animated, {
  FadeInUp, FadeInDown,
  useSharedValue, useAnimatedProps, withSpring,
} from 'react-native-reanimated';
import { BrainCircuit, RotateCcw, Target, ShieldPlus, Zap, Activity, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { I18n, useI18n } from '@/services/i18n';

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.78;
const RADIUS = CHART_SIZE * 0.34;
const CENTER = CHART_SIZE / 2;
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);


export default function DiagnosticsScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();

  const DIMENSIONS = React.useMemo(() => [
    { label: t('focus'),      key: 'focus',      icon: Target,      color: Colors.mentra.brandPrimary, bg: '#E8F5F0', emoji: '🎯', desc: t('descFocus') },
    { label: t('memory'),     key: 'memory',     icon: BrainCircuit,color: '#6366F1',                  bg: '#EDECFD', emoji: '🧠', desc: t('descMemory') },
    { label: t('logic'),      key: 'logic',      icon: Activity,    color: '#F59E0B',                  bg: '#FFFBEB', emoji: '💡', desc: t('descLogic') },
    { label: t('speed'),      key: 'speed',      icon: Zap,         color: '#10B981',                  bg: '#ECFDF5', emoji: '⚡', desc: t('descSpeed') },
    { label: t('resilience'), key: 'resilience', icon: ShieldPlus,  color: '#8B5CF6',                  bg: '#F5F3FF', emoji: '🛡️', desc: t('descResilience') },
  ], [lang]);

  const SCORE_LABELS: Record<string, string> = React.useMemo(() => ({
    focus: t('prefrontalInhibitionDesc'),
    memory: t('mgIntroWhy'),
    logic: t('gfIntroWhy'),
    speed: t('smIntroWhy'),
    resilience: t('drIntroWhy'),
  }), [lang]);

  const [scores, setScores] = useState({ focus: 55, memory: 72, logic: 41, speed: 68, resilience: 60 });
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const animValues = {
    focus: useSharedValue(0), memory: useSharedValue(0), logic: useSharedValue(0),
    speed: useSharedValue(0), resilience: useSharedValue(0),
  };

  useEffect(() => { animateChartTo(scores); }, []);

  const animateChartTo = (s: typeof scores) => {
    Object.keys(s).forEach(k => {
      animValues[k as keyof typeof animValues].value = withSpring(s[k as keyof typeof s] / 100, { damping: 12 });
    });
  };

  const weakest = Object.entries(scores).reduce((a, b) => (a[1] < b[1] ? a : b));
  const weakDim = DIMENSIONS.find(d => d.key === weakest[0]) ?? DIMENSIONS[0];

  const triggerRecalibration = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsAnalyzing(true);
    animateChartTo({ focus: 5, memory: 5, logic: 5, speed: 5, resilience: 5 });
    setTimeout(() => {
      const newScores = {
        focus: Math.floor(Math.random() * 40) + 30,
        memory: Math.floor(Math.random() * 50) + 40,
        logic: Math.floor(Math.random() * 60) + 40,
        speed: Math.floor(Math.random() * 50) + 30,
        resilience: Math.floor(Math.random() * 40) + 50,
      };
      setScores(newScores);
      animateChartTo(newScores);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsAnalyzing(false);
    }, 1600);
  };

  const getCoords = (val: number, idx: number, total: number) => {
    const angle = (Math.PI * 2 * idx) / total - Math.PI / 2;
    return { x: CENTER + RADIUS * val * Math.cos(angle), y: CENTER + RADIUS * val * Math.sin(angle) };
  };

  const animatedProps = useAnimatedProps(() => {
    const keys = ['focus', 'memory', 'logic', 'speed', 'resilience'];
    const total = 5;
    
    // Safety check for animValues initialization
    const pts = keys.map((key, i) => {
      const val = animValues[key as keyof typeof animValues];
      if (!val) return `${CENTER},${CENTER}`;
      
      const v = val.value ?? 0;
      const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
      const x = CENTER + RADIUS * v * Math.cos(angle);
      const y = CENTER + RADIUS * v * Math.sin(angle);
      
      if (isNaN(x) || isNaN(y)) return `${CENTER},${CENTER}`;
      return `${x},${y}`;
    }).join(' ');
    
    return { points: pts };
  });

  const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('diagnosticsTitle')}</Text>
          <Text style={styles.headerSub}>{t('diagnosticsSub')}</Text>
        </View>
        <Pressable onPress={triggerRecalibration} disabled={isAnalyzing} style={({ pressed }) => [styles.recalcBtn, pressed && { opacity: 0.7 }]}>
          <RotateCcw size={15} color={isAnalyzing ? Colors.mentra.muted : Colors.mentra.brandPrimary} />
          <Text style={[styles.recalcText, isAnalyzing && { color: Colors.mentra.muted }]}>
            {isAnalyzing ? t('scanning') : t('recalibrate')}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Score Summary Bar */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.scoreSummary}>
          <LinearGradient colors={['#194031', '#0F2820']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={styles.scoreSumCircle} />
          <View>
            <Text style={styles.scoreSumLabel}>{t('mentraIndex')}</Text>
            <Text style={styles.scoreSumVal}>{avgScore}<Text style={styles.scoreSumMax}>/100</Text></Text>
          </View>
          <View style={styles.scoreSumRight}>
            <TrendingUp size={20} color={Colors.mentra.brandSecondary} />
            <Text style={styles.scoreSumTrend}>{t('vsLastWeekPositive').replace('%{count}', '4')}</Text>
          </View>
        </Animated.View>

        {/* Radar Chart */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.chartContainer}>
          <Svg width={CHART_SIZE} height={CHART_SIZE} style={{ alignSelf: 'center' }}>
            {/* Grid rings */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((level, li) => {
              const pts = DIMENSIONS.map((_, i) => { const { x, y } = getCoords(level, i, DIMENSIONS.length); return `${x},${y}`; }).join(' ');
              return <Polygon key={li} {...({ points: pts, stroke: Colors.mentra.border, strokeWidth: "1", fill: "none", opacity: li === 4 ? 0.8 : 0.4 } as any)} />;
            })}
            {/* Axis lines */}
            {DIMENSIONS.map((_, i) => {
              const { x, y } = getCoords(1.05, i, DIMENSIONS.length);
              return <Line key={i} {...({ x1: CENTER, y1: CENTER, x2: x, y2: y, stroke: Colors.mentra.border, strokeWidth: "1", opacity: 0.5 } as any)} />;
            })}
            {/* Score fill polygon */}
            <AnimatedPolygon
              {...({
                animatedProps: animatedProps,
                fill: Colors.mentra.brandPrimary + '30',
                stroke: Colors.mentra.brandPrimary,
                strokeWidth: "2.5",
                strokeLinejoin: "round"
              } as any)}
            />
            {/* Score dots */}
            {DIMENSIONS.map((dim, i) => {
              const v = scores[dim.key as keyof typeof scores] / 100;
              const { x, y } = getCoords(v, i, DIMENSIONS.length);
              return <Circle key={i} {...({ cx: x, cy: y, r: 5, fill: dim.color } as any)} />;
            })}
          </Svg>

          {/* Labels */}
          {DIMENSIONS.map((dim, i) => {
            const { x, y } = getCoords(1.25, i, DIMENSIONS.length);
            const isWeak = dim.key === weakest[0];
            const isSelected = dim.key === selectedDomain;
            return (
              <Pressable
                key={i}
                onPress={() => { Haptics.selectionAsync(); setSelectedDomain(isSelected ? null : dim.key); }}
                style={[styles.labelWrapper, { left: x - 32, top: y - 22 }]}
              >
                <Text style={{ fontSize: 18 }}>{dim.emoji}</Text>
                <Text style={[styles.labelText, isWeak && { color: Colors.mentra.danger, fontWeight: '800' }, isSelected && { color: dim.color }]}>
                  {dim.label}
                </Text>
                <Text style={[styles.labelScore, { color: dim.color }]}>{scores[dim.key as keyof typeof scores]}</Text>
              </Pressable>
            );
          })}

          {/* Center dot */}
          <View style={styles.chartCenter} />
        </Animated.View>

        {/* Domain Detail Card (tap a label to expand) */}
        {selectedDomain && (() => {
          const dim = DIMENSIONS.find(d => d.key === selectedDomain)!;
          const score = scores[selectedDomain as keyof typeof scores];
          return (
            <Animated.View entering={FadeInDown.springify()} style={[styles.domainDetail, { borderColor: dim.color + '40' }]}>
              <View style={[styles.domainDetailIcon, { backgroundColor: dim.bg }]}>
                <Text style={{ fontSize: 22 }}>{dim.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.domainDetailName, { color: dim.color }]}>{dim.label}</Text>
                <Text style={styles.domainDetailDesc}>{dim.desc}</Text>
                <View style={styles.domainDetailBar}>
                  <View style={[styles.domainDetailFill, { width: `${score}%`, backgroundColor: dim.color }]} />
                </View>
                <Text style={styles.domainDetailHint}>{SCORE_LABELS[selectedDomain]}</Text>
              </View>
            </Animated.View>
          );
        })()}

        {/* Domain Score Grid */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.domainGrid}>
          {DIMENSIONS.map((dim) => {
            const score = scores[dim.key as keyof typeof scores];
            const isWeak = dim.key === weakest[0];
            return (
              <Pressable
                key={dim.key}
                onPress={() => { Haptics.selectionAsync(); setSelectedDomain(dim.key === selectedDomain ? null : dim.key); }}
                style={[styles.domainCard, isWeak && { borderColor: dim.color + '50', borderWidth: 1.5 }]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={[styles.domainCardIcon, { backgroundColor: dim.bg }]}>
                    <Text style={{ fontSize: 16 }}>{dim.emoji}</Text>
                  </View>
                  {isWeak && (
                    <View style={styles.weakBadge}>
                      <AlertCircle size={10} color={Colors.mentra.danger} />
                      <Text style={styles.weakBadgeText}>{t('focusHere')}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.domainCardScore, { color: dim.color }]}>{score}</Text>
                <Text style={styles.domainCardLabel}>{dim.label}</Text>
                <View style={styles.domainCardBar}>
                  <View style={[styles.domainCardFill, { width: `${score}%`, backgroundColor: dim.color + '99' }]} />
                </View>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* Recommended Program */}
        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <Text style={styles.sectionTitle}>{t('recommendedProgram')}</Text>
          <Pressable
            style={({ pressed }) => [styles.programCard, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
            onPress={() => router.push('/training/daily-session' as any)}
          >
            <LinearGradient colors={['#194031', '#20503D']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <View style={styles.programGlow} />
            <View style={styles.programHeader}>
              <View style={styles.programTag}><Text style={styles.programTagText}>{t('protocol7Day')}</Text></View>
              <Text style={{ fontSize: 22 }}>{weakDim.emoji}</Text>
            </View>
            <Text style={styles.programTitle}>{weakDim.label} {t('mastery')}</Text>
            <Text style={styles.programDesc}>
              {t('dailyActivationSubtitle' as any)}
            </Text>
            <View style={styles.programFooter}>
              <Text style={styles.programMeta}>{t('estTime')}</Text>
              <View style={styles.programCTA}><Text style={styles.programCTAText}>{t('programStart')}</Text></View>
            </View>
          </Pressable>
        </Animated.View>

        {/* All Programs */}
        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('allPrograms')}</Text>
          {DIMENSIONS.map((dim, i) => {
            const score = scores[dim.key as keyof typeof scores];
            return (
              <Pressable
                key={dim.key}
                onPress={() => router.push('/training/daily-session' as any)}
                style={({ pressed }) => [styles.programRow, pressed && { backgroundColor: Colors.mentra.surface2 }]}
              >
                <View style={[styles.programRowIcon, { backgroundColor: dim.bg }]}>
                  <Text style={{ fontSize: 18 }}>{dim.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.programRowTitle}>{dim.label} {t('training')}</Text>
                  <Text style={styles.programRowSub}>{dim.desc}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.programRowScore, { color: dim.color }]}>{score}</Text>
                  <ChevronRight size={16} color={Colors.mentra.muted} />
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <Pressable 
            onPress={() => router.push('/(tabs)/explore' as any)}
            style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.browseBtnText}>{t('browseLibrary')}</Text>
            <ChevronRight size={16} color={Colors.mentra.brandPrimary} />
          </Pressable>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: Colors.mentra.textDim, marginTop: 2 },
  recalcBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.mentra.brandPrimary + '14', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  recalcText: { fontSize: 13, fontWeight: '700', color: Colors.mentra.brandPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  scoreSummary: {
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, overflow: 'hidden',
    shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16,
  },
  scoreSumCircle: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(74,222,128,0.08)', right: -20, top: -20 },
  scoreSumLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, marginBottom: 4 },
  scoreSumVal: { fontSize: 40, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  scoreSumMax: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  scoreSumRight: { alignItems: 'center', gap: 4 },
  scoreSumTrend: { fontSize: 12, fontWeight: '700', color: Colors.mentra.brandSecondary },

  chartContainer: { alignSelf: 'center', width: CHART_SIZE, height: CHART_SIZE, marginVertical: 8 },
  chartCenter: { position: 'absolute', top: CENTER - 5, left: CENTER - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.mentra.brandPrimary },
  labelWrapper: { position: 'absolute', width: 64, alignItems: 'center', gap: 2 },
  labelText: { fontSize: 9, fontWeight: '700', color: Colors.mentra.textDim, letterSpacing: 0.5 },
  labelScore: { fontSize: 13, fontWeight: '800' },

  domainDetail: {
    flexDirection: 'row', gap: 14, padding: 16, backgroundColor: Colors.mentra.surface,
    borderRadius: 16, borderWidth: 1.5, marginBottom: 16,
  },
  domainDetailIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  domainDetailName: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  domainDetailDesc: { fontSize: 12, color: Colors.mentra.textDim, marginBottom: 8 },
  domainDetailBar: { height: 6, backgroundColor: Colors.mentra.border, borderRadius: 3, marginBottom: 6 },
  domainDetailFill: { height: 6, borderRadius: 3 },
  domainDetailHint: { fontSize: 12, color: Colors.mentra.textDim, fontStyle: 'italic' },

  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  domainCard: {
    width: (width - 50) / 2, backgroundColor: Colors.mentra.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.mentra.border,
  },
  domainCardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  weakBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.mentra.danger + '14', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  weakBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.mentra.danger },
  domainCardScore: { fontSize: 28, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  domainCardLabel: { fontSize: 12, fontWeight: '700', color: Colors.mentra.textDim, marginBottom: 8 },
  domainCardBar: { height: 4, backgroundColor: Colors.mentra.border, borderRadius: 2 },
  domainCardFill: { height: 4, borderRadius: 2 },

  sectionTitle: { fontSize: 11, fontWeight: '800', color: Colors.mentra.textDim, letterSpacing: 1.5, marginBottom: 12 },

  programCard: { borderRadius: 22, padding: 22, overflow: 'hidden', marginBottom: 8, shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  programGlow: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: Colors.mentra.brandSecondary, opacity: 0.15 },
  programHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  programTag: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  programTagText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  programTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
  programDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 20 },
  programFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 14 },
  programMeta: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600' },
  programCTA: { backgroundColor: Colors.mentra.brandSecondary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 18 },
  programCTAText: { color: Colors.mentra.brandPrimary, fontSize: 12, fontWeight: '800' },

  programRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14,
    backgroundColor: Colors.mentra.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: 8,
  },
  programRowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  programRowTitle: { fontSize: 15, fontWeight: '700', color: Colors.mentra.text, marginBottom: 2 },
  programRowSub: { fontSize: 12, color: Colors.mentra.textDim },
  programRowScore: { fontSize: 18, fontWeight: '800' },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.mentra.surface, borderRadius: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: Colors.mentra.border, marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8,
  },
  browseBtnText: { fontSize: 15, fontWeight: '700', color: Colors.mentra.brandPrimary },
});
