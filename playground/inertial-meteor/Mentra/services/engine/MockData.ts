import { CognitiveProfile, DailyMission } from './types';

// Generates a mock profile for visualizing the Radar Chart
export const MockCognitiveProfile: CognitiveProfile = {
    memory: 68,
    focus: 44,       // Weakness
    speed: 82,       // Strength
    flexibility: 55,
    problem_solving: 60,
    stabilityOffset: 72,
    fatigueIndex: 12, // Low fatigue
    impulseFactor: 38 // Elevated impulse
};

export const MockDailyMission: DailyMission = {
    id: 'mission-001',
    title: 'Focus Booster',
    description: "Your focus dropped 12% yesterday. Let's rebuild it.",
    focusArea: 'focus',
    difficulty: 'adaptive',
    games: ['speed-match']
};

export const MockTrendData = [
    { day: 'Mon', score: 65 },
    { day: 'Tue', score: 68 },
    { day: 'Wed', score: 62 },
    { day: 'Thu', score: 70 },
    { day: 'Fri', score: 75 },
    { day: 'Sat', score: 72 },
    { day: 'Sun', score: 78 },
];
