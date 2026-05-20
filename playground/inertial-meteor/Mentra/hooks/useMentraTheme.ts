/**
 * useMentraTheme — returns the correct Mentra color tokens
 * based on the device's current color scheme (light / dark).
 *
 * Usage:
 *   const C = useMentraTheme();
 *   <View style={{ backgroundColor: C.bg }} />
 */

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type MentraTokens = {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  textDim: string;
  muted: string;
  border: string;
  divider: string;
  // Brand colours stay constant
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;
  success: string;
  warning: string;
  danger: string;
  // Glass
  glassBg: string;
  glassBorder: string;
  // Status bar style ('dark' = dark icons, 'light' = light icons)
  statusBar: 'dark' | 'light';
  isDark: boolean;
};

export function useMentraTheme(): MentraTokens {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const m = Colors.mentra;
  const d = m.darkTokens;

  return {
    bg:        isDark ? d.bg        : m.bg,
    surface:   isDark ? d.surface   : m.surface,
    surface2:  isDark ? d.surface2  : m.surface2,
    text:      isDark ? d.text      : m.text,
    textDim:   isDark ? d.textDim   : m.textDim,
    muted:     isDark ? d.muted     : m.muted,
    border:    isDark ? d.border    : m.border,
    divider:   isDark ? d.divider   : m.divider,

    // Brand colours don't invert
    brandPrimary:   isDark ? m.primaryDark  : m.primaryLight,
    brandSecondary: isDark ? m.secondaryDark : m.secondaryLight,
    brandAccent:    isDark ? m.primaryDark  : m.secondaryLight,
    success:  m.success,
    warning:  m.warning,
    danger:   m.danger,

    glassBg:     isDark ? 'rgba(18,22,20,0.7)'  : 'rgba(255,255,255,0.7)',
    glassBorder: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(25,64,49,0.15)',

    statusBar: isDark ? 'light' : 'dark',
    isDark,
  };
}
