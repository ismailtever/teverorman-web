import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';

export function AnimatedBackground() {
    const opacity1 = useSharedValue(0.4);
    const opacity2 = useSharedValue(0.1);

    useEffect(() => {
        opacity1.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        opacity2.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [opacity1, opacity2]);

    const style1 = useAnimatedStyle(() => ({
        opacity: opacity1.value,
    }));

    const style2 = useAnimatedStyle(() => ({
        opacity: opacity2.value,
    }));

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Animated.View
                style={[
                    styles.blob1,
                    { backgroundColor: Colors.mentra.brandPrimary },
                    style1,
                ]}
            />
            <Animated.View
                style={[
                    styles.blob2,
                    { backgroundColor: Colors.mentra.brandAccent },
                    style2,
                ]}
            />
            {/* Soft glass overlay to blend everything naturally */}
            <BlurView intensity={80} style={StyleSheet.absoluteFillObject} tint="dark" />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,10,5, 0.4)' }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    blob1: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        filter: 'blur(50px)',
    },
    blob2: {
        position: 'absolute',
        bottom: -50,
        right: -100,
        width: 350,
        height: 350,
        borderRadius: 175,
        filter: 'blur(60px)',
    },
});
