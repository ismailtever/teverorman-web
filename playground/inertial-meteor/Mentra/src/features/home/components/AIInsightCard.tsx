import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { useI18n } from '@/services/i18n';
import { Colors } from '@/constants/Colors';
import { AnimatedCard } from '@/components/ui/Cards';
import { CognitiveProfile, RawGameSession } from '@/services/engine/types';

function deriveInsight(profile: CognitiveProfile | null, sessions: RawGameSession[], t: any): string {
  if (!profile || sessions.length === 0) {
    return t('insightFirstSession');
  }
  const scores = {
    focus: profile.focus, memory: profile.memory, speed: profile.speed,
    flexibility: profile.flexibility, problem_solving: profile.problem_solving,
  };
  const weakestKey = (Object.entries(scores) as [string, number][]).reduce((a, b) => a[1] < b[1] ? a : b)[0];
  const focusSessions = sessions.filter(s => s.gameId === 'grid-focus' || (s.gameId as string) === 'deep-focus');
  if (focusSessions.length >= 4) {
    const half = Math.floor(focusSessions.length / 2);
    const avgOlder = focusSessions.slice(0, half).reduce((a, s) => a + s.score, 0) / half;
    const avgNewer = focusSessions.slice(half).reduce((a, s) => a + s.score, 0) / (focusSessions.length - half);
    if (avgOlder > 0 && avgNewer > avgOlder) {
      const pct = Math.round(((avgNewer - avgOlder) / avgOlder) * 100);
      if (pct >= 5) return t('insightFocusImproving');
    }
  }

  // Maps API keys to frontend i18n domain keys
  const domainKeyMap: Record<string, string> = {
    flexibility: 'resilience',
    problem_solving: 'logic',
    focus: 'focus', memory: 'memory', speed: 'speed'
  };
  const localizedDomain = String(t(domainKeyMap[weakestKey] || weakestKey));
  return String(t('insightWeakDomain')).replace('{{domain}}', localizedDomain);
}

export const AIInsightCard = React.memo(({ profile, sessions }: { profile: CognitiveProfile | null; sessions: RawGameSession[] }) => {
  const { t } = useI18n();
  const text = deriveInsight(profile, sessions, t);
  return (
    <AnimatedCard entering={FadeInDown.delay(20).springify()} style={aiInsightStyles.card}>
      <View style={aiInsightStyles.badge}>
        <Sparkles size={12} color={Colors.mentra.brandPrimary} style={{ marginRight: 4 }} />
        <Text style={aiInsightStyles.badgeText}>{t('aiInsightBadge' as any)}</Text>
      </View>
      <Text style={aiInsightStyles.text}>{text}</Text>
    </AnimatedCard>
  );
});
AIInsightCard.displayName = 'AIInsightCard';

const aiInsightStyles = StyleSheet.create({
  card: {
    padding: 18, marginBottom: 16,
  },
  badge: {
    backgroundColor: Colors.mentra.brandPrimary + '15', borderRadius: 8, paddingHorizontal: 9,
    paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.mentra.brandPrimary + '30',
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.mentra.brandPrimary, letterSpacing: 0.8 },
  text: { fontSize: 14, fontWeight: '600', color: Colors.mentra.textDim, lineHeight: 21 },
});
