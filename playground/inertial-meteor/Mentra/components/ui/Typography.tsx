import React from 'react';
import { View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    style?: ViewStyle;
}

export const SectionTitle = ({ title, subtitle, action, style }: SectionTitleProps) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.textContainer}>
                <ThemedText style={styles.title}>{title}</ThemedText>
                {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
            </View>
            {action && <View style={styles.actionContainer}>{action}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: Metrics.spacing.m,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.mentra.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.mentra.muted,
        marginTop: 2,
    },
    actionContainer: {
        marginLeft: Metrics.spacing.m,
    }
});
