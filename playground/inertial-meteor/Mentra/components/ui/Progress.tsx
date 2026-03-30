import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
    style?: ViewStyle;
}

export const ProgressBar = ({
    progress,
    color = Colors.mentra.brandPrimary,
    height = 8,
    style
}: ProgressBarProps) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    return (
        <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
            <View
                style={[
                    styles.fill,
                    {
                        width: `${clampedProgress * 100}%`,
                        backgroundColor: color,
                        borderRadius: height / 2
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    track: {
        width: '100%',
        backgroundColor: Colors.mentra.surface2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    }
});
