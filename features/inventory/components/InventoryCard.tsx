import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { Location, VariantView } from '@/types/domain';
import {
  formatVariantLabel,
  getLocationStockSummary,
} from '@/services/inventory';
import { formatCurrency, formatPercent } from '@/utils/format';
import { calculateUnitPricing } from '@/services/pricing';

import { InventoryStockBadge } from './InventoryStockBadge';

type InventoryCardProps = {
  view: VariantView;
  locations: Location[];
  onPress: () => void;
};

export function InventoryCard({ view, locations, onPress }: InventoryCardProps) {
  const unitPricing = calculateUnitPricing(view.variant.landedCost, view.variant.retailPrice);
  const locationSummary = getLocationStockSummary(view, locations);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${view.product.name}, ${view.variant.sku}`}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text variant="label">{view.product.name}</Text>
          <Text variant="bodySmall" color={colors.textSecondary}>
            {formatVariantLabel(view.variant.color, view.variant.size)}
          </Text>
        </View>
        <InventoryStockBadge status={view.stockStatus} />
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="SKU" value={view.variant.sku} />
        <MetaItem label="Barcode" value={view.variant.barcode} />
        <MetaItem label="Brand" value={view.brand.name} />
        <MetaItem label="Category" value={view.category.name} />
        <MetaItem label="Total Stock" value={String(view.totalQuantity)} />
        <MetaItem label="Landed" value={formatCurrency(unitPricing.landedCost)} />
        <MetaItem label="Retail" value={formatCurrency(unitPricing.retailPrice)} />
        <MetaItem label="Profit" value={formatCurrency(unitPricing.profit)} />
        <MetaItem label="Margin" value={formatPercent(unitPricing.marginPercent)} />
      </View>

      <View style={styles.locationBlock}>
        <Text variant="caption" color={colors.textSecondary}>
          Location stock
        </Text>
        <Text variant="bodySmall">{locationSummary.short}</Text>
        {!view.variant.active ? (
          <Text variant="caption" color={colors.warning}>
            Inactive variant
          </Text>
        ) : null}
      </View>
      </Card>
    </Pressable>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="bodySmall">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaItem: {
    width: '47%',
    gap: 2,
  },
  locationBlock: {
    gap: 4,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
