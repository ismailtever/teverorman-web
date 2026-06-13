import { create } from 'zustand';
import { CognitiveProfile, RawGameSession } from '@/services/engine/types';
import { StreakData, Streak } from '@/services/streak';
import { Storage } from '@/services/storage';
import { Progression } from '@/services/progression';

interface UserState {
  // Data
  isHydrated: boolean;
  userName: string;
  tierName: string;
  mentraScore: number;
  sessionCount: number;
  cognitiveProfile: CognitiveProfile | null;
  streakData: StreakData;
  recentSessions: RawGameSession[];

  // Actions
  hydrate: () => Promise<void>;
  updateSession: (session: RawGameSession) => Promise<void>;
}

const defaultStreak: StreakData = {
  current: 0,
  longest: 0,
  lastPlayed: null,
  playedToday: false,
  isAtRisk: false,
};

export const useUserStore = create<UserState>((set, get) => ({
  isHydrated: false,
  userName: 'Sen',
  tierName: 'NOVICE',
  mentraScore: 0,
  sessionCount: 0,
  cognitiveProfile: null,
  streakData: defaultStreak,
  recentSessions: [],

  hydrate: async () => {
    try {
      const [up, sd, score, sessions, totalXP, cogProfile] = await Promise.all([
        Storage.getUserProfile(),
        Streak.get(),
        Storage.getGlobalScore(),
        Storage.getRecentSessions(50),
        Progression.getTotalXP(),
        Storage.getCognitiveProfile(),
      ]);

      const lvlInfo = Progression.getLevelInfo(totalXP);

      set({
        isHydrated: true,
        userName: up?.name ? up.name.split(' ')[0] : 'Sen',
        tierName: lvlInfo.tierKey,
        mentraScore: score,
        sessionCount: sessions.length,
        cognitiveProfile: sessions.length > 0 ? cogProfile : null,
        streakData: sd || defaultStreak,
        recentSessions: sessions,
      });
    } catch (error) {
      console.error('Failed to hydrate user store:', error);
    }
  },

  updateSession: async (session: RawGameSession) => {
    // This action can be called right after a game finishes to immediately update UI
    // while backend/storage updates happen asynchronously.
    await get().hydrate(); // For now, just re-hydrate to keep it simple and accurate
  }
}));
