import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';

interface BadgeProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warn' | 'danger' | 'ghost';
    style?: ViewStyle;
}

const getBadgeColors = (variant: BadgeProps['variant']) => {
    switch (variant) {
        case 'primary': return { bg: Colors.mentra.brandPrimary, text: Colors.mentra.surface };
        case 'secondary': return { bg: Colors.mentra.brandSecondary, text: Colors.mentra.surface };
        case 'accent': return { bg: Colors.mentra.brandAccent, text: Colors.mentra.text }; // Accent is light, text should be dark
        case 'success': return { bg: Colors.mentra.success, text: Colors.mentra.surface };
        case 'warn': return { bg: Colors.mentra.warning, text: Colors.mentra.surface };
        case 'danger': return { bg: Colors.mentra.danger, text: Colors.mentra.surface };
        case 'ghost': return { bg: Colors.mentra.surface2, text: Colors.mentra.textDim };
        default: return { bg: Colors.mentra.brandPrimary, text: Colors.mentra.surface };
    }
};

export const Pill = ({ label, variant = 'primary', style }: BadgeProps) => {
    const colors = getBadgeColors(variant);
    return (
        <View style={[styles.pill, { backgroundColor: colors.bg }, style]}>
            <ThemedText style={[styles.pillText, { color: colors.text }]}>{label}</ThemedText>
        </View>
    );
};

export const Tag = ({ label, variant = 'ghost', style }: BadgeProps) => {
    const colors = getBadgeColors(variant);
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
    pillText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Metrics.radius.s,
        alignSelf: 'flex-start',
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    proBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    }
});
