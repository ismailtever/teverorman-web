import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
}

export function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
    // Note: On Android, BlurView requires extra setup or falls back to a translucent view.
    // For MVP, we use the experimentalBlurMethod or a fallback color.

    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.border} />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.mentra.glass.background, // Fallback / Base
        position: 'relative',
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.mentra.glass.border,
    },
    content: {
        padding: 16,
        zIndex: 1,
    }
});
