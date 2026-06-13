import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Metrics, Typography } from '@/constants/Theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style
}) => {
  return (
    <Animated.View 
      entering={FadeInDown.delay(100).springify().damping(14)} 
      style={[styles.container, style]}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionLabel && onAction && (
        <Pressable 
          onPress={onAction} 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Metrics.spacing.xl,
  },
  iconContainer: {
    marginBottom: Metrics.spacing.l,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.mentra.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.mentra.border,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Metrics.spacing.s,
    color: Colors.mentra.text,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Metrics.spacing.xl,
    paddingHorizontal: Metrics.spacing.l,
  },
  button: {
    backgroundColor: Colors.mentra.brandPrimary,
    paddingHorizontal: Metrics.spacing.xl,
    paddingVertical: 14,
    borderRadius: Metrics.radius.round,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  }
});
