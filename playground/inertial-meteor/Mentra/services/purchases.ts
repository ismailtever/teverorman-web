import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, CustomerInfo, PurchasesPackage, PACKAGE_TYPE, PRODUCT_CATEGORY } from "react-native-purchases";
import { Storage } from '@/services/storage';
import { track } from '@/services/analytics';

// ⚠️  BEFORE SUBMITTING TO APP STORE:
// Replace test key with your real RevenueCat Apple key from:
// https://app.revenuecat.com → Project → API Keys → Apple App-Specific Shared Secret
const API_KEY_APPLE  = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY  ?? '';
const API_KEY_GOOGLE = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY ?? '';
const ENTITLEMENT_ID = "Mentra Pro";

let isConfigured = false;

export async function setupRevenueCat() {
  if (Platform.OS === 'web') return;
  if (isConfigured) return;

  try {
    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: API_KEY_APPLE });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: API_KEY_GOOGLE });
    }
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    isConfigured = true;
  } catch (error) {
    console.warn("Failed to configure RevenueCat:", error);
  }
}

export interface OfferingsData {
    monthlyPkg?: PurchasesPackage;
    yearlyPkg?: PurchasesPackage;
    lifetimePkg?: PurchasesPackage;
    hasTrial: boolean;
    allPackages: PurchasesPackage[]; // Raw packages if UI needs to iterate
}

/**
 * Robustly fetches and categorizes offerings.
 */
export const fetchOfferingsSafe = async (): Promise<OfferingsData> => {
    await setupRevenueCat(); // Changed from configurePurchases();

    let packages: PurchasesPackage[] = [];
    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
            packages = offerings.current.availablePackages;
        } else if (offerings.all && Object.keys(offerings.all).length > 0) {
            // Fallback to first available offering
            const fallbackKey = Object.keys(offerings.all)[0];
            packages = offerings.all[fallbackKey].availablePackages;
        }
    } catch (e) {
        // Silently handle in production
    }

    // Map packages without hard-coding specific string IDs
    let monthlyPkg: PurchasesPackage | undefined = undefined;
    let yearlyPkg: PurchasesPackage | undefined = undefined;
    let lifetimePkg: PurchasesPackage | undefined = undefined;

    for (const pkg of packages) {
        if (pkg.packageType === PACKAGE_TYPE.ANNUAL) {
            if (!yearlyPkg) yearlyPkg = pkg;
        } else if (pkg.packageType === PACKAGE_TYPE.MONTHLY) {
            if (!monthlyPkg) monthlyPkg = pkg;
        } else if (
            pkg.packageType === PACKAGE_TYPE.LIFETIME ||
            pkg.identifier.toLowerCase().includes('lifetime') ||
            pkg.product.productCategory === PRODUCT_CATEGORY.NON_SUBSCRIPTION
        ) {
            if (!lifetimePkg) lifetimePkg = pkg;
        }
    }

    // Detect Trial cleanly
    let hasTrial = false;
    if (yearlyPkg && yearlyPkg.product && yearlyPkg.product.introPrice) {
        // Checking internal introductory price rules
        hasTrial = true;
    }

    return {
        monthlyPkg,
        yearlyPkg,
        lifetimePkg,
        hasTrial,
        allPackages: packages
    };
};

/**
 * Main Purchase Flow explicitly tied to "Mentra Pro".
 */
export const purchasePlan = async (pkg: PurchasesPackage, paywallId: string): Promise<boolean> => {
    if (!pkg) return false;
    track('purchase_started', { paywall_id: paywallId, plan: pkg.identifier, product_id: pkg.product.identifier });

    try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
            const profile = await Storage.getUserProfile();
            if (profile) await Storage.saveUserProfile({ ...profile, isPro: true });
            track('purchase_success', { paywall_id: paywallId, plan: pkg.identifier, product_id: pkg.product.identifier });
            return true;
        } else {
            // Purchase succeeded with Apple/Google but Entitlement mapping failed on RC dashboard
            track('purchase_error', { paywall_id: paywallId, plan: pkg.identifier, error_code: 'missing_entitlement' });
            return false;
        }
    } catch (e: any) {
        if (!e.userCancelled) {
            track('purchase_error', { paywall_id: paywallId, plan: pkg.identifier, error_code: e.code });
            throw e; // Rethrow to let UI handle the error alert
        }
        return false; // Silently abort on user cancel
    }
};

/**
 * Restore flow specifically validating "Mentra Pro"
 */
export const restoreFlow = async (paywallId: string): Promise<boolean> => {
    track('restore_tap', { paywall_id: paywallId });
    try {
        const customerInfo = await Purchases.restorePurchases();
        if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
            const profile = await Storage.getUserProfile();
            if (profile) await Storage.saveUserProfile({ ...profile, isPro: true });
            track('restore_success', { paywall_id: paywallId });
            return true;
        }
        return false;
    } catch (e) {
        throw e;
    }
};

/**
 * Single source of truth for PRO status checking
 */
export const getPremiumStatus = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    } catch (e) {
        return false;
    }
};
