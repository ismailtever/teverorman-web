import { Lang } from '@/services/i18n';

export type GameId =
    | 'impulse-control'
    | 'grid-focus'
    | 'speed-match'
    | 'memory-grid'
    | 'deep-focus'
    | 'dopamine-reset';

/** Preferred display order of games per language. Unlisted languages fall back to `default`. */
export const GAME_ORDER: Partial<Record<Lang, GameId[]>> & { default: GameId[] } = {
    tr:      ['grid-focus', 'memory-grid', 'impulse-control', 'deep-focus', 'dopamine-reset', 'speed-match'],
    ar:      ['impulse-control', 'grid-focus', 'deep-focus', 'memory-grid', 'dopamine-reset', 'speed-match'],
    hi:      ['grid-focus', 'memory-grid', 'speed-match', 'impulse-control', 'deep-focus', 'dopamine-reset'],
    ko:      ['speed-match', 'grid-focus', 'memory-grid', 'impulse-control', 'deep-focus', 'dopamine-reset'],
    ja:      ['grid-focus', 'speed-match', 'memory-grid', 'deep-focus', 'impulse-control', 'dopamine-reset'],
    de:      ['deep-focus', 'impulse-control', 'grid-focus', 'memory-grid', 'speed-match', 'dopamine-reset'],
    nl:      ['deep-focus', 'impulse-control', 'grid-focus', 'memory-grid', 'speed-match', 'dopamine-reset'],
    fr:      ['speed-match', 'impulse-control', 'grid-focus', 'memory-grid', 'deep-focus', 'dopamine-reset'],
    zh:      ['speed-match', 'memory-grid', 'impulse-control', 'grid-focus', 'deep-focus', 'dopamine-reset'],
    it:      ['speed-match', 'impulse-control', 'memory-grid', 'grid-focus', 'deep-focus', 'dopamine-reset'],
    fi:      ['deep-focus', 'grid-focus', 'memory-grid', 'speed-match', 'impulse-control', 'dopamine-reset'],
    fa:      ['dopamine-reset', 'deep-focus', 'memory-grid', 'grid-focus', 'impulse-control', 'speed-match'],
    'pt-BR': ['speed-match', 'impulse-control', 'grid-focus', 'memory-grid', 'deep-focus', 'dopamine-reset'],
    es:      ['speed-match', 'impulse-control', 'grid-focus', 'memory-grid', 'deep-focus', 'dopamine-reset'],
    default: ['impulse-control', 'grid-focus', 'speed-match', 'memory-grid', 'deep-focus', 'dopamine-reset'],
};

/** Returns the ordered game-id list for the given language. */
export function getGameOrder(lang: Lang): GameId[] {
    return GAME_ORDER[lang] ?? GAME_ORDER.default;
}
