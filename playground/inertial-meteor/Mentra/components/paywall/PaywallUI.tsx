import React from 'react';
import { View, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { Metrics } from '@/constants/Theme';
import { I18n } from '@/services/i18n';
import { PW } from '@/constants/PaywallColors';

const { width } = Dimensions.get('window');

// 1. Header
export const PaywallHeader = ({ onClose }: { onClose: () => void }) => (
    <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={Metrics.hitSlop}>
            <X color={PW.text} size={24} />
        </Pressable>
        <View style={styles.proBadge}>
            <ThemedText style={styles.proBadgeText}>Mentra PRO</ThemedText>
        </View>
    </View>
);

// 2. Hero Brain Glow
export const HeroBrainGlow = () => (
    <View style={styles.glowContainer}>
        {/* Abstract layered radial glow simulation */}
        <View style={[styles.glowLayer, { width: width * 0.8, height: width * 0.8, opacity: 0.15 }]} />
        <View style={[styles.glowLayer, { width: width * 0.5, height: width * 0.5, opacity: 0.3 }]} />
        <View style={[styles.glowLayer, { width: width * 0.3, height: width * 0.3, opacity: 0.5 }]} />
    </View>
);

// 3. Feature Row
export const PaywallFeatureRow = ({ text }: { text: string }) => (
    <View style={styles.featureRow}>
        <View style={styles.checkContainer}>
            <Check size={16} color={PW.primary} strokeWidth={3} />
        </View>
        <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
);

// 4. Pricing Card
interface PaywallPricingCardProps {
    title: string;
    price: string;
    description: string;
    secondaryPrice?: string;
    isBestValue?: boolean;
    isSelected?: boolean;
    onPress: () => void;
}

export const PaywallPricingCard = ({ title, price, description, secondaryPrice, isBestValue, isSelected, onPress }: PaywallPricingCardProps) => {
    return (
        <Pressable onPress={onPress} style={{ marginBottom: Metrics.spacing.m }}>
            <BlurView
                intensity={Platform.OS === 'ios' ? 20 : 100}
                tint="dark"
                style={[
                    styles.pricingCard,
                    isSelected && styles.pricingCardSelected
                ]}
            >
                {isBestValue && (
                    <View style={[styles.bestValueBadge, isSelected && { backgroundColor: PW.accent }]}>
                        <ThemedText style={[styles.bestValueText, isSelected && { color: PW.backgroundAlt }]}>
                            {I18n.t('bestValue')}
                        </ThemedText>
                    </View>
                )}
                <View style={{ flex: 1, paddingRight: Metrics.spacing.s }}>
                    <ThemedText style={styles.pricingTitle}>{title}</ThemedText>
                    <ThemedText style={[styles.pricingDesc, isSelected && { color: PW.accent }]}>{description}</ThemedText>
                </View>
                <View style={styles.pricingPriceContainer}>
                    <ThemedText style={styles.pricingPrice}>{price}</ThemedText>
                    {secondaryPrice && <ThemedText style={styles.pricingSecondaryPrice}>{secondaryPrice}</ThemedText>}
                </View>
            </BlurView>
        </Pressable>
    );
};

// 5. Footer Links
export const PaywallFooterLinks = ({ onRestore, onTerms, onPrivacy }: { onRestore: () => void, onTerms: () => void, onPrivacy: () => void }) => (
    <View style={styles.footerLinks}>
        <Pressable onPress={onRestore}>
            <ThemedText style={styles.footerLinkText}>{I18n.t('footerRestore')}</ThemedText>
        </Pressable>
        <Pressable onPress={onTerms}>
            <ThemedText style={styles.footerLinkText}>{I18n.t('footerTerms')}</ThemedText>
        </Pressable>
        <Pressable onPress={onPrivacy}>
            <ThemedText style={styles.footerLinkText}>{I18n.t('footerPrivacy')}</ThemedText>
        </Pressable>
    </View>
);

// 6. Brand Footer
export const PaywallBrandFooter = () => (
    <View style={styles.brandFooterContainer}>
        <ThemedText style={styles.brandFooter}>{I18n.t('footerBrand')}</ThemedText>
    </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Metrics.spacing.l,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: Metrics.spacing.m,
        zIndex: 10,
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: PW.glass.background,
        borderRadius: Metrics.radius.round,
        borderWidth: 1,
        borderColor: PW.glass.border,
    },
    proBadge: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        paddingHorizontal: Metrics.spacing.m,
        paddingVertical: 6,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.3)',
    },
    proBadgeText: {
        color: PW.accent,
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 1,
    },
    glowContainer: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: width,
        height: width,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
        pointerEvents: 'none',
    },
    glowLayer: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: PW.primary,
        shadowColor: PW.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 50,
        elevation: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    checkContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: PW.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Metrics.spacing.m,
    },
    featureText: {
        fontSize: 16,
        color: PW.textDim,
        fontWeight: '500',
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Metrics.spacing.l,
        borderRadius: Metrics.radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: PW.glass.border,
        backgroundColor: PW.glass.background,
    },
    pricingCardSelected: {
        borderColor: PW.accent,
        borderWidth: 2,
        backgroundColor: 'rgba(74, 222, 128, 0.05)',
    },
    bestValueBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: PW.textDim,
        paddingHorizontal: Metrics.spacing.m,
        paddingVertical: 4,
        borderBottomLeftRadius: Metrics.radius.m,
        zIndex: 2,
    },
    bestValueText: {
        color: PW.backgroundAlt,
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pricingTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: PW.text,
        marginBottom: 4,
    },
    pricingDesc: {
        fontSize: 14,
        color: PW.textDim,
    },
    pricingPriceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    pricingPrice: {
        fontSize: 22,
        fontWeight: '800',
        color: PW.text,
    },
    pricingSecondaryPrice: {
        fontSize: 12,
        color: PW.textDim,
        marginTop: 2,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Metrics.spacing.xl,
        paddingHorizontal: Metrics.spacing.l,
        marginBottom: Metrics.spacing.l,
        marginTop: Metrics.spacing.m,
    },
    footerLinkText: {
        fontSize: 12,
        color: PW.textDim,
        textDecorationLine: 'underline',
    },
    brandFooterContainer: {
        marginTop: Metrics.spacing.xl,
        paddingBottom: Metrics.spacing.xl,
    },
    brandFooter: {
        textAlign: 'center',
        color: PW.glass.border,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
