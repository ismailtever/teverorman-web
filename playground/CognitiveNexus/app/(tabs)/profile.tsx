import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Settings, CreditCard, ShieldCheck, Mail, LogOut, ChevronRight, User, Terminal } from 'lucide-react-native';

const VerbatimProfileItem = ({ icon: Icon, title, desc, delay }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.profileItemBox}>
    <Pressable style={styles.profileItem}>
      <View style={styles.profileIconCircle}>
        <Icon size={20} color={Colors.nexus.brandPrimary} />
      </View>
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        <Text style={styles.profileItemDesc}>{desc}</Text>
      </View>
      <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
    </Pressable>
  </Animated.View>
);

export default function VerbatimProfileScreen() {
  const insets = useSafeAreaInsets();
  const [scientistMode, setScientistMode] = React.useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[Colors.nexus.bg, Colors.nexus.bgDark]} style={StyleSheet.absoluteFill} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Verbatim Profile Identity */}
        <View style={styles.identitySection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBase}>
              <User size={64} color={Colors.nexus.brandPrimary} />
            </View>
            <View style={styles.verifiedBadge} />
          </View>
          <Text style={styles.scientistName}>Dr. Julian Thorne</Text>
          <Text style={styles.scientistRole}>Director of NeuroArchitecture · Lab ID 882</Text>
        </View>

        {/* Verbatim Mode Toggles */}
        <View style={styles.modeSection}>
          <View style={styles.modeCard}>
            <View style={styles.modeInfo}>
              <Terminal size={20} color={Colors.nexus.brandPrimary} />
              <View>
                <Text style={styles.modeTitle}>Scientist Mode</Text>
                <Text style={styles.modeDesc}>Enable RAW biometric data visualization.</Text>
              </View>
            </View>
            <Switch 
              value={scientistMode} 
              onValueChange={setScientistMode}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.nexus.brandPrimary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="rgba(255,255,255,0.1)"
            />
          </View>
        </View>

        {/* Verbatim Menu Sections */}
        <View style={styles.menuGrid}>
          <VerbatimProfileItem 
            icon={Settings} 
            title="Laboratory Settings" 
            desc="Hardware calibration & AI models" 
            delay={100} 
          />
          <VerbatimProfileItem 
            icon={CreditCard} 
            title="Billing & Access" 
            desc="Manage your subscription" 
            delay={200} 
          />
          <VerbatimProfileItem 
            icon={ShieldCheck} 
            title="Privacy Protocol" 
            desc="Data encryption standards" 
            delay={300} 
          />
          <VerbatimProfileItem 
            icon={Mail} 
            title="Lab Support" 
            desc="Contact neuro-engineering team" 
            delay={400} 
          />
        </View>

        <Pressable style={styles.deactivateBtn}>
          <LogOut size={18} color="#FF4D4D" />
          <Text style={styles.deactivateText}>Deactivate Session</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B172A' },
  scroll: { paddingHorizontal: 20 },

  identitySection: { alignItems: 'center', marginTop: 48, marginBottom: 40 },
  avatarWrapper: { position: 'relative', marginBottom: 24 },
  avatarBase: { 
    width: 140, height: 140, borderRadius: 70, 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderWidth: 1, borderColor: 'rgba(32, 225, 225, 0.2)',
    alignItems: 'center', justifyContent: 'center'
  },
  verifiedBadge: { 
    position: 'absolute', bottom: 8, right: 8, 
    width: 28, height: 28, borderRadius: 14, 
    backgroundColor: '#20E1E1', borderWidth: 4, borderColor: '#0B172A' 
  },
  scientistName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, color: '#FFFFFF', marginBottom: 6 },
  scientistRole: { fontFamily: 'Manrope-Medium', fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },

  modeSection: { marginBottom: 24 },
  modeCard: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 28, padding: 24, paddingVertical: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' 
  },
  modeInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  modeTitle: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#FFFFFF' },
  modeDesc: { fontFamily: 'Manrope-Medium', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  menuGrid: { gap: 12 },
  profileItemBox: { borderRadius: 24, overflow: 'hidden' },
  profileItem: { 
    flexDirection: 'row', alignItems: 'center', padding: 20, 
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' 
  },
  profileIconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(32, 225, 225, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  profileItemContent: { flex: 1 },
  profileItemTitle: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#FFFFFF' },
  profileItemDesc: { fontFamily: 'Manrope-Medium', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 },

  deactivateBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, 
    marginTop: 48, paddingVertical: 20, borderRadius: 24, backgroundColor: 'rgba(255, 77, 77, 0.05)',
    borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.1)'
  },
  deactivateText: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#FF4D4D', letterSpacing: 0.5 },
});
