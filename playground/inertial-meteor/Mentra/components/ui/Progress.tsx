import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
    style?: ViewStyle;
}

export const ProgressBar = ({ progress, color, height = 8, style }: ProgressBarProps) => {
    const C = useMentraTheme();
    const fillColor = color ?? C.brandPrimary;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    return (
        <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: C.surface2 }, style]}>
            <View
                style={[
                    styles.fill,
                    { width: `${clampedProgress * 100}%`, backgroundColor: fillColor, borderRadius: height / 2 }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    track: { width: '100%', overflow: 'hidden' },
    fill:  { height: '100%' },
});
