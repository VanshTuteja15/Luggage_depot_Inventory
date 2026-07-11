import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import {
  Badge,
  Button,
  ErrorState,
  Header,
  ListRow,
  LoadingState,
  ScreenContainer,
  Text,
} from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { riskLevelToBadgeVariant } from '@/services/forecast';
import { formatVariantLabel } from '@/services/inventory';
import { formatCurrency, formatNumber, formatPercent, formatRelativeTime } from '@/utils/format';

import { DemoModeBanner } from './DemoModeBanner';
import { DetailField, DetailFieldGrid, DetailSection } from './DetailSection';
import { InventoryStockBadge } from '@/features/inventory/components/InventoryStockBadge';
import { useVariantDetail } from '../hooks/useVariantDetail';

type VariantDetailViewProps = {
  variantId: string;
};

function route(path: string): Href {
  return path as Href;
}

export function VariantDetailView({ variantId }: VariantDetailViewProps) {
  const router = useRouter();
  const { detail, loading, error } = useVariantDetail(variantId);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState message="Loading product details..." />
      </ScreenContainer>
    );
  }

  if (error || !detail) {
    return (
      <ScreenContainer scroll={false}>
        <ErrorState message={error ?? 'Product variant not found.'} />
      </ScreenContainer>
    );
  }

  const { unitPricing } = detail;

  return (
    <ScreenContainer>
      <Header
        title={detail.product.name}
        subtitle={`${detail.brand.name} · ${formatVariantLabel(detail.variant.color, detail.variant.size)}`}
        showBack
        actions={[
          {
            icon: 'create-outline',
            label: 'Edit product',
            onPress: () => router.push(route(`/inventory/edit/${detail.variant.id}`)),
          },
        ]}
      />

      <DemoModeBanner />

      <View style={styles.statusRow}>
        <InventoryStockBadge status={detail.stockStatus} />
        <Badge
          label={detail.variant.active ? 'Active' : 'Inactive'}
          variant={detail.variant.active ? 'success' : 'neutral'}
        />
      </View>

      <DetailSection title="Parent Product">
        <DetailFieldGrid>
          <DetailField label="Product name" value={detail.product.name} />
          <DetailField label="Brand" value={detail.brand.name} />
          <DetailField label="Category" value={detail.category.name} />
          <DetailField label="Supplier" value={detail.supplier.name} />
        </DetailFieldGrid>
        {detail.product.description ? (
          <DetailField label="Description" value={detail.product.description} />
        ) : null}
        {detail.product.notes ? <DetailField label="Notes" value={detail.product.notes} /> : null}
      </DetailSection>

      <DetailSection title="Selected Variant">
        <DetailFieldGrid>
          <DetailField label="Color" value={detail.variant.color} />
          <DetailField label="Size" value={detail.variant.size} />
          <DetailField label="SKU" value={detail.variant.sku} />
          <DetailField label="Barcode" value={detail.variant.barcode} />
          <DetailField label="Low-stock threshold" value={String(detail.variant.threshold)} />
          <DetailField label="Reorder point" value={String(detail.variant.reorderPoint)} />
        </DetailFieldGrid>
        {detail.siblingVariants.length > 0 ? (
          <View style={styles.siblings}>
            <Text variant="caption" color={colors.textSecondary}>
              Other variants for this product
            </Text>
            <View style={styles.siblingList}>
              {detail.siblingVariants.map((sibling) => (
                <Pressable
                  key={sibling.id}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${formatVariantLabel(sibling.color, sibling.size)}`}
                  onPress={() => router.push(route(`/inventory/${sibling.id}`))}
                  style={styles.siblingChip}>
                  <Text variant="bodySmall" color={colors.primary}>
                    {formatVariantLabel(sibling.color, sibling.size)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </DetailSection>

      <DetailSection title="Pricing">
        <DetailFieldGrid>
          <DetailField label="Landed cost" value={formatCurrency(unitPricing.landedCost)} />
          <DetailField label="Retail price" value={formatCurrency(unitPricing.retailPrice)} />
          <DetailField label="Profit" value={formatCurrency(unitPricing.profit)} />
          <DetailField label="Margin" value={formatPercent(unitPricing.marginPercent)} />
          <DetailField label="Markup" value={formatPercent(unitPricing.markupPercent)} />
          <DetailField
            label="Inventory value"
            value={formatCurrency(detail.pricing.inventoryValue)}
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Inventory by Location">
        <DetailField label="Total stock" value={formatNumber(detail.totalQuantity)} />
        <View style={styles.list}>
          {detail.inventoryByLocation.map((row) => (
            <ListRow
              key={row.locationId}
              title={row.locationName}
              meta={`${row.quantity} units`}
              showChevron={false}
            />
          ))}
        </View>
      </DetailSection>

      <DetailSection title="Sales Summary">
        <Text variant="bodySmall" color={colors.textSecondary}>
          Last {detail.salesSummary.lookbackDays} days from simulated sales history
        </Text>
        <DetailFieldGrid>
          <DetailField label="Units sold" value={formatNumber(detail.salesSummary.unitsSold)} />
          <DetailField label="Revenue" value={formatCurrency(detail.salesSummary.revenue)} />
          <DetailField
            label="Estimated profit"
            value={formatCurrency(detail.salesSummary.estimatedProfit)}
          />
          <DetailField label="Orders" value={formatNumber(detail.salesSummary.orderCount)} />
          <DetailField
            label="Avg daily sales"
            value={detail.salesSummary.averageDailySales.toFixed(2)}
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Forecast / Reorder Insight">
        <DetailFieldGrid>
          <DetailField
            label="Days remaining"
            value={
              detail.forecast.daysRemaining !== null
                ? String(detail.forecast.daysRemaining)
                : detail.totalQuantity > 0
                  ? 'No recent sales'
                  : '0'
            }
          />
          <DetailField
            label="Recommended reorder"
            value={formatNumber(detail.forecast.recommendedReorder)}
          />
          <DetailField
            label="Average daily sales"
            value={detail.forecast.averageDailySales.toFixed(2)}
          />
        </DetailFieldGrid>
        <Badge
          label={detail.forecast.riskLevel.toUpperCase()}
          variant={riskLevelToBadgeVariant(detail.forecast.riskLevel)}
          icon="analytics-outline"
        />
      </DetailSection>

      <DetailSection title="Stock Movement History">
        {detail.recentMovements.length === 0 ? (
          <Text variant="body" color={colors.textSecondary}>
            No stock movements recorded for this variant.
          </Text>
        ) : (
          <View style={styles.list}>
            {detail.recentMovements.map((movement) => (
              <ListRow
                key={movement.id}
                title={movement.reason}
                subtitle={`${movement.locationName} · ${movement.movementType.replace(/_/g, ' ')}`}
                meta={formatRelativeTime(movement.createdAt)}
                showChevron={false}
                rightAccessory={
                  <Badge
                    label={movement.change > 0 ? `+${movement.change}` : String(movement.change)}
                    variant={movement.change < 0 ? 'warning' : 'success'}
                  />
                }
              />
            ))}
          </View>
        )}
      </DetailSection>

      <Button
        label="Edit Product"
        onPress={() => router.push(route(`/inventory/edit/${detail.variant.id}`))}
        fullWidth
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  siblings: {
    gap: spacing.sm,
  },
  siblingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  siblingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  list: {
    gap: spacing.sm,
  },
});
