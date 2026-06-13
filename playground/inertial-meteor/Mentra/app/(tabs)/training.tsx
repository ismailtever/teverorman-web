import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Polygon, Line } from 'react-native-svg';
import Animated, { FadeInUp, SlideInRight, useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';
import { BrainCircuit, Activity, RotateCcw, Target, ShieldPlus, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Metrics } from '@/constants/Theme';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { I18n } from '@/services/i18n';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.75;
const CENTER = CHART_SIZE / 2;
const RADIUS = CHART_SIZE * 0.35;

// ─── Dimensions config ────────────────────────────────────────────────────────
const DIM_KEYS = ['focus', 'memory', 'logic', 'speed', 'resilience'] as const;
type DimKey = typeof DIM_KEYS[number];

const DIM_CONFIG: Record<DimKey, { labelKey: string; icon: any; color: string }> = {
    focus:      { labelKey: 'dimFocus',      icon: Target,      color: '#6C63FF' },
    memory:     { labelKey: 'dimMemory',     icon: BrainCircuit, color: '#3B82F6' },
    logic:      { labelKey: 'dimLogic',      icon: Activity,    color: '#F59E0B' },
    speed:      { labelKey: 'dimSpeed',      icon: Zap,         color: '#10B981' },
    resilience: { labelKey: 'dimResilience', icon: ShieldPlus,  color: '#8B5CF6' },
};

// ─── Worklet-safe coordinate helper ──────────────────────────────────────────
function getCoords(value: number, index: number, total: number) {
    'worklet';
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
        x: CENTER + RADIUS * value * Math.cos(angle),
        y: CENTER + RADIUS * value * Math.sin(angle),
    };
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DiagnosticsScreen() {
    const C = useMentraTheme();
    const insets = useSafeAreaInsets();
    const [, forceUpdate] = useState(0);

    const [scores, setScores] = useState<Record<DimKey, number>>({
        focus: 40, memory: 60, logic: 55, speed: 70, resilience: 45,
    });
    const [lowestKey, setLowestKey] = useState<DimKey>('focus');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Subscribe to language changes
    useEffect(() => I18n.subscribe(() => forceUpdate(n => n + 1)), []);

    // Animated values per dimension
    const aFocus      = useSharedValue(0);
    const aMemory     = useSharedValue(0);
    const aLogic      = useSharedValue(0);
    const aSpeed      = useSharedValue(0);
    const aResilience = useSharedValue(0);

    const animMap: Record<DimKey, typeof aFocus> = {
        focus: aFocus, memory: aMemory, logic: aLogic, speed: aSpeed, resilience: aResilience,
    };

    const animateTo = (s: Record<DimKey, number>) => {
        DIM_KEYS.forEach(k => {
            animMap[k].value = withSpring(s[k] / 100, { damping: 12 });
        });
    };

    const findLowest = (s: Record<DimKey, number>): DimKey => {
        let low: DimKey = 'focus';
        let min = 100;
        DIM_KEYS.forEach(k => { if (s[k] < min) { min = s[k]; low = k; } });
        return low;
    };

    useEffect(() => {
        animateTo(scores);
        setLowestKey(findLowest(scores));
    }, []);

    const handleRecalibrate = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setIsAnalyzing(true);
        animateTo({ focus: 5, memory: 5, logic: 5, speed: 5, resilience: 5 });
        setTimeout(() => {
            const next: Record<DimKey, number> = {
                focus:      Math.floor(Math.random() * 40) + 30,
                memory:     Math.floor(Math.random() * 50) + 40,
                logic:      Math.floor(Math.random() * 60) + 40,
                speed:      Math.floor(Math.random() * 50) + 30,
                resilience: Math.floor(Math.random() * 40) + 50,
            };
            setScores(next);
            animateTo(next);
            setLowestKey(findLowest(next));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsAnalyzing(false);
        }, 1500);
    };

    // Animated polygon points — uses worklet-safe getCoords
    const animatedProps = useAnimatedProps(() => {
        'worklet';
        const pts = DIM_KEYS.map((k, i) => {
            const { x, y } = getCoords(animMap[k].value, i, DIM_KEYS.length);
            return `${x},${y}`;
        }).join(' ');
        return { points: pts };
    });

    const lowestCfg = DIM_CONFIG[lowestKey];

    // Static grid polygon points
    const gridPolygons = [0.2, 0.4, 0.6, 0.8, 1].map(level =>
        DIM_KEYS.map((_, i) => {
            const { x, y } = getCoords(level, i, DIM_KEYS.length);
            return `${x},${y}`;
        }).join(' ')
    );

    // Axis lines
    const axisLines = DIM_KEYS.map((_, i) => getCoords(1.1, i, DIM_KEYS.length));

    // Label positions
    const labelPositions = DIM_KEYS.map((k, i) => ({
        ...getCoords(1.28, i, DIM_KEYS.length),
        cfg: DIM_CONFIG[k],
        key: k,
    }));

    const styles = makeStyles(C);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style={C.statusBar} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: C.text }]}>{I18n.t('diagTitle')}</Text>
                <Pressable
                    onPress={handleRecalibrate}
                    disabled={isAnalyzing}
                    style={({ pressed }) => [styles.recalcBtn, { backgroundColor: C.brandPrimary + '15' }, pressed && { opacity: 0.7 }]}
                >
                    <RotateCcw size={16} color={C.brandPrimary} />
                    <Text style={[styles.recalcText, { color: C.brandPrimary }]}>{I18n.t('diagRecalibrate')}</Text>
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Radar Chart */}
                <Animated.View entering={FadeInUp.delay(100)} style={styles.chartContainer}>
                    <Svg width={CHART_SIZE} height={CHART_SIZE} style={{ alignSelf: 'center' }}>
                        {/* Grid web */}
                        {gridPolygons.map((pts, i) => (
                            <Polygon key={i} points={pts} stroke={C.border} strokeWidth="1" fill="none" opacity={0.5} />
                        ))}
                        {/* Axis lines */}
                        {axisLines.map((pt, i) => (
                            <Line key={i} x1={CENTER} y1={CENTER} x2={pt.x} y2={pt.y} stroke={C.border} strokeWidth="1" opacity={0.5} />
                        ))}
                        {/* Animated skill polygon */}
                        <AnimatedPolygon
                            animatedProps={animatedProps}
                            fill={C.brandSecondary + '40'}
                            stroke={C.brandPrimary}
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                    </Svg>

                    {/* Floating dimension labels */}
                    {labelPositions.map(({ x, y, cfg, key }) => {
                        const Icon = cfg.icon;
                        const isLowest = key === lowestKey;
                        return (
                            <View key={key} style={[styles.labelWrapper, { left: x - 32, top: y - 22 }]}>
                                <Icon size={15} color={isLowest ? C.danger : C.textDim} />
                                <Text style={[styles.labelText, { color: isLowest ? C.danger : C.textDim, fontWeight: isLowest ? '800' : '600' }]}>
                                    {I18n.t(cfg.labelKey)}
                                </Text>
                            </View>
                        );
                    })}

                    {/* Center dot */}
                    <View style={[styles.chartCore, { backgroundColor: C.brandPrimary }]} />
                </Animated.View>

                {/* Cognitive Profile Card */}
                <Animated.View entering={FadeInUp.delay(300)} style={[styles.analysisCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <Text style={[styles.analysisHeader, { color: C.danger }]}>{I18n.t('diagCogProfile')}</Text>
                    <View style={styles.diagnosisRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.diagnosisTitle, { color: C.text }]}>{I18n.t('diagGrowthTitle')}</Text>
                            <Text style={[styles.diagnosisDesc, { color: C.textDim }]}>
                                {I18n.t('diagGrowthDesc', { dim: I18n.t(lowestCfg.labelKey) })}
                            </Text>
                        </View>
                        <View style={[styles.weaknessBadge, { backgroundColor: lowestCfg.color + '20' }]}>
                            <lowestCfg.icon size={32} color={lowestCfg.color} />
                        </View>
                    </View>
                </Animated.View>

                {/* Recommended Protocol */}
                <Animated.Text entering={FadeInUp.delay(400)} style={[styles.sectionTitle, { color: C.textDim }]}>
                    {I18n.t('diagProtocol')}
                </Animated.Text>

                <Animated.View entering={SlideInRight.springify().delay(500)}>
                    <Pressable
                        style={({ pressed }) => [styles.bootcampCard, { backgroundColor: C.brandPrimary }, pressed && { transform: [{ scale: 0.98 }] }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    >
                        <View style={[styles.bootcampGlow, { backgroundColor: C.brandSecondary }]} />
                        <View style={styles.bootcampHeader}>
                            <View style={styles.bootcampTag}>
                                <Text style={styles.bootcampTagText}>{I18n.t('diagProgram')}</Text>
                            </View>
                            <Target size={20} color="#FFF" opacity={0.8} />
                        </View>
                        <Text style={styles.bootcampTitle}>
                            {I18n.t('diagMastery', { dim: I18n.t(lowestCfg.labelKey) })}
                        </Text>
                        <Text style={styles.bootcampDesc}>
                            {I18n.t('diagBootcampDesc', { key: lowestKey })}
                        </Text>
                        <View style={styles.bootcampFooter}>
                            <Text style={styles.bootcampDuration}>{I18n.t('diagDuration')}</Text>
                            <View style={styles.bootcampPlayBtn}>
                                <Text style={[styles.bootcampPlayText, { color: C.brandPrimary }]}>{I18n.t('diagStartProgram')}</Text>
                            </View>
                        </View>
                    </Pressable>
                </Animated.View>

                <View style={{ height: Metrics.spacing.xl }} />
            </ScrollView>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: C.bg },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
        headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
        recalcBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
        recalcText: { fontSize: 13, fontWeight: '700' },
        scroll: { paddingBottom: 100 },

        chartContainer: { alignSelf: 'center', marginVertical: 32, width: CHART_SIZE, height: CHART_SIZE },
        chartCore: { position: 'absolute', top: CENTER - 4, left: CENTER - 4, width: 8, height: 8, borderRadius: 4 },
        labelWrapper: { position: 'absolute', width: 64, alignItems: 'center', justifyContent: 'center', gap: 3 },
        labelText: { fontSize: 9, letterSpacing: 0.5, textAlign: 'center' },

        analysisCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 32 },
        analysisHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
        diagnosisRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
        diagnosisTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
        diagnosisDesc: { fontSize: 13, lineHeight: 20 },
        weaknessBadge: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

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
}
