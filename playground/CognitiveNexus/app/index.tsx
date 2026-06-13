import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Brain } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.nexus.bg, Colors.nexus.bgDark]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(1000).springify()}>
          <View style={styles.logoCircle}>
            <Brain size={80} color={Colors.nexus.brandPrimary} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.textContainer}>
          <Text style={styles.title}>Cognitive Nexus</Text>
          <Text style={styles.tagline}>Clear the Fog.</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(1000).duration(1000)} style={styles.footer}>
          <Pressable 
            style={styles.button}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logoCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0, 128, 128, 0.2)',
  },
  textContainer: { alignItems: 'center', marginTop: 40 },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 42,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'Manrope-Medium',
    fontSize: 18,
    color: Colors.nexus.brandPrimary,
    marginTop: 8,
    letterSpacing: 2,
  },
  footer: { position: 'absolute', bottom: 60, width: '100%', paddingHorizontal: 24 },
  button: {
    backgroundColor: Colors.nexus.brandPrimary,
    height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.nexus.brandPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16, color: '#FFFFFF',
    letterSpacing: 2,
  },
});
