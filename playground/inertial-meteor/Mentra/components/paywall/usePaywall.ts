import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { PurchasesPackage } from 'react-native-purchases';
import { I18n } from '@/services/i18n';
import { track } from '@/services/analytics';
import { fetchOfferingsSafe, purchasePlan, restoreFlow, getPremiumStatus } from '@/services/purchases';

// Simple mock fallback if RevenueCat totally fails or isn't built
const MOCK_PACKAGES = [
    { identifier: 'monthly', product: { title: 'Monthly', priceString: '$4.99' }, packageType: 'MONTHLY' },
    { identifier: 'yearly', product: { title: 'Yearly', priceString: '$29.99' }, packageType: 'ANNUAL' },
    // Lifetime purposely left out to test UI robustness
];

export function usePaywall(paywallId: string) {
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
    const [hasTrial, setHasTrial] = useState(false);

    // Semantic package states if UI needs direct access
    const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | undefined>(undefined);
    const [yearlyPkg, setYearlyPkg] = useState<PurchasesPackage | undefined>(undefined);
    const [lifetimePkg, setLifetimePkg] = useState<PurchasesPackage | undefined>(undefined);

    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const setupPurchases = async () => {
            try {
                // Return immediately if they already have Pro
                const isProAlready = await getPremiumStatus();
                if (isProAlready) {
                    router.back();
                    return;
                }

                // Fetch real offerings using the new reliable service
                const offerings = await fetchOfferingsSafe();

                if (offerings.allPackages.length > 0) {
                    setPackages(offerings.allPackages);
                    setMonthlyPkg(offerings.monthlyPkg);
                    setYearlyPkg(offerings.yearlyPkg);
                    setLifetimePkg(offerings.lifetimePkg);
                    setHasTrial(offerings.hasTrial);

                    // Default to Yearly if available, else first pkg
                    setSelectedPackage(offerings.yearlyPkg || offerings.allPackages[0]);
                } else {
                    // Fallback visually so app doesn't break
                    if (__DEV__) console.warn("Using visual mock packages.");
                    setPackages(MOCK_PACKAGES);
                    setSelectedPackage(MOCK_PACKAGES.find(p => p.identifier === 'yearly'));
                    setHasTrial(true); // Always mock trial
                }
            } catch (e: any) {
                if (__DEV__) console.warn("Setup Purchases failed:", e);
                setPackages(MOCK_PACKAGES);
                setSelectedPackage(MOCK_PACKAGES.find(p => p.identifier === 'yearly'));
                setHasTrial(true);
            } finally {
                setIsLoading(false);
            }
        };

        setupPurchases();
    }, []);

    const handlePurchase = async (onSuccessAction?: () => void) => {
        if (!selectedPackage) return;
        setIsPurchasing(true);
        try {
            // Mock purchase handling
            if (selectedPackage.identifier === 'yearly' && !selectedPackage.product?.identifier) {
                track('purchase_success', { paywall_id: paywallId, plan: selectedPackage.identifier, mock: true });
                Alert.alert(I18n.t('welcome'), "Simulated purchase successful.");
                if (onSuccessAction) onSuccessAction();
                else router.back();
                return;
            }

            // Real Purchase 
            const success = await purchasePlan(selectedPackage, paywallId);
            if (success) {
                if (onSuccessAction) onSuccessAction();
                else router.back();
            } else {
                Alert.alert(I18n.t('error'), "Entitlement 'Mentra Pro' missing after transaction.");
            }

        } catch (e: any) {
            // User cancelled throws an error but handled inside purchasePlan, so only real errors come here
            Alert.alert(I18n.t('error'), e.message);
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setIsPurchasing(true);
        try {
            const success = await restoreFlow(paywallId);
            if (success) {
                Alert.alert(I18n.t('restored'), I18n.t('proActive'));
                router.back();
            } else {
                Alert.alert(I18n.t('noPurchases'), I18n.t('noActiveSubs'));
            }
        } catch (e: any) {
            Alert.alert(I18n.t('restoreFailed'), e.message);
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleClose = (customClose?: () => void) => {
        track('paywall_close', { paywall_id: paywallId });
        if (customClose) {
            customClose();
        } else {
            router.back();
        }
    };

    return {
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
    };
}
