import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useMentraTheme } from '@/hooks/useMentraTheme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
}

export function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
    const C = useMentraTheme();
    const styles = makeStyles(C);

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

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: {
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: C.glassBg,
            position: 'relative',
        },
        border: {
            ...StyleSheet.absoluteFillObject,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: C.glassBorder,
        },
        content: {
            padding: 16,
            zIndex: 1,
        }
    });
}
