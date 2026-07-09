import { StyleSheet, View } from 'react-native';

import {
  Badge,
  Card,
  ErrorState,
  Header,
  ListRow,
  LoadingState,
  ScreenContainer,
  StatCard,
  Text,
} from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { riskLevelToBadgeVariant } from '@/services/forecast';
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/format';

import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

function formatMovementChange(change: number): string {
  return change > 0 ? `+${change}` : `${change}`;
}

export function DashboardView() {
  const { metrics, loading, error } = useDashboardMetrics();

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState message="Loading retail metrics..." />
      </ScreenContainer>
    );
  }

  if (error || !metrics) {
    return (
      <ScreenContainer scroll={false}>
        <ErrorState message={error ?? 'Dashboard data is unavailable.'} />
      </ScreenContainer>
    );
  }

  const topBrand = metrics.topBrands[0];
  const topCategory = metrics.topCategories[0];

  return (
    <ScreenContainer>
      <Header
        title="Dashboard"
        subtitle="Calgary retail operations — live dummy data"
      />

      <View style={styles.statGrid}>
        <StatCard
          label="Inventory Value"
          value={formatCurrency(metrics.inventoryValue)}
          icon="cash-outline"
        />
        <StatCard
          label="Potential Revenue"
          value={formatCurrency(metrics.potentialRevenue)}
          icon="trending-up-outline"
          variant="success"
        />
        <StatCard
          label="Potential Profit"
          value={formatCurrency(metrics.potentialProfit)}
          icon="pie-chart-outline"
          variant="success"
        />
      </View>

      <View style={styles.statGrid}>
        <StatCard label="Products" value={formatNumber(metrics.totalProducts)} icon="briefcase-outline" />
        <StatCard label="Variants" value={formatNumber(metrics.totalVariants)} icon="layers-outline" />
        <StatCard label="Total Units" value={formatNumber(metrics.totalUnits)} icon="cube-outline" />
        <StatCard
          label="Low Stock"
          value={formatNumber(metrics.lowStockCount)}
          icon="warning-outline"
          variant="warning"
        />
        <StatCard
          label="Need Reordering"
          value={formatNumber(metrics.needReorderingCount)}
          icon="cart-outline"
          variant="error"
        />
        <StatCard
          label="Out of Stock"
          value={formatNumber(metrics.outOfStockCount)}
          icon="close-circle-outline"
          variant="error"
        />
      </View>

      <Card style={styles.section}>
        <Text variant="h3">Forecast Summary</Text>
        <Text variant="bodySmall" color={colors.textSecondary}>
          Rule-based reorder alerts from 30-day sales velocity
        </Text>
        {metrics.forecastAlerts.length === 0 ? (
          <Text variant="body" color={colors.textSecondary} style={styles.emptyCopy}>
            No forecast alerts right now.
          </Text>
        ) : (
          <View style={styles.alertList}>
            {metrics.forecastAlerts.map((alert) => (
              <View key={alert.variantId} style={styles.alertRow}>
                <View style={styles.alertCopy}>
                  <Text variant="label">{alert.productName}</Text>
                  <Text variant="bodySmall" color={colors.textSecondary}>
                    {alert.sku} · Reorder {alert.recommendedReorder} units
                  </Text>
                  <Text variant="bodySmall" color={colors.textSecondary}>
                    {alert.message}
                  </Text>
                </View>
                <Badge
                  label={alert.riskLevel.toUpperCase()}
                  variant={riskLevelToBadgeVariant(alert.riskLevel)}
                  icon="alert-circle-outline"
                />
              </View>
            ))}
          </View>
        )}
      </Card>

      <View style={styles.twoColumn}>
        <Card style={styles.halfSection}>
          <Text variant="h3">Top Brand</Text>
          {topBrand ? (
            <>
              <Text variant="h2" style={styles.rankName}>
                {topBrand.name}
              </Text>
              <Text variant="body" color={colors.textSecondary}>
                {formatCurrency(topBrand.value)} potential revenue
              </Text>
              <Text variant="bodySmall" color={colors.textMuted}>
                {topBrand.label}
              </Text>
            </>
          ) : (
            <Text variant="body" color={colors.textSecondary}>
              No brand data
            </Text>
          )}
        </Card>

        <Card style={styles.halfSection}>
          <Text variant="h3">Top Category</Text>
          {topCategory ? (
            <>
              <Text variant="h2" style={styles.rankName}>
                {topCategory.name}
              </Text>
              <Text variant="body" color={colors.textSecondary}>
                {formatCurrency(topCategory.value)} inventory value
              </Text>
              <Text variant="bodySmall" color={colors.textMuted}>
                {topCategory.label}
              </Text>
            </>
          ) : (
            <Text variant="body" color={colors.textSecondary}>
              No category data
            </Text>
          )}
        </Card>
      </View>

      <Card style={styles.section}>
        <Text variant="h3">Recent Activity</Text>
        <Text variant="bodySmall" color={colors.textSecondary}>
          Latest stock movements across all locations
        </Text>
        <View style={styles.list}>
          {metrics.recentMovements.map((movement) => (
            <ListRow
              key={movement.id}
              title={movement.productName}
              subtitle={`${movement.variantSku} · ${movement.locationName}`}
              meta={formatRelativeTime(movement.createdAt)}
              showChevron={false}
              rightAccessory={
                <Badge
                  label={formatMovementChange(movement.change)}
                  variant={movement.change < 0 ? 'warning' : 'success'}
                />
              }
            />
          ))}
        </View>
      </Card>
    </ScreenContainer>
  );
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
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  halfSection: {
    flex: 1,
    minWidth: 260,
    gap: spacing.sm,
  },
  rankName: {
    marginTop: spacing.xs,
  },
  alertList: {
    gap: spacing.md,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  alertCopy: {
    flex: 1,
    gap: 2,
  },
  emptyCopy: {
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
