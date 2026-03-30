import { Storage } from '@/services/storage';

export interface DomainLevel {
    memory: number;
    speed: number;
    flexibility: number;
}

export const ProgressionEngine = {
    // Determine current level for a domain (1-20)
    async getDomainLevels(): Promise<DomainLevel> {
        // Read from Storage or default to 1 (Requires adding 'levels' to CognitiveProfile later)
        const profile = await Storage.getCognitiveProfile();
        // @ts-ignore
        return profile?.levels || {
            memory: 1,
            speed: 1,
            flexibility: 1
        };
    },

    // Evaluate rolling performance and update levels
    async evaluateSession(domain: 'memory' | 'speed' | 'flexibility', accuracy: number, rt: number, stability: number) {
        // Fetch last 3 sessions
        const history = await Storage.getRecentSessions(30);
        // @ts-ignore
        const domainHistory = history.filter(s => s.domain === domain).slice(-3);

        // Rolling diff logic
        let diffBump = 0;
        if (domainHistory.length >= 2) {
            // @ts-ignore
            const recentAcc = domainHistory.slice(-2).map(s => s.accuracy);
            if (recentAcc.every(a => a > 85) && accuracy > 85) {
                diffBump = 1;
            } else if (recentAcc.every(a => a < 60) && accuracy < 60) {
                diffBump = -1;
            }
        }

        if (diffBump !== 0) {
            const levels = await this.getDomainLevels();
            levels[domain] = Math.max(1, Math.min(20, levels[domain] + diffBump));

            // Save back to profile
            const profile = await Storage.getCognitiveProfile() || {
                radarMetrics: [], sessionsCompleted: 0, highestStreak: 0
            }; // Base profile

            // @ts-ignore
            profile.levels = levels;
            await Storage.saveCognitiveProfile(profile as any);
        }
    },

    // Get parameters for the current level (used by minigames)
    getMemoryParams(level: number) {
        // Knobs: size, sequence, decoys
        return {
            gridSize: level > 10 ? 4 : 3,
            sequenceLength: Math.min(3 + Math.floor(level / 3), 9),
            hasDecoys: level > 15
        };
    },

    getSpeedParams(level: number) {
        return {
            tempoMs: Math.max(400, 1000 - (level * 25)),
            responseWindowMs: Math.max(500, 1500 - (level * 40))
        };
    },

    getFlexibilityParams(level: number) {
        return {
            ruleSwitchOccurrences: level > 5 ? 1 : 0,
            dualTaskIntensity: level > 12 ? 'medium' : (level > 8 ? 'light' : 'none')
        };
    },

    getWeeklyTheme(): string {
        // Simple logic based on week of year
        const week = getWeekNumber(new Date());
        const themes = [
            "Focus Foundation",
            "Speed & Clarity",
            "Structured Thinking",
            "Mental Endurance"
        ];
        return themes[week % themes.length];
    }
};

function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
