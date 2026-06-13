import React from 'react';
import { StyleSheet, View, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '../themed-text';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    icon?: React.ReactNode;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}

function getVariantColors(variant: ButtonProps['variant'], C: ReturnType<typeof useMentraTheme>) {
    switch (variant) {
        case 'primary':   return { bg: C.brandPrimary,  text: C.surface,   border: C.brandPrimary };
        case 'secondary': return { bg: C.surface2,      text: C.text,      border: C.surface2 };
        case 'outline':   return { bg: 'transparent',   text: C.brandPrimary, border: C.border };
        case 'ghost':     return { bg: 'transparent',   text: C.textDim,   border: 'transparent' };
        default:          return { bg: C.brandPrimary,  text: C.surface,   border: C.brandPrimary };
    }
}

export const AppButton = ({
    title,
    icon,
    loading = false,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    style,
    disabled,
    onPress,
    ...props
}: ButtonProps) => {
    const C = useMentraTheme();
    const colors = getVariantColors(variant, C);
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const height = size === 'small' ? 36 : size === 'medium' ? 48 : 56;
    const padding = size === 'small' ? 12 : size === 'medium' ? 20 : 24;
    const fontSize = size === 'small' ? 14 : size === 'medium' ? 16 : 18;

    const handlePressIn = () => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); };
    const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); };

    return (
        <Animated.View style={[animStyle, fullWidth && { width: '100%' }, style as ViewStyle]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                        height,
                        paddingHorizontal: padding,
                        width: fullWidth ? '100%' : 'auto',
                        opacity: disabled || loading ? 0.6 : 1,
                    },
                ]}
                disabled={disabled || loading}
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                {...props}
            >
                {loading ? (
                    <ActivityIndicator color={colors.text} size="small" />
                ) : (
                    <View style={styles.contentContainer}>
                        {icon && <View style={styles.iconContainer}>{icon}</View>}
                        <ThemedText style={[styles.text, { color: colors.text, fontSize }]}>
                            {title}
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export const PrimaryButton   = (props: Omit<ButtonProps, 'variant'>) => <AppButton variant="primary"   {...props} />;
export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => <AppButton variant="secondary" {...props} />;
export const GhostButton     = (props: Omit<ButtonProps, 'variant'>) => <AppButton variant="ghost"     {...props} />;

const styles = StyleSheet.create({
    button: {
        borderRadius: Metrics.radius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: { marginRight: 8 },
    text: { fontWeight: '600', letterSpacing: 0.3 },
});
