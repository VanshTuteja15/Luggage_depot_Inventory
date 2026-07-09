import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { badgeStyles, type BadgeVariant } from '@/constants/theme';

import { Text } from './Text';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, variant = 'default', icon, style }: BadgeProps) {
  const palette = badgeStyles[variant];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.badge,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        style,
      ]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={palette.text}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : null}
      <Text variant="caption" style={{ color: palette.text }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
});
