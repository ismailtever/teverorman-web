import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Home, Activity, BookOpen, User, BrainCircuit } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

// ─── Active indicator dot under focused tab icon ──────────────────────────────
function TabDot({ focused, color }: { focused: boolean; color: string }) {
  if (!focused) return null;
  return (
    <View style={{
      position: 'absolute',
      bottom: -6,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: color,
    }} />
  );
}

export default function TabLayout() {
  const C = useMentraTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.brandPrimary,
        tabBarInactiveTintColor: C.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            height: 88,
          },
          default: {
            backgroundColor: C.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: C.border,
            height: 64,
            elevation: 0,
            shadowOpacity: 0,
          },
        }),
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint={C.isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
              intensity={100}
              style={StyleSheet.absoluteFill}
            />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              <TabDot focused={focused} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <BrainCircuit size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              <TabDot focused={focused} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: 'Train',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Activity size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              <TabDot focused={focused} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <BookOpen size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              <TabDot focused={focused} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
              <TabDot focused={focused} color={color} />
            </View>
          ),
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
