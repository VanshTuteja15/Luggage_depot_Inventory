import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, touchTarget, typography } from '@/constants/theme';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: string; pressed: ViewStyle; disabled: ViewStyle }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: colors.textOnDark,
    pressed: { backgroundColor: colors.primaryDark },
    disabled: { backgroundColor: colors.disabled },
  },
  secondary: {
    container: { backgroundColor: colors.accent },
    text: colors.textPrimary,
    pressed: { backgroundColor: '#B8923F' },
    disabled: { backgroundColor: colors.disabledSurface },
  },
  outline: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    text: colors.primary,
    pressed: { backgroundColor: colors.disabledSurface },
    disabled: { borderColor: colors.border, backgroundColor: colors.disabledSurface },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: colors.primary,
    pressed: { backgroundColor: colors.disabledSurface },
    disabled: { backgroundColor: 'transparent' },
  },
  danger: {
    container: { backgroundColor: colors.error },
    text: colors.textOnDark,
    pressed: { backgroundColor: '#8F1D17' },
    disabled: { backgroundColor: colors.disabled },
  },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  const palette = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        palette.container,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && palette.pressed,
        isDisabled && palette.disabled,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.textPrimary : palette.text}
          size="small"
        />
      ) : (
        <Text
          variant="label"
          style={[
            styles.label,
            {
              color: isDisabled ? colors.textMuted : palette.text,
              fontSize: size === 'sm' ? typography.bodySmall.fontSize : typography.label.fontSize,
            },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    minHeight: touchTarget,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sm: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: touchTarget,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    textAlign: 'center',
  },
});
