import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Zap, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { I18n } from '@/services/i18n';
import { XPResult, RealProgress } from '@/services/progression';

interface XPResultPanelProps {
  xpResult: XPResult | null;
  realProgress: RealProgress | null;
}

export function XPResultPanel({ xpResult, realProgress }: XPResultPanelProps) {
  if (!xpResult) return null;

  let improvementText = '';
  if (realProgress) {
    if (realProgress.reactionImprovement !== null && realProgress.reactionImprovement > 20) {
      // @ts-ignore
      improvementText = (I18n.t('improvementReaction') as string)
        .replace('%{ms}', String(realProgress.reactionImprovement));
    } else if (realProgress.accuracyImprovement !== null && realProgress.accuracyImprovement > 2) {
      // @ts-ignore
      improvementText = (I18n.t('improvementAccuracy') as string)
        .replace('%{pct}', String(realProgress.accuracyImprovement));
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(150).duration(500)} style={styles.xpBadge}>
        <Zap size={14} color={Colors.mentra.brandPrimary} />
        <Text style={styles.xpText}>+{xpResult.xpGained} XP</Text>
      </Animated.View>
      {improvementText.length > 0 && (
        <Animated.View entering={FadeInUp.delay(350).duration(400)} style={styles.improvement}>
          <TrendingUp size={13} color={Colors.mentra.success} />
          <Text style={styles.improvementText}>{improvementText}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8, marginBottom: 12 },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.mentra.brandPrimary + '18',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.mentra.brandPrimary + '35',
  },
  xpText: { fontSize: 15, fontWeight: '800', color: Colors.mentra.brandPrimary },
  improvement: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.mentra.success + '12',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7,
    maxWidth: 280,
  },
  improvementText: {
    fontSize: 12, fontWeight: '600', color: Colors.mentra.text, lineHeight: 18, flex: 1,
  },
});
