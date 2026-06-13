import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sparkles, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '@/services/i18n';
import { Colors } from '@/constants/Colors';
import { AnimatedCard } from '@/components/ui/Cards';
import { ScalePressable } from '@/src/shared/ui/interactions/ScalePressable';

export const DailySessionCard = React.memo(() => {
  const { t } = useI18n();
  return (
    <ScalePressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/training/daily-session' as any); }}
        style={{ marginBottom: 22 }}
    >
      <AnimatedCard 
          entering={FadeInDown.delay(80).springify()}
          style={styles.dailyCard}
        >
          <LinearGradient colors={[Colors.mentra.surface, Colors.mentra.bg] as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.dailyLeft}>
            <View style={styles.dailyTag}>
              <Sparkles size={10} color={Colors.mentra.brandPrimary} />
              <Text style={styles.dailyTagText}>{t('dailyWorkoutTag' as any)}</Text>
            </View>
            <Text style={styles.dailyTitle}>{t('dailyTrainingTitle' as any)}</Text>
            <Text style={styles.dailyDesc}>{t('dailyTrainingSubtitle' as any)}</Text>
            <View style={styles.dailyMeta}>
              <View style={styles.dailyDot} />
              <Text style={styles.dailyMetaText}>{t('adaptiveDifficulty' as any)}</Text>
            </View>
          </View>
          <View style={styles.dailyPlayBtn}>
            <Play size={20} color={Colors.mentra.surface} fill={Colors.mentra.surface} />
          </View>
        </AnimatedCard>
      </ScalePressable>
  );
});
DailySessionCard.displayName = 'DailySessionCard';

const styles = StyleSheet.create({
  dailyCard: {
    borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 22, overflow: 'hidden', borderWidth: 1, borderColor: Colors.mentra.brandSecondary + '50',
    backgroundColor: Colors.mentra.surface,
  },
  dailyLeft: { flex: 1, gap: 4 },
  dailyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  dailyTagText: { fontSize: 9, fontWeight: '800', color: Colors.mentra.brandPrimary, letterSpacing: 1.5 },
  dailyTitle: { fontSize: 22, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.5 },
  dailyDesc: { fontSize: 13, color: Colors.mentra.textDim, fontWeight: '500' },
  dailyMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  dailyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.mentra.success },
  dailyMetaText: { fontSize: 11, color: Colors.mentra.textDim, fontWeight: '600' },
  dailyPlayBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.mentra.brandPrimary,
    alignItems: 'center', justifyContent: 'center', paddingLeft: 3,
  },
});
