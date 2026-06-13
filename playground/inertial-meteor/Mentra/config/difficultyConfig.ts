import { I18n } from '@/services/i18n';

export function getDifficultyForLevel(level: number, gameId: string) {
  // Regional Optimization: East Asian cultures typically prefer steeper difficulty curves and faster visual feedback.
  const lang = I18n.getLanguage()?.split('-')[0] || 'en';
  const isEastAsian = ['ja', 'zh', 'ko'].includes(lang);
  const diffMultiplier = isEastAsian ? 1.2 : 1.0;

  if (gameId === 'grid-focus') {
    const baseTime = level <= 10 ? 60 : level <= 20 ? 55 : level <= 35 ? 50 : 45;
    return {
      gridLevel: level <= 10 ? 1 : level <= 20 ? 2 : level <= 35 ? 3 : 4,
      // Reduce time limit by up to 20% for East Asian locales
      timeSeconds: Math.round(baseTime / diffMultiplier),
    };
  }
  if (gameId === 'speed-match') {
    const baseStimulus = level <= 10 ? 3000 : level <= 20 ? 2000 : level <= 35 ? 1500 : 1000;
    return {
      // Faster auto-advance for Speed Match
      stimulusTimeLimit: Math.round(baseStimulus / diffMultiplier),
    };
  }
  if (gameId === 'memory-grid') {
    const baseLevel = level <= 10 ? 1 : level <= 20 ? 3 : level <= 35 ? 5 : 7;
    return {
      // Potentially start 1 level higher if multiplier is active
      startingLevel: isEastAsian ? baseLevel + 1 : baseLevel,
    };
  }
  if (gameId === 'impulse-control') {
    const baseNoGo = level <= 10 ? 0.25 : level <= 20 ? 0.35 : level <= 35 ? 0.45 : 0.55;
    return {
      // Increase the ratio of "No-Go" traps by up to 20%
      noGoRatio: Math.min(0.75, baseNoGo * diffMultiplier),
    };
  }
  if (gameId === 'deep-focus') {
    return {
      minDurationMinutes: level <= 10 ? 5 : level <= 20 ? 10 : level <= 35 ? 15 : 20,
    };
  }
  return {};
}

export function getDifficultyLabel(gameId: string, level: number): string {
  if (level <= 10) return I18n.t('difficultyBeginner');
  if (level <= 20) return I18n.t('difficultyIntermediate');
  if (level <= 35) return I18n.t('difficultyAdvanced');
  return I18n.t('difficultyElite');
}
