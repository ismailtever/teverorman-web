import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { ThemedText } from '../themed-text';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';

interface CardProps extends ViewProps {
    children?: React.ReactNode;
    onPress?: () => void;
    variant?: 'default' | 'elevated' | 'outline';
}

export const Card = ({ children, onPress, variant = 'default', style, ...props }: CardProps) => {
    if (onPress) {
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    variant === 'elevated' && styles.elevated,
                    variant === 'outline' && styles.outline,
                    style
                ]}
                onPress={onPress}
                activeOpacity={0.8}
                {...(props as any)}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[
                styles.card,
                variant === 'elevated' && styles.elevated,
                variant === 'outline' && styles.outline,
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

interface StatCardProps extends CardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    trend?: string;
    trendPositive?: boolean;
}

export const StatCard = ({ title, value, icon, trend, trendPositive, style, ...props }: StatCardProps) => {
    return (
        <Card style={[styles.statCard, style]} {...props}>
            <View style={styles.statHeader}>
                <ThemedText style={styles.statTitle}>{title}</ThemedText>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
            </View>
            <View style={styles.statBody}>
                <ThemedText style={styles.statValue}>{value}</ThemedText>
                {trend && (
                    <ThemedText style={[styles.trend, { color: trendPositive ? Colors.mentra.success : Colors.mentra.danger }]}>
                        {trend}
                    </ThemedText>
                )}
            </View>
        </Card>
    );
};

export const Section = ({ children, style, ...props }: ViewProps) => (
    <View style={[styles.section, style]} {...props}>
        {children}
    </View>
);

export const FeatureRow = ({ text }: { text: string }) => (
    <View style={styles.featureRow}>
        <Check size={20} color={Colors.mentra.brandAccent} />
        <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
);

interface PricingCardProps extends CardProps {
    title: string;
    price: string;
    description: string;
    secondaryPrice?: string;
    isBestValue?: boolean;
    isSelected?: boolean;
}

export const PricingCard = ({ title, price, description, secondaryPrice, isBestValue, isSelected, style, ...props }: PricingCardProps) => {
    return (
        <Card
            variant={isSelected ? 'elevated' : 'outline'}
            style={[
                styles.pricingCard,
                isSelected && styles.pricingCardSelected,
                style
            ]}
            {...props}
        >
            {isBestValue && (
                <View style={[styles.bestValueBadge, isSelected && { backgroundColor: Colors.mentra.brandAccent }]}>
                    <ThemedText style={[styles.bestValueText, isSelected && { color: Colors.mentra.bg }]}>Best Value</ThemedText>
                </View>
            )}
            <View>
                <ThemedText style={styles.pricingTitle}>{title}</ThemedText>
                <ThemedText style={[styles.pricingDesc, isSelected && { color: Colors.mentra.brandAccent }]}>{description}</ThemedText>
            </View>
            <View style={styles.pricingPriceContainer}>
                <ThemedText style={styles.pricingPrice}>{price}</ThemedText>
                {secondaryPrice && <ThemedText style={styles.pricingSecondaryPrice}>{secondaryPrice}</ThemedText>}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.mentra.surface,
        borderRadius: Metrics.radius.xl,
        padding: Metrics.spacing.l,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    elevated: {
        shadowColor: Colors.mentra.brandPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.mentra.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    statCard: {
        padding: Metrics.spacing.m,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Metrics.spacing.s,
    },
    statTitle: {
        fontSize: 14,
        color: Colors.mentra.textDim,
        fontWeight: '500',
    },
    iconContainer: {
        padding: 4,
        backgroundColor: Colors.mentra.surface2,
        borderRadius: Metrics.radius.m,
    },
    statBody: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.mentra.text,
    },
    trend: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: Metrics.spacing.xxl,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Metrics.spacing.s,
    },
    featureText: {
        fontSize: 16,
        color: Colors.mentra.textDim,
        marginLeft: Metrics.spacing.m,
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Metrics.spacing.l,
        marginBottom: Metrics.spacing.m,
        position: 'relative',
        overflow: 'hidden',
    },
    pricingCardSelected: {
        borderColor: Colors.mentra.brandAccent,
        borderWidth: 2,
        backgroundColor: Colors.mentra.surface2,
    },
    bestValueBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.mentra.textDim,
        paddingHorizontal: Metrics.spacing.s,
        paddingVertical: 4,
        borderBottomLeftRadius: Metrics.radius.m,
    },
    bestValueText: {
        color: Colors.mentra.surface,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pricingTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.mentra.text,
        marginBottom: 4,
    },
    pricingDesc: {
        fontSize: 14,
        color: Colors.mentra.muted,
    },
    pricingPriceContainer: {
        alignItems: 'flex-end',
    },
    pricingPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.mentra.text,
    },
    pricingSecondaryPrice: {
        fontSize: 12,
        color: Colors.mentra.textDim,
        marginTop: 2,
    }
});
