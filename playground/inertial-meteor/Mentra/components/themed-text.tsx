import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'largeTitle' | 'caption';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'largeTitle' ? styles.largeTitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'System', // San Francisco on iOS
  },
  defaultSemiBold: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    lineHeight: 41,
    letterSpacing: 0.37,
    // fontFamily: 'NewYork', // Would need custom font loading, using System Serif for now if possible or just bold
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: '#9BA1A6',
  }
});
