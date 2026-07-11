import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

type DetailSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <Card style={styles.section}>
      <Text variant="h3" style={styles.title}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <View style={styles.field}>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  field: {
    gap: 2,
    minWidth: '45%',
    flexGrow: 1,
  },
});

export function DetailFieldGrid({ children }: { children: React.ReactNode }) {
  return <View style={gridStyles.grid}>{children}</View>;
}

const gridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
