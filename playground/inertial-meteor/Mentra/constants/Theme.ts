import { Dimensions, Platform } from 'react-native';
import { Colors } from './Colors';

const { width, height } = Dimensions.get('window');

/**
 * Global Theme Metrics & Typography.
 * Does NOT duplicate Colors. Uses constants/Colors.ts if needed for internal definitions, but does NOT export Colors.
 */

export const Metrics = {
  screen: { width, height },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    round: 999,
  },
  icon: {
    s: 16,
    m: 24,
    l: 32,
  },
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5, color: Colors.mentra.text },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3, color: Colors.mentra.text },
  h3: { fontSize: 20, fontWeight: '700' as const, color: Colors.mentra.text },
  body: { fontSize: 16, lineHeight: 24, color: Colors.mentra.textDim },
  callout: { fontSize: 14, fontWeight: '600' as const, color: Colors.mentra.text },
  caption: { fontSize: 12, color: Colors.mentra.textDim, letterSpacing: 0.5 },
  // Platform safe monospace
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
};

// Legacy template compatibility
export const Fonts = {
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  rounded: Platform.OS === 'ios' ? 'System' : 'Roboto',
};

export const Shadows = {
  glow: {
    shadowColor: Colors.mentra.brandAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: Colors.mentra.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  }
};
