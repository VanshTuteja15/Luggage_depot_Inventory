import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, spacing, touchTarget } from '@/constants/theme';

import { Text } from './Text';

type ListRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  showChevron?: boolean;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function ListRow({
  title,
  subtitle,
  meta,
  onPress,
  showChevron = Boolean(onPress),
  leftAccessory,
  rightAccessory,
  style,
  accessibilityLabel,
}: ListRowProps) {
  const content = (
    <>
      {leftAccessory ? <View style={styles.left}>{leftAccessory}</View> : null}
      <View style={styles.content}>
        <Text variant="label">{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" color={colors.textSecondary}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {meta ? (
          <Text variant="bodySmall" color={colors.textSecondary}>
            {meta}
          </Text>
        ) : null}
        {rightAccessory}
        {showChevron ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textMuted}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.disabledSurface,
  },
  left: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
