import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/constants/theme';

import { Text } from './Text';

type LoadingStateProps = {
  message?: string;
  style?: StyleProp<ViewStyle>;
};

export function LoadingState({ message = 'Loading...', style }: LoadingStateProps) {
  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="body" color={colors.textSecondary}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    minHeight: 200,
  },
});
