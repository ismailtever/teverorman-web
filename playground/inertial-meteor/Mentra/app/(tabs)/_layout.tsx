import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Home, Compass, Activity, User, BrainCircuit, TrendingUp, Target } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useI18n } from '@/services/i18n';

export default function TabLayout() {
  const { t } = useI18n();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.mentra.brandPrimary,
        tabBarInactiveTintColor: isDark
          ? Colors.mentra.darkTokens.textDim
          : Colors.mentra.textDim,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            height: 84,
          },
          default: {
            backgroundColor: isDark
              ? Colors.mentra.darkTokens.surface
              : Colors.mentra.surface,
            borderTopWidth: 1,
            borderTopColor: isDark ? Colors.mentra.darkTokens.border : Colors.mentra.border,
            height: 64,
          },
        }),
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint={isDark ? 'dark' : 'light'}
              intensity={90}
              style={StyleSheet.absoluteFill}
            />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home' as any),
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} {...({ strokeWidth: focused ? 2.5 : 1.8 } as any)} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: t('coach' as any),
          tabBarIcon: ({ color, focused }) => (
            <BrainCircuit size={22} color={color} {...({ strokeWidth: focused ? 2.5 : 1.8 } as any)} />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: t('diagnosticsTitle'),
          tabBarIcon: ({ color, focused }) => (
            <Target size={22} color={color} {...({ strokeWidth: focused ? 2.5 : 1.8 } as any)} />
          ),
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
