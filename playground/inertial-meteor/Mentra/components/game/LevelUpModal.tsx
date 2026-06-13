import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    ZoomIn, FadeIn, useSharedValue, useAnimatedStyle,
    withSequence, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { I18n } from '@/services/i18n';
import { Metrics } from '@/constants/Theme';

const { width: W, height: H } = Dimensions.get('window');

interface DifficultyChanged {
  gameId: string;
  what: string;
  science: string;
}

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  tierKey: string;
  tierName: string;
  reactionImprovement: number | null;
  accuracyImprovement: number | null;
  onClose: () => void;
  difficultyChanged?: DifficultyChanged;
}

// Removed ConfettiParticle for battery optimization

export function LevelUpModal({
  visible,
  newLevel,
  tierKey,
  tierName,
  reactionImprovement,
  accuracyImprovement,
  onClose,
  difficultyChanged,
}: LevelUpModalProps) {
    // @ts-ignore
    const title = (I18n.t(tierKey) as string) || tierName;

    const hasReaction = reactionImprovement !== null && reactionImprovement > 0;
    const hasAccuracy = accuracyImprovement !== null && accuracyImprovement > 0;
    useEffect(() => {
        if (visible) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>

                <Animated.View entering={ZoomIn.springify().damping(13).stiffness(120)} style={styles.card}>
                    {/* Top glow ring */}
                    <View style={styles.glowRing}>
                        <Text style={styles.emoji}>⭐</Text>
                    </View>

                    {/* @ts-ignore */}
                    <Text style={styles.levelUpLabel}>{I18n.t('lvlUpTitle') as string}</Text>

                    <Text style={styles.levelText}>{I18n.t('level')} {newLevel}</Text>
                    <View style={styles.tierBadge}>
                        <Text style={styles.tierBadgeText}>{title.toUpperCase()}</Text>
                    </View>

                    {/* Before/After Progress stats */}
                    {(hasReaction || hasAccuracy) && (
                        <Animated.View entering={FadeIn.delay(300)} style={styles.statsBox}>
                            {/* @ts-ignore */}
                            <Text style={styles.statsTitle}>{I18n.t('vsLastTime') as string || 'Son oynayışına göre'}</Text>
                            {hasReaction && (
                                <View style={styles.statRow}>
                                    {/* @ts-ignore */}
                                    <Text style={styles.statLabel}>{I18n.t('levelUpReaction') as string}</Text>
                                    {/* @ts-ignore */}
                                    <Text style={styles.statValue}>{(I18n.t('levelUpReactionDetail') as string).replace('{{ms}}', String(reactionImprovement))}</Text>
                                </View>
                            )}
                            {hasAccuracy && (
                                <View style={styles.statRow}>
                                    {/* @ts-ignore */}
                                    <Text style={styles.statLabel}>{I18n.t('levelUpAccuracy') as string}</Text>
                                    {/* @ts-ignore */}
                                    <Text style={styles.statValue}>{(I18n.t('levelUpAccuracyDetail') as string).replace('{{pct}}', String(accuracyImprovement))}</Text>
                                </View>
                            )}
                        </Animated.View>
                    )}

                    {/* Difficulty evolved */}
                    {difficultyChanged && (
                        <Animated.View entering={FadeIn.delay(500)} style={styles.difficultyBox}>
                            {/* @ts-ignore */}
                            <Text style={styles.difficultyTitle}>{I18n.t('difficultyEvolved') as string || '🧠 Antrenman evrildi'}</Text>
                            <Text style={styles.difficultyWhat}>{difficultyChanged.what}</Text>
                            <Text style={styles.difficultyScience}>{difficultyChanged.science}</Text>
                        </Animated.View>
                    )}

                    <Pressable onPress={onClose} style={styles.btn}>
                        {/* @ts-ignore */}
                        <Text style={styles.btnText}>{I18n.t('continue') as string}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    card: {
        backgroundColor: Colors.mentra.surface,
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        marginHorizontal: 24,
        gap: 10,
        elevation: 24,
        borderWidth: 1.5,
        borderColor: Colors.mentra.brandPrimary + '40',
        width: W - 48,
    },
    glowRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.mentra.brandPrimary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.mentra.brandPrimary + '50',
        marginBottom: 4,
    },
    emoji: { fontSize: 40 },
    levelUpLabel: {
        fontSize: 11, fontWeight: '800', color: Colors.mentra.brandPrimary,
        letterSpacing: 2.5, textTransform: 'uppercase',
    },
    levelText: {
        fontSize: 36, fontWeight: '900', color: Colors.mentra.text,
        textAlign: 'center', letterSpacing: -1,
    },
    tierBadge: {
        backgroundColor: Colors.mentra.brandPrimary,
        borderRadius: Metrics.radius.m,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    tierBadgeText: {
        fontSize: 11, fontWeight: '800', color: '#FFF', letterSpacing: 2,
    },
    statsBox: {
        marginTop: 4,
        width: '100%',
        backgroundColor: Colors.mentra.surface2,
        borderRadius: Metrics.radius.m,
        padding: Metrics.spacing.m,
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.mentra.border,
    },
    statsTitle: {
        fontSize: 10, fontWeight: '800', color: Colors.mentra.textDim,
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13, fontWeight: '600', color: Colors.mentra.text,
    },
    statValue: {
        fontSize: 13, fontWeight: '800', color: Colors.mentra.success,
    },
    difficultyBox: {
        width: '100%',
        padding: 14,
        borderRadius: 14,
        backgroundColor: Colors.mentra.brandPrimary + '10',
        borderWidth: 1,
        borderColor: Colors.mentra.brandPrimary + '30',
        alignItems: 'center',
        gap: 4,
    },
    difficultyTitle: {
        fontSize: 11, fontWeight: '800', color: Colors.mentra.brandPrimary,
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
    },
    difficultyWhat: {
        fontSize: 14, fontWeight: '700', color: Colors.mentra.text ?? '#000',
        textAlign: 'center',
    },
    difficultyScience: {
        fontSize: 12, color: Colors.mentra.textDim ?? '#666',
        textAlign: 'center', lineHeight: 18,
    },
    btn: {
        marginTop: 8,
        backgroundColor: Colors.mentra.brandPrimary,
        borderRadius: 16,
        paddingHorizontal: 48,
        paddingVertical: 16,
        width: '100%',
        alignItems: 'center',
    },
    btnText: { fontSize: 17, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },
});
