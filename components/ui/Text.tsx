import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { typography } from '@/constants/theme';

export type TextVariant = keyof typeof typography;

type AppTextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
};

export function Text({ variant = 'body', color, style, ...props }: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[typography[variant], color ? { color } : undefined, style]}
    />
  );
}

export const textStyles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});
