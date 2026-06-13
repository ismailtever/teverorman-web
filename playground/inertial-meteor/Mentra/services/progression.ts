import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from './notifications';

const XP_KEY = 'mentra_total_xp';

// 50-level threshold table (index = level - 1)
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350,          // Noise   (1–7)
  1750, 2200, 2700, 3300, 3950, 4650, 5400, 6200, // Signal  (8–15)
  7100, 8100, 9200, 10400, 11700, 13100, 14600, 16200, 17900, 19700, // Clarity (16–25)
  21600, 23600, 25700, 27900, 30200, 32600, 35100, 37700, 40400, 43200, // Edge (26–35)
  46100, 49100, 52200, 55400, 58700, 62100, 65600, 69200, 72900, 76700, // Flow (36–45)
  80600, 84600, 88700, 92900, 97200,           // Timeless (46–50)
];

export interface Tier {
  key: string;  // i18n key
  name: string; // English fallback
  minLevel: number;
  maxLevel: number;
}

export const TIERS: Tier[] = [
  { key: 'tierNoise',    name: 'Noise',    minLevel: 1,  maxLevel: 7  },
  { key: 'tierSignal',   name: 'Signal',   minLevel: 8,  maxLevel: 15 },
  { key: 'tierClarity',  name: 'Clarity',  minLevel: 16, maxLevel: 25 },
  { key: 'tierEdge',     name: 'Edge',     minLevel: 26, maxLevel: 35 },
  { key: 'tierFlow',     name: 'Flow',     minLevel: 36, maxLevel: 45 },
  { key: 'tierTimeless', name: 'Timeless', minLevel: 46, maxLevel: 50 },
];

export interface LevelInfo {
  level: number;
  tierKey: string;
  tierName: string;
  currentXP: number;  // XP within current level
  nextLevelXP: number; // XP needed to reach next level
  progress: number;   // 0–1
}

export interface XPResult {
  xpGained: number;
  totalXP: number;
  leveledUp: boolean;
  newLevel: number;
  newTierKey: string;
  newTierName: string;
  prevTierKey: string;
}

export interface RealProgress {
  reactionImprovement: number | null; // ms faster (positive = improved)
  accuracyImprovement: number | null; // % points higher (positive = improved)
  consistencyDays: number;
}

export interface DailyPlayInfo {
  playsToday: number;     // How many times played today (after this session)
  comboBonus: number;     // XP bonus earned from consecutive plays today
}

function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 50);
}

function getTierForLevel(level: number): Tier {
  return TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) ?? TIERS[0];
}

export const Progression = {
  getLevelInfo(xp: number): LevelInfo {
    const level = getLevelFromXP(xp);
    const idx = level - 1;
    const tier = getTierForLevel(level);
    const thisThreshold = LEVEL_THRESHOLDS[idx];
    const nextThreshold =
      idx + 1 < LEVEL_THRESHOLDS.length
        ? LEVEL_THRESHOLDS[idx + 1]
        : LEVEL_THRESHOLDS[idx] + 5000;
    const xpInLevel = xp - thisThreshold;
    const xpForLevel = nextThreshold - thisThreshold;
    return {
      level,
      tierKey: tier.key,
      tierName: tier.name,
      currentXP: xpInLevel,
      nextLevelXP: xpForLevel,
      progress: Math.min(1, xpInLevel / xpForLevel),
    };
  },

  async getTotalXP(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(XP_KEY);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  },

  // accuracy: 0–100 range expected
  async addXP(gameId: string, score: number, accuracy: number): Promise<XPResult> {
    try {
      const prevXP = await this.getTotalXP();
      const prevLevel = getLevelFromXP(prevXP);
      const prevTier = getTierForLevel(prevLevel);

      // Level-based multiplier: higher levels earn XP faster to offset the steeper curve
      const multiplier =
        prevLevel <= 10 ? 1.0 :
        prevLevel <= 20 ? 1.2 :
        prevLevel <= 35 ? 1.5 : 2.0;

      let xpGained = Math.round(10 * multiplier); // base x level multiplier
      if (accuracy >= 80) xpGained += Math.round(5 * multiplier); // accuracy bonus

      // Personal best bonus (fixed 10 XP, not scaled by difficulty to keep it a rare treat)
      const pbKey = `mentra_pb_xp_${gameId}`;
      const pbVal = await AsyncStorage.getItem(pbKey);
      const pb = pbVal ? parseInt(pbVal, 10) : 0;
      if (score > pb) {
        xpGained += 10;
        await AsyncStorage.setItem(pbKey, String(score));
      }

      // Daily play combo bonus
      const today = new Date().toISOString().slice(0, 10);
      const dailyKey = `mentra_daily_plays_${gameId}_${today}`;
      const dailyVal = await AsyncStorage.getItem(dailyKey);
      const playsToday = dailyVal ? parseInt(dailyVal, 10) : 0;
      const newPlaysToday = playsToday + 1;
      await AsyncStorage.setItem(dailyKey, String(newPlaysToday));
      let comboBonus = 0;
      if (newPlaysToday === 2) comboBonus = 5;
      else if (newPlaysToday >= 3) comboBonus = 10;
      xpGained += comboBonus;

      const totalXP = prevXP + xpGained;
      const newLevel = getLevelFromXP(totalXP);
      const newTier = getTierForLevel(newLevel);
      await AsyncStorage.setItem(XP_KEY, String(totalXP));

      // Intelligent Reminders: Bump today's reminder since user just played
      await NotificationService.cancelStreakReminderForToday();

      return {
        xpGained,
        totalXP,
        leveledUp: newLevel > prevLevel,
        newLevel,
        newTierKey: newTier.key,
        newTierName: newTier.name,
        prevTierKey: prevTier.key,
      };
    } catch {
      return {
        xpGained: 10,
        totalXP: 10,
        leveledUp: false,
        newLevel: 1,
        newTierKey: TIERS[0].key,
        newTierName: TIERS[0].name,
        prevTierKey: TIERS[0].key,
      };
    }
  },

  async getDailyPlays(gameId: string): Promise<DailyPlayInfo> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const dailyKey = `mentra_daily_plays_${gameId}_${today}`;
      const val = await AsyncStorage.getItem(dailyKey);
      const playsToday = val ? parseInt(val, 10) : 0;
      let comboBonus = 0;
      if (playsToday === 2) comboBonus = 5;
      else if (playsToday >= 3) comboBonus = 10;
      return { playsToday, comboBonus };
    } catch {
      return { playsToday: 0, comboBonus: 0 };
    }
  },

  async getRealProgress(gameId: string): Promise<RealProgress> {
    try {
      const json = await AsyncStorage.getItem('mentra_session_history');
      if (!json) return { reactionImprovement: null, accuracyImprovement: null, consistencyDays: 0 };
      const all: any[] = JSON.parse(json);
      const sessions = all.filter(s => s.gameId === gameId).slice(-12);

      // Require ≥6 sessions — with only 3, slice(0,3) and slice(-3) are identical
      if (sessions.length < 6) {
        return { reactionImprovement: null, accuracyImprovement: null, consistencyDays: 0 };
      }

      const early = sessions.slice(0, 3);
      const recent = sessions.slice(-3);

      const avgRT = (arr: any[]) => {
        const vals = arr.map(s => s.avgReactionTime || 0).filter(v => v > 0);
        return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
      };
      const avgAcc = (arr: any[]) => {
        const vals = arr.map(s => {
          const a = s.accuracy || 0;
          return a <= 1 ? a * 100 : a;
        });
        return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
      };

      const earlyRT = avgRT(early);
      const recentRT = avgRT(recent);
      const reactionImprovement =
        earlyRT > 0 && recentRT > 0 ? Math.round(earlyRT - recentRT) : null;
      const accuracyImprovement = Math.round(avgAcc(recent) - avgAcc(early));

      const days = new Set(sessions.map(s => (s.timestamp || '').slice(0, 10)));

      return {
        reactionImprovement,
        accuracyImprovement,
        consistencyDays: days.size,
      };
    } catch {
      return { reactionImprovement: null, accuracyImprovement: null, consistencyDays: 0 };
    }
  },
};
