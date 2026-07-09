import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  primary: '#1A2B4C',
  primaryDark: '#121E36',
  accent: '#C9A24B',
  accentMuted: '#E8D5A8',
  background: '#F7F7F5',
  surface: '#FFFFFF',
  textPrimary: '#16181D',
  textOnDark: '#F2F2F0',
  textSecondary: '#3D434C',
  textMuted: '#5C6370',
  border: '#D4D6D2',
  borderStrong: '#B8BBB6',
  error: '#B3261E',
  errorSurface: '#FCEEEE',
  warning: '#8A5A00',
  warningSurface: '#FFF4E0',
  success: '#1E6E42',
  successSurface: '#E8F5EE',
  overlay: 'rgba(22, 24, 29, 0.45)',
  disabled: '#9AA0A8',
  disabledSurface: '#ECECEA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const touchTarget = 44;

/** WCAG AA targets used across the design system */
export const accessibility = {
  minTouchTarget: touchTarget,
  minBodyFontSize: 16,
  minLargeTextFontSize: 18,
  minLineHeightRatio: 1.4,
  minContrastBody: 4.5,
  minContrastLargeText: 3,
  focusRingColor: colors.accent,
} as const;

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
});

export const typography = {
  h1: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textSecondary,
  },
} as const satisfies Record<string, TextStyle>;

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 2px 8px rgba(22, 24, 29, 0.08)',
    },
  }),
} as const;

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent' | 'neutral';

export const badgeStyles: Record<
  BadgeVariant,
  { background: string; text: string; border: string }
> = {
  default: {
    background: colors.primary,
    text: colors.textOnDark,
    border: colors.primary,
  },
  success: {
    background: colors.successSurface,
    text: colors.success,
    border: '#B8D9C8',
  },
  warning: {
    background: colors.warningSurface,
    text: colors.warning,
    border: '#E8C98A',
  },
  error: {
    background: colors.errorSurface,
    text: colors.error,
    border: '#E8B4B0',
  },
  accent: {
    background: colors.accentMuted,
    text: '#5C4A1E',
    border: colors.accent,
  },
  neutral: {
    background: colors.disabledSurface,
    text: colors.textSecondary,
    border: colors.border,
  },
};
