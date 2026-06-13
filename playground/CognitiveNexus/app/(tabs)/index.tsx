import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Menu, Play, CircuitBoard, Brain, MoreHorizontal } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, G, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

const CircularProgress = ({ value, size, color }: any) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
        <Circle 
          cx={size/2} cy={size/2} r={radius} 
          stroke={color} strokeWidth="6" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </Svg>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{value}%</Text>
      </View>
    </View>
  );
};

const VerbatimModuleCard = ({ title, desc, level, delay }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.whiteCard}>
    <View style={styles.cardTop}>
      <Text style={styles.cardTitleText}>{title}</Text>
      <View style={styles.levelTag}>
        <Text style={styles.levelTagText}>LEVEL {level}</Text>
      </View>
    </View>
    <Text style={styles.cardDescText}>{desc}</Text>
    <View style={styles.cardBottom}>
      <View style={styles.timeTag}>
        <Text style={styles.timeTagText}>🕒 10 mins</Text>
      </View>
      <Pressable style={styles.engageBtnCyan}>
        <Text style={styles.engageBtnText}>Engage</Text>
      </Pressable>
    </View>
  </Animated.View>
);

export default function VerbatimDashboard() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[Colors.nexus.bg, Colors.nexus.bgDark]} style={StyleSheet.absoluteFill} />
      
      {/* Verbatim Header */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <Pressable style={styles.menuBox}><Menu size={20} color="#FFFFFF" /></Pressable>
          <Text style={styles.navTitle}>NeuroBoost AI Lab</Text>
        </View>
        <Pressable style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Oturum Aç</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Readiness State Verbatim */}
        <Animated.View entering={FadeInUp.springify()} style={styles.readinessHero}>
          <View style={styles.readinessLeft}>
            <Text style={styles.readinessTag}>CURRENT STATE: <Text style={{color: Colors.nexus.brandPrimary}}>OPTIMAL</Text></Text>
            <Text style={styles.readinessTitle}>Your mind is finding its flow.</Text>
            <Pressable style={styles.resumeBtn}>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.resumeBtnText}>Resume Training</Text>
            </Pressable>
          </View>
          <CircularProgress value={75} size={120} color={Colors.nexus.brandPrimary} />
        </Animated.View>

        {/* Protocol Verbatim Card */}
        <View style={styles.protocolBanner}>
          <Text style={styles.protocolBannerTitle}>Optimized Daily Protocol</Text>
          <Text style={styles.protocolBannerDesc}>
            Based on your recent performance in "Pattern Pulse," we suggest a focused 15-minute attention cycle.
          </Text>
          <Pressable style={styles.startBannerBtn}>
            <Text style={styles.startBannerBtnText}>Start Suggested Session</Text>
          </Pressable>
        </View>

        {/* Recommended Content Verbatim */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionHeadTitle}>RECOMMENDED FOR YOU</Text>
        </View>

        <View style={styles.modulesGrid}>
          <VerbatimModuleCard 
            title="Logic Pivot" 
            desc="Dynamic reasoning engine requiring real-time strategy adjustment." 
            level="05" 
            delay={100} 
          />
          <VerbatimModuleCard 
            title="Pattern Pulse" 
            desc="Visual-spatial sequences calibrated to neural flow benchmarks." 
            level="03" 
            delay={200} 
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B172A' },
  scroll: { paddingBottom: 20 },
  
  navBar: { 
    height: 64, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' 
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#FFFFFF' },
  loginBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  loginBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF' },

  readinessHero: { 
    flexDirection: 'row', alignItems: 'center', padding: 24, 
    marginTop: 10, marginBottom: 20, justifyContent: 'space-between' 
  },
  readinessLeft: { flex: 1, marginRight: 20 },
  readinessTag: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 12 },
  readinessTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, color: '#FFFFFF', lineHeight: 40, marginBottom: 24 },
  resumeBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 10, 
    backgroundColor: '#0B172A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100, alignSelf: 'flex-start'
  },
  resumeBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' },
  scoreContainer: { position: 'absolute' },
  scoreText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#FFFFFF' },

  protocolBanner: { 
    marginHorizontal: 20, padding: 32, borderRadius: 40, backgroundColor: '#010816', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 40
  },
  protocolBannerTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, color: '#FFFFFF', marginBottom: 12 },
  protocolBannerDesc: { fontFamily: 'Manrope-Medium', fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 24, marginBottom: 32 },
  startBannerBtn: { backgroundColor: '#FFFFFF', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  startBannerBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#010816' },

  sectionHead: { paddingHorizontal: 24, marginBottom: 20 },
  sectionHeadTitle: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 },

  modulesGrid: { paddingHorizontal: 20, gap: 16 },
  whiteCard: { 
    backgroundColor: '#F8FAFC', borderRadius: 32, padding: 28, 
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 30, elevation: 10
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitleText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#0F172A' },
  levelTag: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  levelTagText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#059669' },
  cardDescText: { fontFamily: 'Manrope-Medium', fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 28 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeTag: { flexDirection: 'row', alignItems: 'center' },
  timeTagText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#94A3B8' },
  engageBtnCyan: { backgroundColor: '#0B172A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  engageBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#FFFFFF' },
});
