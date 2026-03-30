/**
 * Single Source of Truth for Colors.
 * Mentra 2.0: Premium "Calm" AI Life Coach aesthetic.
 */

const MentraBrand = {
    primaryLight: '#194031', // Deep Forest (Light mode primary)
    primaryDark: '#4ADE80',  // Mint (Dark mode primary)
    secondaryLight: '#4ADE80', // Mint Accent (Light mode secondary)
    secondaryDark: '#20503D',  // Deep Green Accent (Dark mode secondary)
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
};

export const Colors = {
    // Legacy support for navigation/system elements. Use tokens instead.
    light: {
        text: '#1A1F1C',
        background: '#F8FAF9',
        tint: MentraBrand.primaryLight,
        icon: '#64746B',
        tabIconDefault: '#94A3B8',
        tabIconSelected: MentraBrand.primaryLight,
    },
    dark: {
        text: '#F8FAF9',
        background: '#0A0D0B',
        tint: MentraBrand.primaryDark,
        icon: '#94A3B8',
        tabIconDefault: '#475569',
        tabIconSelected: MentraBrand.primaryDark,
    },

    // Modern Token-Based System (Mentra Phase 2)
    mentra: {
        ...MentraBrand,
        brandPrimary: MentraBrand.primaryLight, // Fallbacks for existing components
        brandSecondary: MentraBrand.secondaryLight,
        brandAccent: MentraBrand.secondaryLight,

        // Light Mode Tokens (Default unless handled by context wrapper)
        bg: '#F8FAF9',
        surface: '#FFFFFF',
        surface2: '#F0F4F2',

        text: '#1A1F1C',
        textDim: '#64746B',
        muted: '#94A3B8',

        border: '#E2E8E4',
        divider: '#F0F4F2',

        darkTokens: {
            bg: '#0A0D0B',
            surface: '#121614',
            surface2: '#1A201D',
            text: '#F8FAF9',
            textDim: '#94A3B8',
            muted: '#475569',
            border: '#2A342E',
            divider: '#1A201D',
        },

        glass: {
            background: 'rgba(255, 255, 255, 0.7)',
            border: 'rgba(25, 64, 49, 0.15)',
        },
        gradients: {
            primary: [MentraBrand.primaryLight, '#20503D'],
            secondary: ['#20503D', MentraBrand.secondaryLight],
        },
        paywall: {
            background: '#0A0D0B',
            backgroundAlt: '#121614',
            primary: '#194031',
            accent: '#4ADE80',
            text: '#F8FAF9',
            textDim: '#94A3B8',
            glass: {
                background: 'rgba(255,255,255,0.05)',
                border: 'rgba(74,222,128,0.2)',
            }
        }
    }
};
