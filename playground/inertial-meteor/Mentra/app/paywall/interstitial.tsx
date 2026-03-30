import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ImageBackground, InteractionManager, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { getPremiumStatus, restoreFlow, purchasePlan, fetchOfferingsSafe, OfferingsData } from '@/services/purchases';

const { width, height } = Dimensions.get('window');

// ─── Paywall 3: The "Saving Throw" Interstitial ──────────────────────────────
// Shown contextually, e.g. after failing a session or exiting a free feature.

export default function InterstitialPaywall() {
    const [offerings, setOfferings] = useState<OfferingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        fetchOfferingsSafe().then(data => {
            setOfferings(data);
            setLoading(false);
        });

        const task = InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
        });
        return () => task.cancel();
    }, []);

    const handlePurchase = async () => {
        if (!offerings?.yearlyPkg) return;
        setProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const success = await purchasePlan(offerings.yearlyPkg, 'interstitial_paywall');
            if (success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.back();
            }
        } catch (e) {
            // Error handled by purchases service
        } finally {
            setProcessing(false);
        }
    };

    const priceText = offerings?.hasTrial
        ? `Try 7 Days Free • Then ${offerings?.yearlyPkg?.product.priceString}/year`
        : `${offerings?.yearlyPkg?.product.priceString || '$59.99'}/year`;

    const features = [
        "Full access to the Mentra AI Coach.",
        "Unlock Deep Focus & Sleep routines.",
        "Infinite Grid Focus sessions.",
        "Advanced Analytics & Mood Tracking"
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />

            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop' }}
                style={StyleSheet.absoluteFill}
                blurRadius={20}
            >
                <View style={styles.overlay} />

                <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                    <X size={24} color="rgba(255,255,255,0.6)" />
                </Pressable>

                {isReady ? (
                    <Animated.View entering={SlideInDown.springify().delay(100)} style={styles.card}>
                        <Text style={styles.badge}>WAIT BEFORE YOU GO</Text>
                        <Text style={styles.title}>Your mind is ready for more.</Text>
                        <Text style={styles.subtext}>
                            Don't lose your momentum. Upgrade to Mentra Pro to permanently unlock
                            the tools required to structure your life.
                        </Text>

                        <View style={styles.features}>
                            {features.map((f, i) => (
                                <Animated.View key={i} entering={FadeInUp.delay(300 + i * 100)} style={styles.featureRow}>
                                    <Check size={18} color={Colors.mentra.brandPrimary} />
                                    <Text style={styles.featureText}>{f}</Text>
                                </Animated.View>
                            ))}
                        </View>

                        <Pressable
                            onPress={handlePurchase}
                            disabled={loading || processing}
                            style={({ pressed }) => [styles.ctaBtn, { opacity: (pressed || loading || processing) ? 0.8 : 1 }]}
                        >
                            <Text style={styles.ctaText}>
                                {processing ? "Processing..." : "Unlock Mentra Pro"}
                            </Text>
                        </Pressable>
                        <Text style={styles.priceHints}>{loading ? "Loading..." : priceText}</Text>
                        <Text style={styles.priceHints}>Cancel anytime.</Text>

                        <Pressable onPress={() => restoreFlow('interstitial_paywall')} style={{ marginTop: 24 }}>
                            <Text style={styles.restoreText}>Restore Purchases</Text>
                        </Pressable>
                    </Animated.View>
                ) : (
                    <View style={[styles.card, { height: 400, justifyContent: 'center' }]}>
                        <ActivityIndicator size="large" color={Colors.mentra.brandPrimary} />
                    </View>
                )}
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },

    closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },

    card: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.mentra.bg,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, paddingBottom: 50,
        alignItems: 'center'
    },

    badge: { fontSize: 11, fontWeight: '800', color: Colors.mentra.brandPrimary, letterSpacing: 1.5, marginBottom: 12 },
    title: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
    subtext: { fontSize: 15, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12, marginBottom: 32 },

    features: { width: '100%', gap: 14, marginBottom: 40 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureText: { fontSize: 15, color: Colors.mentra.text, fontWeight: '500' },

    ctaBtn: {
        width: '100%', backgroundColor: Colors.mentra.brandPrimary,
        paddingVertical: 18, borderRadius: 16, alignItems: 'center',
        shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16,
    },
    ctaText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

    priceHints: { fontSize: 12, color: Colors.mentra.muted, marginTop: 12 },
    restoreText: { fontSize: 13, color: Colors.mentra.textDim, fontWeight: '600', textDecorationLine: 'underline' }
});
