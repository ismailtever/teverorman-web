import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMentraTheme } from '@/hooks/useMentraTheme';

/*
  =============================================================================
  AdMob Abstraction Layer
  =============================================================================
  This file scaffolds the API hooks for React Native Google Mobile Ads.
  To activate, install the dependency and drop in your true AdUnit IDs:
  `npx expo install react-native-google-mobile-ads`
*/

const IS_ADS_ENABLED = false; // Toggle when SDK is installed

export function useInterstitialAd() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Mock load
        if (IS_ADS_ENABLED) {
            const timer = setTimeout(() => setIsLoaded(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const show = async () => {
        if (!IS_ADS_ENABLED) return;
        return new Promise<void>((resolve) => {
            console.log("[AdMob] Displaying Interstitial Ad");
            setTimeout(() => {
                console.log("[AdMob] Interstitial Ad Closed");
                resolve();
            }, 1000);
        });
    };

    return { isLoaded, show };
}

export function BannerAdPlaceholder() {
    const C = useMentraTheme();
    const styles = makeStyles(C);

    if (!IS_ADS_ENABLED) return null;

    return (
        <View style={styles.bannerContainer}>
            <Text style={styles.bannerText}>AdMob Banner Placeholder</Text>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        bannerContainer: {
            width: '100%',
            height: 50,
            backgroundColor: C.surface2,
            alignItems: 'center',
            justifyContent: 'center',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: C.border,
            marginVertical: 10
        },
        bannerText: {
            fontSize: 12,
            color: C.muted,
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }
    });
}
