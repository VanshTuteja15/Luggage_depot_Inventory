import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';

export function DemoModeBanner() {
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
      <Text variant="bodySmall" color={colors.warning} style={styles.copy}>
        Demo Mode — forecasts are based on simulated sales data, not real transactions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#E8C98A',
    backgroundColor: colors.warningSurface,
    marginBottom: spacing.md,
  },
  copy: {
    flex: 1,
  },
});
