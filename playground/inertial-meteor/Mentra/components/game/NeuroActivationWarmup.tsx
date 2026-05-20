import React, { useState, useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Modal } from 'react-native';
import Animated, {
  FadeIn, FadeOut,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing
} from 'react-native-reanimated';
import { I18n } from '@/services/i18n';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';
import { Wind, Activity, CheckCircle2, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// This modal always renders on a dark overlay (#0F172A), so we use
// fixed "dark-mode" brand colours regardless of the app's current theme.
const OVERLAY_PRIMARY = '#4ADE80';  // mint — visible on dark bg
const OVERLAY_ACCENT  = '#A3C4B5';  // soft green
const OVERLAY_SUCCESS = '#10B981';

interface Props {
  visible: boolean;
  onComplete: () => void;
  tutorialText?: string;
  gameTitle?: string;
}

export const NeuroActivationWarmup = memo(({ visible, onComplete, tutorialText, gameTitle }: Props) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [isComplete, setIsComplete] = useState(false);
  const [taps, setTaps] = useState(0);

  // Animation values
  const breatheScale = useSharedValue(1);
  const progress = useSharedValue(0);
  const finishTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!visible) return;

    // Reset state on visible
    setTimeLeft(30);
    setPhase(1);
    setIsComplete(false);
    setTaps(0);
    progress.value = 0;

    // Breathing Animation
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          finish();
          return 0;
        }

        // Phase shifts for 30s total
        if (prev === 21) setPhase(2);
        if (prev === 11) setPhase(3);

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (finishTimeout.current) {
        clearTimeout(finishTimeout.current);
      }
    };
  }, [visible]);

  useEffect(() => {
    progress.value = withTiming(1 - (timeLeft / 60), { duration: 1000 });
  }, [timeLeft]);

  const finish = () => {
    setIsComplete(true);
    finishTimeout.current = setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const animeCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
    opacity: 0.3,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${(1 - timeLeft / 60) * 100}%`,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.progressHeader}>
           <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
           </View>
           <ThemedText style={styles.timerText}>{timeLeft}s</ThemedText>
        </View>

        <View style={styles.content}>
          <Animated.View
            key={isComplete ? 'complete' : 'playing'}
            entering={FadeIn}
            exiting={FadeOut}
            style={{ width: '100%', alignItems: 'center' }}
          >
            {!isComplete ? (
              <View style={styles.phaseContainer}>
                <ThemedText style={styles.title}>{gameTitle || I18n.t('warmupTitle')}</ThemedText>
                <ThemedText style={styles.subtitle}>{phase === 3 ? (I18n.t('howToPlay') || 'How to Play') : I18n.t('warmupSubtitle')}</ThemedText>

                <View style={styles.visualArea}>
                  {phase === 1 ? (
                    <View style={styles.breatheArea}>
                      <Animated.View style={[styles.breatheCircle, animeCircleStyle]} />
                      <View style={styles.breatheCore}>
                        <Wind size={40} color={OVERLAY_PRIMARY} />
                      </View>
                      <ThemedText style={styles.phaseLabel}>{I18n.t('warmupBreathLabel')}</ThemedText>
                      <ThemedText style={styles.instruction}>{I18n.t('warmupBreathInstruct')}</ThemedText>
                    </View>
                  ) : phase === 2 ? (
                    <View style={styles.motorArea}>
                      <Activity size={40} color={OVERLAY_ACCENT} />
                      <ThemedText style={styles.phaseLabel}>{I18n.t('warmupMotorLabel')}</ThemedText>
                      <ThemedText style={styles.instruction}>{I18n.t('warmupMotorInstruct')}</ThemedText>

                      <View style={styles.tapTargets}>
                        <Pressable
                          onPress={() => setTaps(t => t + 1)}
                          style={({ pressed }: { pressed: boolean }) => [styles.tapBtn, pressed && styles.tapBtnPressed]}
                        >
                           <ThemedText style={styles.tapText}>L</ThemedText>
                        </Pressable>
                        <Pressable
                          onPress={() => setTaps(t => t + 1)}
                          style={({ pressed }: { pressed: boolean }) => [styles.tapBtn, styles.tapBtnRight, pressed && styles.tapBtnPressed]}
                        >
                           <ThemedText style={styles.tapText}>R</ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.tutorialArea}>
                       <Animated.View entering={FadeIn.delay(300)} style={styles.tutorialIcon}>
                          <Sparkles size={48} color={OVERLAY_PRIMARY} />
                       </Animated.View>
                       <ThemedText style={styles.phaseLabel}>{I18n.t('howToPlay')}</ThemedText>
                       <ThemedText style={styles.tutorialText}>{tutorialText || I18n.t('descDefault')}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.completeContainer}>
                <CheckCircle2 size={80} color={OVERLAY_SUCCESS} />
                <ThemedText style={styles.completeTitle}>{I18n.t('warmupComplete')}</ThemedText>
                <View style={styles.shieldBadge}>
                   <Sparkles size={14} color={OVERLAY_PRIMARY} />
                   <ThemedText style={styles.shieldText}>CEREBRAL SHIELD ACTIVE</ThemedText>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    marginBottom: 40,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: OVERLAY_PRIMARY,
  },
  timerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    width: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  phaseContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 50,
  },
  visualArea: {
    height: 300,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breatheArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  breatheCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: OVERLAY_PRIMARY,
  },
  breatheCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  motorArea: {
    alignItems: 'center',
    width: '100%',
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: OVERLAY_PRIMARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  instruction: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 26,
  },
  tutorialArea: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  tutorialIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: OVERLAY_PRIMARY + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: OVERLAY_PRIMARY + '44',
  },
  tutorialText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '600',
  },
  tapTargets: {
    flexDirection: 'row',
    display: 'flex',
    marginTop: 40,
  },
  tapBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: OVERLAY_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  tapBtnPressed: {
    backgroundColor: OVERLAY_ACCENT + '33',
  },
  tapBtnRight: {
    borderColor: OVERLAY_PRIMARY,
  },
  tapText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  completeContainer: {
    alignItems: 'center',
    display: 'flex',
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    backgroundColor: OVERLAY_PRIMARY + '22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OVERLAY_PRIMARY + '44',
  },
  shieldText: {
    fontSize: 11,
    fontWeight: '800',
    color: OVERLAY_PRIMARY,
    letterSpacing: 1,
    marginLeft: 8,
  }
});
