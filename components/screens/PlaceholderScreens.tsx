import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Href } from 'expo-router';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Header,
  Input,
  ListRow,
  ScreenContainer,
  SearchBar,
  Select,
  StatCard,
  Text,
} from '@/components/ui';
import { APP_NAV_ITEMS } from '@/constants/navigation';
import { colors, spacing } from '@/constants/theme';

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
  phase: string;
};

export function PlaceholderScreen({ title, subtitle, phase }: PlaceholderScreenProps) {
  return (
    <ScreenContainer>
      <Header title={title} subtitle={subtitle} />
      <Card>
        <Text variant="body" color={colors.textSecondary}>
          This screen will be implemented in {phase}. The navigation shell and shared components are
          ready.
        </Text>
      </Card>
    </ScreenContainer>
  );
}

export function DashboardPlaceholder() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState<'all' | 'downtown'>('all');

  return (
    <ScreenContainer>
      <Header title="Dashboard" subtitle="Calgary retail operations overview" />
      <View style={styles.statGrid}>
        <StatCard label="Total SKUs" value="—" icon="cube-outline" />
        <StatCard label="Total Units" value="—" icon="layers-outline" />
        <StatCard label="Locations" value="—" icon="location-outline" />
        <StatCard
          label="Low Stock"
          value="—"
          icon="warning-outline"
          variant="warning"
          trend="Connect data in Phase 2+"
        />
      </View>

      <Card style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.quickLinks}>
          {APP_NAV_ITEMS.slice(1, 5).map((item) => (
            <ListRow
              key={item.label}
              title={item.label}
              subtitle={item.description}
              showChevron={false}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Design System Preview
        </Text>
        <View style={styles.previewRow}>
          <Badge label="In Stock" variant="success" icon="checkmark-circle" />
          <Badge label="Low Stock" variant="error" icon="alert-circle" />
          <Badge label="Transfer" variant="accent" icon="swap-horizontal" />
        </View>
        <View style={styles.previewStack}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search inventory..." />
          <Select
            label="Location"
            placeholder="All locations"
            options={[
              { label: 'All locations', value: 'all' },
              { label: 'Downtown Calgary', value: 'downtown' },
            ]}
            value={location}
            onChange={setLocation}
          />
          <Input label="Sample field" placeholder="Shared input component" />
          <View style={styles.buttonRow}>
            <Button label="Primary" onPress={() => undefined} />
            <Button label="Outline" variant="outline" onPress={() => undefined} />
          </View>
        </View>
      </Card>

      <EmptyState
        title="No recent stock movements"
        description="Recent activity will appear here once inventory data is connected in later phases."
        icon="time-outline"
      />
    </ScreenContainer>
  );
}

export function LoginPlaceholder() {
  return (
    <ScreenContainer contentContainerStyle={styles.loginContent}>
      <View style={styles.loginBrand}>
        <Text variant="h1" color={colors.primary}>
          Luggage Depot OS
        </Text>
        <Text variant="body" color={colors.textSecondary}>
          Sign in to manage inventory across all Calgary locations.
        </Text>
      </View>
      <Card style={styles.loginCard}>
        <Text variant="h3">Admin Login</Text>
        <Input
          label="Email"
          placeholder="owner@luggagedepot.ca"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
        />
        <Input label="Password" placeholder="••••••••" secureTextEntry editable={false} />
        <Button label="Sign In" onPress={() => undefined} fullWidth />
        <Text variant="bodySmall" color={colors.textSecondary}>
          Authentication will be enabled in Phase 3. Accounts are created manually in Supabase.
        </Text>
      </Card>
    </ScreenContainer>
  );
}

export function getNavHref(itemLabel: string): Href | undefined {
  return APP_NAV_ITEMS.find((item) => item.label === itemLabel)?.href;
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  quickLinks: {
    gap: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  previewStack: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  loginContent: {
    justifyContent: 'center',
    minHeight: '100%',
    gap: spacing.xl,
  },
  loginBrand: {
    gap: spacing.sm,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  loginCard: {
    gap: spacing.md,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
});
