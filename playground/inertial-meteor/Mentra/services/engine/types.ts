// Cognitive Engine Interfaces

// 1. Raw Game Metrics
export interface GameEvent {
    timestamp: number; // ms since epoch
    timeOffset: number; // ms from game start
    type: 'stimulus' | 'input' | 'timeout' | 'level_up' | 'game_over';
    data?: any; // e.g. { expected: 'square', actual: 'circle', reactionTime: 300 }
    isCorrect?: boolean;
}

export interface RawGameSession {
    sessionId: string;
    gameId: 'speed-match' | 'memory-grid' | 'focus-flow' | 'grid-focus' | 'impulse-control' | 'dopamine-reset';
    timestamp: string; // ISO Date
    durationSeconds: number;

    // Telemetry Arrays
    // Standardized New Fields
    events: GameEvent[];
    rtAllMs: number[];      // All inputs (correct + incorrect) -> For Fatigue/Impulse/Stability
    rtCorrectMs: number[];  // Correct inputs only -> For Speed Score

    // Legacy Support (Optional) - old sessions might have 'reactionTimes'
    reactionTimes?: number[];

    // Aggregate stats
    score: number;
    accuracy: number; // 0-1 (Ratio of correct to total)
    avgReactionTime: number; // ms (calculated from rtCorrectMs)
    maxStreak: number;
}

// 2. Normalized Cognitive Profile (The Vector)
export interface CognitiveProfile {
    // Core Dimensions (0-100)
    memory: number;
    focus: number;
    speed: number;
    flexibility: number;
    problem_solving: number;

    // Behavioral/Meta Dimensions
    stabilityOffset: number; // 0-100 (100 = perfectly stable)
    fatigueIndex: number;    // 0-100 (100 = exhausted)
    impulseFactor: number;   // 0-100 (100 = reckless)
}

// 3. Adaptive Mission
export interface DailyMission {
    id: string;
    title: string;
    description: string;
    focusArea: keyof CognitiveProfile;
    difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    games: string[];
}
