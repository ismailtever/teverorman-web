import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { I18n } from '@/services/i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// Premium checks are now handled inside services/purchases.ts

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const loaded = true;
  const [i18nReady, setI18nReady] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Initialize I18n globally on app mount (async)
        await I18n.init();
        // 2. Check if user has given consent (GDPR/KVKK/PDPL first-launch gate)
        const consent = await AsyncStorage.getItem('mentra_consent');
        if (!consent) {
          // First launch — redirect to consent screen after splash hides
          setNeedsConsent(true);
        }
      } catch (e) {
        console.warn('I18n init failed', e);
      } finally {
        setI18nReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (loaded && i18nReady) {
      SplashScreen.hideAsync();
      if (needsConsent) {
        // Navigate to consent screen after splash hides (GDPR gate)
        router.replace('/consent' as any);
      }
    }
  }, [loaded, i18nReady, needsConsent]);

  if (!loaded || !i18nReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* GDPR/KVKK/PDPL Consent Screen (First Launch) */}
          <Stack.Screen name="consent" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          {/* Main Settings & Legal Routes */}
          <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', title: 'Mentra Pro' }} />
          <Stack.Screen name="legal/privacy" options={{ presentation: 'modal' }} />
          <Stack.Screen name="legal/terms" options={{ presentation: 'modal' }} />
          <Stack.Screen name="legal/disclaimer" options={{ presentation: 'modal' }} />
          {/* Game Routes */}
          <Stack.Screen name="game/grid-focus" options={{ headerShown: false }} />
          <Stack.Screen name="game/memory-grid" options={{ headerShown: false }} />
          <Stack.Screen name="game/speed-match" options={{ headerShown: false }} />
          <Stack.Screen name="game/deep-focus" options={{ headerShown: false }} />
          <Stack.Screen name="game/impulse-control" options={{ headerShown: false }} />
          <Stack.Screen name="game/dopamine-reset" options={{ headerShown: false }} />
          {/* Training Routes */}
          <Stack.Screen name="training/daily-session" options={{ headerShown: false }} />
          <Stack.Screen name="training-session" options={{ headerShown: false }} />
          {/* Onboarding & Check-in */}
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="check-in" options={{ headerShown: false }} />
          {/* Debug Route - Hidden header, logic will block access in prod */}
          <Stack.Screen name="debug/engine" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
