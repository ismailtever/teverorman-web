import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn, FadeOut, ZoomOut, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Metrics, Typography } from '@/constants/Theme';
import { Award, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  primaryValue?: string | number;
  primaryLabel?: string;
  buttonText?: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  primaryValue,
  primaryLabel,
  buttonText = 'Continue'
}) => {
  useEffect(() => {
    if (visible) {
      // Trigger strong haptic feedback on appear
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View 
        entering={FadeIn.duration(300)} 
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <Animated.View 
          entering={ZoomIn.duration(400).springify().damping(12)}
          exiting={ZoomOut.duration(200)}
          style={styles.card}
        >
          <LinearGradient
            colors={[Colors.mentra.brandPrimary, '#20503D']}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
          
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="rgba(255,255,255,0.6)" />
          </Pressable>

          <View style={styles.iconWrapper}>
            <Award size={48} color="#F59E0B" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {primaryValue !== undefined && (
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>{primaryValue}</Text>
              {primaryLabel && <Text style={styles.valueLabel}>{primaryLabel}</Text>}
            </View>
          )}

          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }} 
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
            ]}
          >
            <Text style={styles.actionBtnText}>{buttonText}</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.spacing.l,
  },
  card: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: Colors.mentra.brandPrimary,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  title: {
    ...Typography.h2,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  valueBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  valueText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: '#FFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: Metrics.radius.xl,
    alignItems: 'center',
  },
  actionBtnText: {
    color: Colors.mentra.brandPrimary,
    fontWeight: '800',
    fontSize: 16,
  }
});
