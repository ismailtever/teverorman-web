export type Stimulus = {
  position: number; // 0-8 (3x3 grid)
  audioId: string;  // e.g., 'A', 'B', 'C'
};

export type NBackSession = {
    n: number;
    trials: Stimulus[];
    responses: {
        positionMatch: boolean;
        audioMatch: boolean;
    }[];
};

export class ScienceEngine {
  /**
   * Dual N-Back Logic
   * Validates if the current stimulus matches the one N steps back.
   */
  static isMatch(current: Stimulus, previous: Stimulus): { position: boolean; audio: boolean } {
    return {
      position: current.position === previous.position,
      audio: current.audioId === previous.audioId,
    };
  }

  /**
   * Stroop Effect Logic
   * Incongruent stimuli (Word 'Red' in Green color) are used to train inhibition.
   */
  static generateStroopTask() {
    const colors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B']; // Red, Green, Blue, Yellow
    const colorNames = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
    
    const wordIndex = Math.floor(Math.random() * colorNames.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    return {
        word: colorNames[wordIndex],
        color: colors[colorIndex],
        isIncongruent: wordIndex !== colorIndex,
        correctColor: colors[wordIndex],
    };
  }

  /**
   * HRV (Heart Rate Variability) - Simulated Analysis
   * Based on R-R interval consistency.
   */
  static calculateResilienceScore(intervals: number[]): number {
    if (intervals.length < 2) return 0;
    // Simple RMSSD (Root Mean Square of Successive Differences) calculation
    let sumDiffSq = 0;
    for (let i = 0; i < intervals.length - 1; i++) {
        sumDiffSq += Math.pow(intervals[i+1] - intervals[i], 2);
    }
    const rmssd = Math.sqrt(sumDiffSq / (intervals.length - 1));
    // Normalize score 0-100 (standard human range for RMSSD is ~20-100)
    return Math.min(Math.max((rmssd - 20) * 1.25, 0), 100);
  }
}
