import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import Animated, { FadeInUp, SlideInRight, useSharedValue, useAnimatedProps, withSpring, withTiming } from 'react-native-reanimated';
import { BrainCircuit, Activity, RotateCcw, Target, ShieldPlus, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Metrics } from '@/constants/Theme';
import { Storage } from '@/services/storage';
import { useMentraTheme } from '@/hooks/useMentraTheme';

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.75;
const CENTER = CHART_SIZE / 2;
const RADIUS = CHART_SIZE * 0.35;

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

// Engine Dimensions (colors are fixed brand/semantic, not theme-dependent)
const DIMENSIONS = [
    { label: 'FOCUS', key: 'focus', icon: Target, color: '#6C63FF' },
    { label: 'MEMORY', key: 'memory', icon: BrainCircuit, color: '#3B82F6' },
    { label: 'LOGIC', key: 'logic', icon: Activity, color: '#F59E0B' },
    { label: 'SPEED', key: 'speed', icon: Zap, color: '#10B981' },
    { label: 'RESILIENCE', key: 'resilience', icon: ShieldPlus, color: '#8B5CF6' }
];

export default function DiagnosticsScreen() {
    const C = useMentraTheme();
    const insets = useSafeAreaInsets();

    // Core User Data
    const [scores, setScores] = useState({ focus: 40, memory: 60, logic: 55, speed: 70, resilience: 45 });
    const [lowestDimension, setLowestDimension] = useState<string>('focus');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Animation Values (0 to 1)
    const animValues = {
        focus: useSharedValue(0),
        memory: useSharedValue(0),
        logic: useSharedValue(0),
        speed: useSharedValue(0),
        resilience: useSharedValue(0)
    };

    useEffect(() => {
        // Mock load from storage
        animateChartTo(scores);
        calculateLowest(scores);
    }, []);

    const animateChartTo = (newScores: any) => {
        Object.keys(newScores).forEach(key => {
            animValues[key as keyof typeof animValues].value = withSpring(newScores[key] / 100, { damping: 12 });
        });
    };

    const calculateLowest = (currentScores: any) => {
        let lowest = 'focus';
        let minVal = 100;
        Object.entries(currentScores).forEach(([k, v]) => {
            if ((v as number) < minVal) { minVal = v as number; lowest = k; }
        });
        setLowestDimension(lowest);
    };

    const triggerRecalibration = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setIsAnalyzing(true);

        // Drop to 0
        animateChartTo({ focus: 5, memory: 5, logic: 5, speed: 5, resilience: 5 });

        setTimeout(() => {
            // New random simulation data representing a test completion
            const newScores = {
                focus: Math.floor(Math.random() * 40) + 30, // 30-70
                memory: Math.floor(Math.random() * 50) + 40,
                logic: Math.floor(Math.random() * 60) + 40,
                speed: Math.floor(Math.random() * 50) + 30,
                resilience: Math.floor(Math.random() * 40) + 50
            };
            setScores(newScores);
            animateChartTo(newScores);
            calculateLowest(newScores);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsAnalyzing(false);
        }, 1500);
    };

    // Math for polar to cartesian coordinates
    const getCoordinatesForValue = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const x = CENTER + RADIUS * value * Math.cos(angle);
        const y = CENTER + RADIUS * value * Math.sin(angle);
        return { x, y };
    };

    const animatedProps = useAnimatedProps(() => {
        const total = DIMENSIONS.length;
        const pts = DIMENSIONS.map((dim, i) => {
            const val = animValues[dim.key as keyof typeof animValues].value;
            const { x, y } = getCoordinatesForValue(val, i, total);
            return `${x},${y}`;
        }).join(' ');

        return { points: pts };
    });

    const lowestConfig = DIMENSIONS.find(d => d.key === lowestDimension) || DIMENSIONS[0];

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: C.bg }]}>
            <StatusBar style={C.statusBar} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: C.text }]}>Diagnostics</Text>
                <Pressable onPress={triggerRecalibration} disabled={isAnalyzing} style={({ pressed }) => [styles.recalcBtn, { backgroundColor: C.brandPrimary + '15' }, pressed && { opacity: 0.7 }]}>
                    <RotateCcw size={16} color={C.brandPrimary} />
                    <Text style={[styles.recalcText, { color: C.brandPrimary }]}>Recalibrate</Text>
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Radar Chart Engine */}
                <Animated.View entering={FadeInUp.delay(100)} style={styles.chartContainer}>
                    <Svg width={CHART_SIZE} height={CHART_SIZE} style={{ alignSelf: 'center' }}>
                        {/* Background Web grid (5 levels) */}
                        {[0.2, 0.4, 0.6, 0.8, 1].map((level, levelIdx) => {
                            const pts = DIMENSIONS.map((_, i) => {
                                const { x, y } = getCoordinatesForValue(level, i, DIMENSIONS.length);
                                return `${x},${y}`;
                            }).join(' ');
                            return <Polygon key={levelIdx} points={pts} stroke={C.border} strokeWidth="1" fill="none" opacity={0.5} />;
                        })}

                        {/* Axis Lines */}
                        {DIMENSIONS.map((_, i) => {
                            const { x, y } = getCoordinatesForValue(1.1, i, DIMENSIONS.length); // Push slightly out for line ends
                            return <Line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke={C.border} strokeWidth="1" opacity={0.5} />;
                        })}

                        {/* Actual Skill Polygon (Animated) */}
                        <AnimatedPolygon
                            animatedProps={animatedProps}
                            fill={C.brandSecondary + '40'}
                            stroke={C.brandPrimary}
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />

                        {/* Labels & Icons overlay calculation (Using React Native Views mapped over SVG for better styling) */}
                    </Svg>

                    {/* Floating Labels placed absolute over SVG container */}
                    {DIMENSIONS.map((dim, i) => {
                        const { x, y } = getCoordinatesForValue(1.2, i, DIMENSIONS.length);
                        const Icon = dim.icon;
                        const isLowest = dim.key === lowestDimension;
                        return (
                            <View key={i} style={[styles.labelWrapper, { left: x - 30, top: y - 20 }]}>
                                <Icon size={16} color={isLowest ? C.danger : C.textDim} />
                                <Text style={[styles.labelText, { color: isLowest ? C.danger : C.textDim, fontWeight: isLowest ? '800' : '700' }]}>
                                    {dim.label}
                                </Text>
                            </View>
                        );
                    })}

                    {/* Center Core dot */}
                    <View style={[styles.chartCore, { backgroundColor: C.brandPrimary }]} />
                </Animated.View>

                {/* Engine Output Analysis */}
                <Animated.View entering={FadeInUp.delay(300)} style={[styles.analysisCard, { backgroundColor: C.surface, borderColor: C.border, shadowColor: C.brandPrimary }]}>
                    <Text style={[styles.analysisHeader, { color: C.danger }]}>YOUR COGNITIVE PROFILE</Text>
                    <View style={styles.diagnosisRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.diagnosisTitle, { color: C.text }]}>Biggest Growth Opportunity</Text>
                            <Text style={[styles.diagnosisDesc, { color: C.textDim }]}>
                                Your <Text style={{ fontWeight: '700', color: C.text }}>{lowestConfig.label}</Text> score has the highest improvement potential. A focused 7-day training block can elevate this by an average of 23%.
                            </Text>
                        </View>
                        <View style={[styles.weaknessBadge, { backgroundColor: lowestConfig.color + '20' }]}>
                            <lowestConfig.icon size={32} color={lowestConfig.color} />
                        </View>
                    </View>
                </Animated.View>

                {/* Recommended Training Bootcamps */}
                <Animated.Text entering={FadeInUp.delay(400)} style={[styles.sectionTitle, { color: C.textDim }]}>
                    RECOMMENDED PROTOCOL
                </Animated.Text>

                <Animated.View entering={SlideInRight.springify().delay(500)}>
                    <Pressable style={({ pressed }) => [styles.bootcampCard, { backgroundColor: C.brandPrimary }, pressed && { transform: [{ scale: 0.98 }] }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
                        <View style={[styles.bootcampGlow, { backgroundColor: C.brandSecondary }]} />
                        <View style={styles.bootcampHeader}>
                            <View style={styles.bootcampTag}><Text style={styles.bootcampTagText}>7-DAY PROGRAM</Text></View>
                            <Target size={20} color="#FFF" opacity={0.8} />
                        </View>
                        <Text style={styles.bootcampTitle}>{lowestConfig.label} Mastery</Text>
                        <Text style={styles.bootcampDesc}>
                            Science-backed rituals to sharpen your {lowestConfig.key} capacity — used by high-performers, athletes, and top executives. Just 12 min/day.
                        </Text>
                        <View style={styles.bootcampFooter}>
                            <Text style={styles.bootcampDuration}>Est. 12 min/day · 7 days</Text>
                            <View style={styles.bootcampPlayBtn}>
                                <Text style={[styles.bootcampPlayText, { color: C.brandPrimary }]}>Start Program</Text>
                            </View>
                        </View>
                    </Pressable>
                </Animated.View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
    headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    recalcBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    recalcText: { fontSize: 13, fontWeight: '700' },

    scroll: { paddingBottom: 100 },

    // Chart
    chartContainer: { alignSelf: 'center', marginVertical: 40, width: CHART_SIZE, height: CHART_SIZE },
    chartCore: { position: 'absolute', top: CENTER - 4, left: CENTER - 4, width: 8, height: 8, borderRadius: 4 },
    labelWrapper: { position: 'absolute', width: 60, alignItems: 'center', justifyContent: 'center', gap: 4 },
    labelText: { fontSize: 10, letterSpacing: 0.5 },

    // Analysis Card
    analysisCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, borderWidth: 1, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 24, marginBottom: 32 },
    analysisHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
    diagnosisRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    diagnosisTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
    diagnosisDesc: { fontSize: 13, lineHeight: 20 },
    weaknessBadge: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

    // Bootcamp
    sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginLeft: 24, marginBottom: 12 },
    bootcampCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, overflow: 'hidden' },
    bootcampGlow: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, opacity: 0.2 },
    bootcampHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    bootcampTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    bootcampTagText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    bootcampTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
    bootcampDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22, paddingRight: 20, marginBottom: 24 },
    bootcampFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16 },
    bootcampDuration: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
    bootcampPlayBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    bootcampPlayText: { fontSize: 13, fontWeight: '800' },
});
