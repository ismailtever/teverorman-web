import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';

interface BadgeProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warn' | 'danger' | 'ghost';
    style?: ViewStyle;
}

function getBadgeColors(variant: BadgeProps['variant'], C: ReturnType<typeof useMentraTheme>) {
    switch (variant) {
        case 'primary':   return { bg: C.brandPrimary,   text: C.surface };
        case 'secondary': return { bg: C.brandSecondary, text: C.surface };
        case 'accent':    return { bg: C.brandAccent,    text: C.isDark ? C.text : '#0F1A16' };
        case 'success':   return { bg: C.success,        text: '#FFF' };
        case 'warn':      return { bg: C.warning,        text: '#FFF' };
        case 'danger':    return { bg: C.danger,         text: '#FFF' };
        case 'ghost':     return { bg: C.surface2,       text: C.textDim };
        default:          return { bg: C.brandPrimary,   text: C.surface };
    }
}

export const Pill = ({ label, variant = 'primary', style }: BadgeProps) => {
    const C = useMentraTheme();
    const colors = getBadgeColors(variant, C);
    return (
        <View style={[styles.pill, { backgroundColor: colors.bg }, style]}>
            <ThemedText style={[styles.pillText, { color: colors.text }]}>{label}</ThemedText>
        </View>
    );
};

export const Tag = ({ label, variant = 'ghost', style }: BadgeProps) => {
    const C = useMentraTheme();
    const colors = getBadgeColors(variant, C);
    return (
        <View style={[styles.tag, { backgroundColor: colors.bg }, style]}>
            <ThemedText style={[styles.tagText, { color: colors.text }]}>{label}</ThemedText>
        </View>
    );
};

export const ProBadge = () => (
    <Pill label="PRO" variant="accent" style={styles.proBadge} />
);

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Metrics.radius.round,
        alignSelf: 'flex-start',
    },
    pillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Metrics.radius.s,
        alignSelf: 'flex-start',
    },
    tagText: { fontSize: 12, fontWeight: '600' },
    proBadge: { paddingHorizontal: 8, paddingVertical: 2 },
});
