import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3, TrendingUp, Info } from 'lucide-react-native';
import Svg, { Polygon, Line, Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_SIZE = 260;
const CENTER = CHART_SIZE / 2;
const RADIUS = CENTER - 40;

const RadarChart = () => {
  const axes = ['Attention', 'Logic', 'Memory', 'Speed', 'Focus'];
  const dataPoints = [0.92, 0.78, 0.85, 0.84, 0.89];
  
  const getPoint = (index: number, value: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    return {
      x: CENTER + radius * value * Math.cos(angle),
      y: CENTER + radius * value * Math.sin(angle),
    };
  };

  const polygonPoints = dataPoints.map((val, i) => {
    const p = getPoint(i, val, RADIUS);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <View style={styles.radarContainer}>
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        {[0.2, 0.4, 0.6, 0.8, 1].map((step) => {
          const points = axes.map((_, i) => {
            const p = getPoint(i, step, RADIUS);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <Polygon
              key={step}
              points={points}
              fill="transparent"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}
        {axes.map((_, i) => {
          const p = getPoint(i, 1, RADIUS);
          return <Line key={i} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
        })}
        <Polygon points={polygonPoints} fill="rgba(32, 225, 225, 0.3)" stroke="#20E1E1" strokeWidth="2" />
        {dataPoints.map((val, i) => {
          const p = getPoint(i, val, RADIUS);
          return <Circle key={i} cx={p.x} cy={p.y} r="3" fill="#20E1E1" />;
        })}
      </Svg>
      <View style={styles.radarLabels}>
        {axes.map((axis, i) => {
          const p = getPoint(i, 1.25, RADIUS);
          return (
            <Text 
              key={axis} 
              style={[
                styles.radarLabelText, 
                { left: p.x - 30, top: p.y - 10, width: 60, textAlign: 'center' }
              ]}
            >
              {axis.toUpperCase()}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

export default function VerbatimStatsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[Colors.nexus.bg, Colors.nexus.bgDark]} style={StyleSheet.absoluteFill} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Verbatim NeuroScore Section */}
        <View style={styles.scoreHeader}>
          <Text style={styles.headerLabel}>QUANTITATIVE INSIGHTS</Text>
          <Text style={styles.scoreTitle}>NeuroScore</Text>
          <Animated.View entering={FadeInDown.springify()} style={styles.scoreValueContainer}>
            <Text style={styles.scoreDisplay}>842</Text>
            <View style={styles.trendRow}>
              <TrendingUp size={14} color="#20E1E1" />
              <Text style={styles.trendText}>+12.4% THIS WEEK</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.statsGrid}>
          {/* Radar Chart Verbatim Card */}
          <View style={styles.statsCard}>
            <View style={styles.cardInfoHead}>
              <Text style={styles.cardLabel}>NEURAL CAPACITY</Text>
              <Info size={14} color="rgba(255,255,255,0.3)" />
            </View>
            <RadarChart />
          </View>

          {/* Weekly Chart Verbatim Card */}
          <View style={styles.statsCard}>
            <View style={styles.cardInfoHead}>
              <Text style={styles.cardLabel}>WEEKLY TRAINING INTENSITY</Text>
            </View>
            <View style={styles.barChartContainer}>
              {[40, 60, 45, 95, 55, 70, 65].map((h, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View style={[styles.barFill, { height: h, backgroundColor: i === 3 ? '#20E1E1' : 'rgba(255,255,255,0.1)' }]} />
                  <Text style={styles.barText}>{['M','T','W','T','F','S','S'][i]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B172A' },
  scroll: { paddingHorizontal: 20 },
  
  scoreHeader: { alignItems: 'center', marginTop: 32, marginBottom: 40 },
  headerLabel: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: Colors.nexus.brandPrimary, letterSpacing: 2, marginBottom: 8 },
  scoreTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  scoreValueContainer: { alignItems: 'center' },
  scoreDisplay: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 110, color: '#FFFFFF', letterSpacing: -5, lineHeight: 110 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  trendText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#20E1E1' },

  statsGrid: { gap: 16 },
  statsCard: { 
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 40, padding: 32, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center' 
  },
  cardInfoHead: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  cardLabel: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5 },

  radarContainer: { position: 'relative', width: CHART_SIZE, height: CHART_SIZE, alignItems: 'center', justifyContent: 'center' },
  radarLabels: { ...StyleSheet.absoluteFillObject },
  radarLabelText: { position: 'absolute', fontFamily: 'Inter-SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },

  barChartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', height: 120, paddingHorizontal: 10 },
  barWrapper: { alignItems: 'center', gap: 12 },
  barFill: { width: 14, borderRadius: 10 },
  barText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.3)' },
});
