/**
 * Ramadan Service
 * Detects Ramadan period and provides fasting-aware recommendations.
 * Affects: Home screen banner, AI Coach context, training recommendations.
 *
 * Hijri calendar calculation is approximate (±1 day).
 * Ramadan 2025: March 1 – March 29
 * Ramadan 2026: February 18 – March 19
 * Ramadan 2027: February 7 – March 8
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const RAMADAN_PERIODS = [
    { year: 2025, start: new Date('2025-03-01'), end: new Date('2025-03-29') },
    { year: 2026, start: new Date('2026-02-18'), end: new Date('2026-03-19') },
    { year: 2027, start: new Date('2027-02-07'), end: new Date('2027-03-08') },
];

const RAMADAN_MODE_KEY = 'mentra_ramadan_mode';

export const RamadanService = {
    /**
     * Returns true if today falls within a known Ramadan period.
     */
    isRamadan(): boolean {
        const today = new Date();
        return RAMADAN_PERIODS.some(p => today >= p.start && today <= p.end);
    },

    /**
     * Returns true if user has manually enabled Ramadan mode OR auto-detected.
     */
    async isRamadanModeActive(): Promise<boolean> {
        const manual = await AsyncStorage.getItem(RAMADAN_MODE_KEY);
        if (manual === 'true') return true;
        if (manual === 'false') return false;
        return this.isRamadan(); // Auto-detect if not set
    },

    async setRamadanMode(active: boolean): Promise<void> {
        await AsyncStorage.setItem(RAMADAN_MODE_KEY, active ? 'true' : 'false');
    },

    /**
     * Returns cognitive phase based on fasting time.
     * Fasting hours: typically Fajr ~5am to Maghrib ~6-7pm (locale varies).
     */
    getFastingPhase(hour: number): 'pre_dawn' | 'morning_dip' | 'midday_peak' | 'late_afternoon_low' | 'iftar_recovery' | 'night_peak' {
        if (hour >= 3 && hour < 6)   return 'pre_dawn';        // Suhoor — fuel up
        if (hour >= 6 && hour < 10)  return 'morning_dip';     // Glucose drop begins
        if (hour >= 10 && hour < 14) return 'midday_peak';     // Ketone adaptation, ok focus
        if (hour >= 14 && hour < 18) return 'late_afternoon_low'; // Hardest — tired + hungry
        if (hour >= 18 && hour < 21) return 'iftar_recovery';  // Eating, rehydrating
        return 'night_peak';                                     // Most alert — best training time
    },

    /**
     * Returns a training recommendation based on fasting phase.
     */
    getTrainingRecommendation(hour: number): { title: string; desc: string; shouldTrain: boolean } {
        const phase = this.getFastingPhase(hour);
        const map: Record<ReturnType<typeof RamadanService.getFastingPhase>, { title: string; desc: string; shouldTrain: boolean }> = {
            pre_dawn:          { title: 'Suhoor Power Window 🌙', desc: 'Short 5-min focus exercise before Fajr is ideal.', shouldTrain: true },
            morning_dip:       { title: 'Light Mode Activated 🌅', desc: 'Mild cognitive work only. Avoid intense memory tasks.', shouldTrain: true },
            midday_peak:       { title: 'Ketone Focus Zone ⚡', desc: 'Your brain may adapt well. Light-medium training is fine.', shouldTrain: true },
            late_afternoon_low:{ title: 'Rest Window 😴', desc: 'Energy is lowest now. Best time to rest, not train.', shouldTrain: false },
            iftar_recovery:    { title: 'Iftar Recovery 🍽️', desc: 'Eat, hydrate. Wait 30-45 min before any cognitive training.', shouldTrain: false },
            night_peak:        { title: 'Night Peak 🌟', desc: 'This is your best cognitive window during Ramadan. Train now!', shouldTrain: true },
        };
        return map[phase];
    },
};
