import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInLeft, FadeOut } from 'react-native-reanimated';
import { BrainCircuit, Activity, Zap, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const steps = [
  {
    title: "Break the Addiction",
    desc: "Rewire your dopamine reward pathways through scientifically calibrated stimulus control.",
    icon: BrainCircuit,
    color: '#008080',
  },
  {
    title: "Know Your Potential",
    desc: "Real-time biometric monitoring and NeuroScore analytics track your cognitive evolution.",
    icon: Activity,
    color: '#4A90E2',
  },
  {
    title: "Optimized Protocol",
    desc: "Daily training sessions tailored to your current neural readiness state.",
    icon: Zap,
    color: '#FFD700',
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const StepContent = ({ step }: any) => {
    const Icon = step.icon;
    return (
      <View style={styles.stepContainer}>
        <View style={[styles.iconBox, { backgroundColor: step.color + '15' }]}>
          <Icon size={100} color={step.color} strokeWidth={1.5} />
        </View>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDesc}>{step.desc}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.nexus.bg, Colors.nexus.bgDark]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Animated.View 
          key={currentStep}
          entering={FadeInRight.duration(600)} 
          exiting={FadeOut.duration(300)}
          style={{ flex: 1 }}
        >
          <StepContent step={steps[currentStep]} />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {steps.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { backgroundColor: i === currentStep ? Colors.nexus.brandPrimary : 'rgba(255,255,255,0.1)' }
              ]} 
            />
          ))}
        </View>

        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentStep === steps.length - 1 ? 'GET STARTED' : 'CONTINUE'}
          </Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, alignItems: 'flex-end' },
  skipText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  
  content: { flex: 1, paddingHorizontal: 24 },
  stepContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  stepTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  stepDesc: { fontFamily: 'Manrope-Medium', fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },

  footer: { paddingHorizontal: 24, paddingBottom: 60 },
  pagination: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  
  nextBtn: { 
    height: 60, borderRadius: 30, backgroundColor: Colors.nexus.brandPrimary, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 
  },
  nextText: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#FFFFFF', letterSpacing: 1 },
});
