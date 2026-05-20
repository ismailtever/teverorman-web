/**
 * Paywall screens are always rendered in forced-dark mode,
 * independent of the system light/dark setting.
 * Import PW from here instead of Colors.mentra.paywall.
 */
export const PW = {
    background: '#0A0D0B',
    backgroundAlt: '#121614',
    primary: '#194031',
    accent: '#4ADE80',
    text: '#F8FAF9',
    textDim: '#94A3B8',
    glass: {
        background: 'rgba(255,255,255,0.05)',
        border: 'rgba(74,222,128,0.2)',
    },
} as const;
