/**
 * DemoDataSeeder — __DEV__ only
 * Seeds realistic demo data into AsyncStorage for App Store screenshots.
 * Renders null in production builds.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';

const DEMO_COGNITIVE_PROFILE = {
  focus: 72,
  memory: 65,
  speed: 81,
  problem_solving: 58,
  flexibility: 60,
  stabilityOffset: 70,
  fatigueIndex: 20,
  impulseFactor: 15,
  lastUpdated: new Date().toISOString(),
  sessionCount: 12,
};

const now = Date.now();
const DAY_MS = 86_400_000;

function makeSession(
  gameId: string,
  daysAgo: number,
  score: number,
  accuracy: number,
  avgRT: number,
): object {
  const ts = new Date(now - daysAgo * DAY_MS).toISOString();
  return {
    sessionId: `demo-${gameId}-${daysAgo}-${Math.random().toString(36).slice(2, 6)}`,
    gameId,
    timestamp: ts,
    durationSeconds: 60,
    events: [],
    rtAllMs: [avgRT - 60, avgRT - 20, avgRT + 10, avgRT + 40, avgRT - 30],
    rtCorrectMs: [avgRT - 40, avgRT - 10, avgRT + 20],
    score,
    accuracy,
    avgReactionTime: avgRT,
    maxStreak: Math.round(score / 10),
  };
}

const DEMO_SESSIONS = [
  makeSession('grid-focus',      0, 540, 0.88, 620),
  makeSession('grid-focus',      2, 480, 0.82, 680),
  makeSession('memory-grid',     1, 320, 0.90, 950),
  makeSession('memory-grid',     4, 280, 0.84, 1020),
  makeSession('speed-match',     0, 730, 0.79, 390),
  makeSession('speed-match',     3, 680, 0.74, 430),
  makeSession('impulse-control', 1, 170, 0.85, 560),
  makeSession('impulse-control', 5, 140, 0.78, 610),
  makeSession('deep-focus',      2, 900, 1.00, 0),
  makeSession('dopamine-reset',  6, 220, 0.92, 0),
];

export function DemoDataSeeder() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Belt-and-suspenders: also guard inside function so the component is safe
  // if somehow imported in a production bundle.
  if (!__DEV__) return null;

  const handleSeed = async () => {
    setLoading(true);
    try {
      await Promise.all([
        AsyncStorage.setItem('mentra_cognitive_profile', JSON.stringify(DEMO_COGNITIVE_PROFILE)),
        AsyncStorage.setItem('mentra_global_score', '69'),
        AsyncStorage.setItem('mentra_total_xp', '1750'),
        AsyncStorage.setItem('mentra_session_history', JSON.stringify(DEMO_SESSIONS)),
        // Also set personal bests so XP panel shows PB bonus context
        AsyncStorage.setItem('mentra_pb_xp_grid-focus', '540'),
        AsyncStorage.setItem('mentra_pb_xp_memory-grid', '320'),
        AsyncStorage.setItem('mentra_pb_xp_speed-match', '730'),
        AsyncStorage.setItem('mentra_pb_xp_impulse-control', '170'),
        AsyncStorage.setItem('mentra_pb_xp_deep-focus', '900'),
        AsyncStorage.setItem('mentra_pb_xp_dopamine-reset', '220'),
        // Streak: 5-day streak
        AsyncStorage.setItem('mentra_streak', JSON.stringify({
          current: 5,
          longest: 7,
          lastPlayed: new Date(now - DAY_MS).toISOString().slice(0, 10),
          playedToday: false,
          isAtRisk: false,
        })),
      ]);
      setSeeded(true);
      Alert.alert(
        '✅ Demo Data Seeded',
        'Cognitive profile, sessions, XP and streak are now populated.\n\nNavigate away and back to reload each screen.',
      );
    } catch (e) {
      Alert.alert('❌ Seeding Failed', String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      const keys = [
        'mentra_cognitive_profile', 'mentra_global_score', 'mentra_total_xp',
        'mentra_session_history', 'mentra_streak',
        'mentra_pb_xp_grid-focus', 'mentra_pb_xp_memory-grid', 'mentra_pb_xp_speed-match',
        'mentra_pb_xp_impulse-control', 'mentra_pb_xp_deep-focus', 'mentra_pb_xp_dopamine-reset',
      ];
      await AsyncStorage.multiRemove(keys);
      setSeeded(false);
      Alert.alert('🗑️ Demo Data Cleared', 'All seeded data removed.');
    } catch (e) {
      Alert.alert('❌ Clear Failed', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🛠️ DEV: Screenshot Seeder</Text>
      <View style={styles.row}>
        <Pressable
          onPress={handleSeed}
          disabled={loading}
          style={[styles.btn, styles.btnSeed]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.btnText}>{seeded ? '✅ Re-Seed Data' : '🌱 Seed Demo Data'}</Text>
          )}
        </Pressable>
        <Pressable
          onPress={handleClear}
          disabled={loading}
          style={[styles.btn, styles.btnClear]}
        >
          <Text style={styles.btnText}>🗑️ Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: '#FFF3CD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSeed: {
    backgroundColor: Colors.mentra.brandPrimary,
  },
  btnClear: {
    backgroundColor: '#EF4444',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
});
