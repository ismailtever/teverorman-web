import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, InteractionManager } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton, GhostButton } from '@/components/ui/Buttons';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { I18n } from '@/services/i18n';

import { usePaywall } from '@/components/paywall/usePaywall';
import {
    PaywallHeader,
    HeroBrainGlow,
    PaywallFeatureRow,
    PaywallPricingCard,
    PaywallFooterLinks,
    PaywallBrandFooter
} from '@/components/paywall/PaywallUI';

export default function OnboardingPaywall() {
    const [_, forceUpdate] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = I18n.subscribe(() => forceUpdate(n => n + 1));
        const task = InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
        });
        return () => {
            unsubscribe();
            task.cancel();
        };
    }, []);

    const {
        packages,
        selectedPackage,
        setSelectedPackage,
        monthlyPkg,
        yearlyPkg,
        lifetimePkg,
        hasTrial,
        isPurchasing,
        isLoading,
        handlePurchase,
        handleRestore,
        handleClose
    } = usePaywall('onboarding');

    const FEATURES = [
        I18n.t('paywallFeat1'),
        I18n.t('paywallFeat2'),
        I18n.t('paywallFeat3'),
        I18n.t('paywallFeat4')
    ];

    const CTA_VARIANT: 'A' | 'B' = 'A'; // A/B test variable
    const getCtaText = () => {
        if (isPurchasing) return I18n.t('processing');
        return CTA_VARIANT === 'A' ? I18n.t('paywallCTATrial') : I18n.t('paywallCTATryFree');
    };

    const confirmClose = () => {
        Alert.alert(
            I18n.t('paywallCloseTitle'),
            I18n.t('paywallCloseBody'),
            [
                { text: I18n.t('paywallCloseViewPlans'), style: 'cancel' },
                { text: I18n.t('continueFree'), style: 'default', onPress: () => handleClose() }
            ]
        );
    };

    if (isLoading || !isReady) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.mentra.paywall.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
            <StatusBar style="light" />
            <HeroBrainGlow />

            <PaywallHeader onClose={confirmClose} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <ThemedText style={styles.headline}>{I18n.t('paywallHeroTitle')}</ThemedText>
                    <ThemedText style={styles.subHeadline}>{I18n.t('paywallHeroSub')}</ThemedText>
                    <ThemedText style={[styles.subHeadline, { marginTop: 8, fontSize: 13, color: Colors.mentra.paywall.accent, fontWeight: '500' }]}>
                        {I18n.t('paywallValueFrame')}
                    </ThemedText>
                </View>

                <View style={styles.featuresSection}>
                    {FEATURES.map((feat, index) => (
                        <PaywallFeatureRow key={index} text={feat} />
                    ))}
                    <ThemedText style={styles.socialProof}>
                        {I18n.t('paywallSocialProof')}
                    </ThemedText>
                </View>

                <View style={styles.tiersSection}>
                    {packages.map((pkg) => {
                        const isSelected = selectedPackage?.identifier === pkg.identifier;
                        const isYearly = pkg.packageType === "ANNUAL" || pkg.identifier === 'yearly';

                        let title = pkg.product.title.split('(')[0] || 'Premium';
                        if (pkg.identifier === 'monthly') title = I18n.t('monthly');
                        if (pkg.identifier === 'yearly') title = I18n.t('yearly');
                        if (pkg.identifier === 'lifetime') title = I18n.t('lifetime');

                        const desc = isYearly ? I18n.t('paywallSave50') : pkg.packageType === "LIFETIME" ? I18n.t('payOnce') : I18n.t('cancelAnytime');
                        const secondaryPrice = isYearly ? I18n.t('paywallBilledYearly') : undefined;

                        return (
                            <PaywallPricingCard
                                key={pkg.identifier}
                                title={title}
                                price={pkg.product.priceString}
                                description={desc}
                                secondaryPrice={secondaryPrice}
                                isBestValue={isYearly}
                                isSelected={isSelected}
                                onPress={() => setSelectedPackage(pkg)}
                            />
                        );
                    })}
                </View>

                <View style={styles.ctaSection}>
                    <PrimaryButton
                        title={getCtaText()}
                        onPress={() => handlePurchase()}
                        disabled={isPurchasing}
                        fullWidth
                        style={{ backgroundColor: Colors.mentra.paywall.accent }} // override explicitly
                    />

                    <View style={styles.ethicalContainer}>
                        <ThemedText style={styles.ethicalText}>{I18n.t('paywallCancelAnytimeSetting')}</ThemedText>
                        {hasTrial && <ThemedText style={styles.ethicalText}>{I18n.t('paywallNoChargeToday')}</ThemedText>}
                    </View>
                </View>

                <PaywallFooterLinks
                    onRestore={handleRestore}
                    onTerms={() => router.push('/legal/terms')}
                    onPrivacy={() => router.push('/legal/privacy')}
                />
                <PaywallBrandFooter />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.mentra.paywall.background,
    },
    scrollContent: {
        padding: Metrics.spacing.l,
        paddingBottom: 60,
    },
    heroSection: {
        marginTop: 10,
        marginBottom: Metrics.spacing.l,
    },
    headline: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.mentra.paywall.text,
        marginBottom: Metrics.spacing.m,
        lineHeight: 42,
    },
    subHeadline: {
        fontSize: 16,
        color: Colors.mentra.paywall.textDim,
        lineHeight: 24,
    },
    featuresSection: {
        marginBottom: Metrics.spacing.xl,
    },
    socialProof: {
        fontSize: 12,
        color: Colors.mentra.paywall.textDim,
        textAlign: 'center',
        marginTop: Metrics.spacing.m,
        fontStyle: 'italic'
    },
    tiersSection: {
        marginBottom: Metrics.spacing.xl,
    },
    ctaSection: {
        marginBottom: Metrics.spacing.m,
    },
    ethicalContainer: {
        alignItems: 'center',
        marginTop: 16,
        gap: 4
    },
    ethicalText: {
      