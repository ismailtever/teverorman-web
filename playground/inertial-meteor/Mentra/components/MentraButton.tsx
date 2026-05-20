import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useMentraTheme } from '@/hooks/useMentraTheme';

// Static gradient colors — always dark green, component is always on dark backgrounds
const GRADIENT_PRIMARY: [string, string] = ['#194031', '#20503D'];

interface MentraButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
}

export function MentraButton({ title, onPress, style, variant = 'primary', icon }: MentraButtonProps) {
    const C = useMentraTheme();
    const styles = makeStyles(C);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    if (variant === 'secondary') {
        return (
            <TouchableOpacity onPress={handlePress} style={[styles.button, styles.secondaryButton, style]}>
                {icon}
                <Text style={[styles.text, styles.secondaryText]}>{title}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={[styles.container, style]}>
            <LinearGradient
                colors={GRADIENT_PRIMARY}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
            >
                {icon}
                <Text style={styles.text}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: {
            borderRadius: 16,
            shadowColor: C.brandPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 16,
            gap: 8,
        },
        secondaryButton: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
        },
        text: {
            color: '#fff',
            fontSize: 17,
            fontWeight: '600',
            letterSpacing: -0.4,
        },
        secondaryText: {
            color: '#fff',
        }
    });
}
