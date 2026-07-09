import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, shadows, spacing } from '@/constants/theme';

import { Text } from './Text';

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: string;
  variant?: 'default' | 'warning' | 'error' | 'success';
  style?: StyleProp<ViewStyle>;
};

const variantColors = {
  default: colors.primary,
  warning: colors.warning,
  error: colors.error,
  success: colors.success,
};

const variantIconBg = {
  default: colors.disabledSurface,
  warning: colors.warningSurface,
  error: colors.errorSurface,
  success: colors.successSurface,
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  style,
}: StatCardProps) {
  const accent = variantColors[variant];

  return (
    <View style={[styles.card, style]} accessibilityRole="summary" accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.header}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: variantIconBg[variant] }]}>
            <Ionicons name={icon} size={20} color={accent} />
          </View>
        ) : null}
        <Text variant="bodySmall" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      </View>
      <Text variant="h1" style={styles.value}>
        {value}
      </Text>
      {trend ? (
        <Text variant="caption" color={accent}>
          {trend}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    minWidth: 140,
    flex: 1,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
  value: {
    marginTop: spacing.xs,
  },
});
