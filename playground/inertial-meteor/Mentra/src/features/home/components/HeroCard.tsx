import React from 'react';
import { View, Text, Pressable, StyleSheet, I18nManager } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { Flame, ChevronRight, TrendingUp, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useI18n } from '@/services/i18n';
import { Colors } from '@/constants/Colors';
import { SanctuaryCard } from '@/components/ui/Cards';

const DailyGoalRing = React.memo(({ sessionsToday, size = 84 }: { sessionsToday: number; size?: number }) => {
  const { t } = useI18n();
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(sessionsToday / 3, 1);
  const dash = progress * circumference;
  const pct = Math.round(progress * 100);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <SvgCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={Colors.mentra.border + '50'} strokeWidth={strokeWidth} fill="none"
        />
        {progress > 0 && (
          <SvgCircle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={Colors.mentra.success} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>
      <Text style={{ fontSize: size * 0.22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 }} numberOfLines={1} adjustsFontSizeToFit>{pct}%</Text>
      <Text style={{ fontSize: size * 0.10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 }} numberOfLines={1} adjustsFontSizeToFit>{t('today' as any).toUpperCase()}</Text>
    </View>
  );
});
DailyGoalRing.displayName = 'DailyGoalRing';

export const HeroCard = React.memo(({ score, streak, name, sessionCount, trend, tierName, isAtRisk, sessionsToday }: {
  score: number; streak: number; name: string; sessionCount: number; trend: number;
  tierName: string; isAtRisk: boolean; sessionsToday: number;
}) => {
  const { t } = useI18n();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('goodMorning') : hour < 18 ? t('goodAfternoon') : t('goodEvening');
  const tagline = score >= 80 ? t('peakForm') : score >= 60 ? t('steadyProgress') : t('warmingUp');

  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.heroWrapper}>
      <SanctuaryCard 
        gradient={Colors.mentra.gradients.primary as any}
        glowColor={Colors.mentra.brandAccent}
        style={styles.heroCard}
      >
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.heroProtectionBadge}>
              <ShieldCheck size={10} color={Colors.mentra.brandAccent} />
              <Text style={styles.heroProtectionText}>{t('protectionActiveShort')}</Text>
            </View>
            <Text style={styles.heroGreeting} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{greeting}, {name}</Text>
            {tierName ? <Text style={styles.heroTier} numberOfLines={1} adjustsFontSizeToFit>{tierName}</Text> : null}
            <Text style={styles.heroTagline} numberOfLines={1} adjustsFontSizeToFit>{tagline}</Text>
            <Text style={styles.heroScoreInline} numberOfLines={1} adjustsFontSizeToFit>{sessionCount === 0 ? '--' : score}{' '}<Text style={styles.heroScoreInlineLabel}>{(t('score' as any) as string).toUpperCase()}</Text></Text>
          </View>
          <DailyGoalRing sessionsToday={sessionsToday} />
        </View>
        <Pressable 
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/activity' as any); }}
          style={styles.heroStats}
        >
          <View style={styles.heroStat}>
            <Flame size={14} color={Colors.mentra.warning} />
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
            <Text style={styles.heroStatLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{t('sessions' as any)}</Text>
          </View>
          <View style={{ marginStart: 8 }}>
            <ChevronRight size={14} color={Colors.mentra.surface + '4D'} style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
          </View>
        </Pressable>
        {isAtRisk && (
          <View style={styles.streakRiskBadge}>
            <Flame size={12} color={Colors.mentra.warning} />
            <Text style={styles.streakRiskText}>{t('streakAtRisk' as any)}</Text>
          </View>
        )}
      </SanctuaryCard>
    </Animated.View>
  );
});
HeroCard.displayName = 'HeroCard';

const styles = StyleSheet.create({
  heroWrapper: { marginBottom: 16, marginTop: 8 },
  heroCard: {
    borderRadius: 24, padding: 22, overflow: 'hidden', backgroundColor: Colors.mentra.surface,
    borderWidth: 1, borderColor: Colors.mentra.border,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  heroGreeting: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  heroTier: { fontSize: 11, fontWeight: '800', color: Colors.mentra.brandSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },
  heroProtectionBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, 
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  heroProtectionText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' },
  heroTagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  heroScoreInline: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5, marginTop: 10 },
  heroScoreInlineLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  heroStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.mentra.surface2, borderWidth: 1, borderColor: Colors.mentra.border, borderRadius: 16, padding: 12 },
  heroStat: { flex: 1, alignItems: 'center', gap: 3 },
  heroStatVal: { fontSize: 16, fontWeight: '900', color: Colors.mentra.text },
  heroStatLabel: { fontSize: 10, color: Colors.mentra.textDim, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroStatDivider: { width: 1, height: 28, backgroundColor: Colors.mentra.border },
  streakRiskBadge: {
    backgroundColor: Colors.mentra.warning + '25', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.mentra.warning + '4D',
  },
  streakRiskText: { fontSize: 11, fontWeight: '700', color: Colors.mentra.warning },
});
