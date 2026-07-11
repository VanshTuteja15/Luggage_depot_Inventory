import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { Location, VariantView } from '@/types/domain';
import {
  formatVariantLabel,
  getLocationStockSummary,
} from '@/services/inventory';
import { formatCurrency, formatPercent } from '@/utils/format';
import { calculateUnitPricing } from '@/services/pricing';

import { InventoryStockBadge } from './InventoryStockBadge';

type InventoryTableRowProps = {
  view: VariantView;
  locations: Location[];
  onPress: () => void;
};

export function InventoryTableRow({ view, locations, onPress }: InventoryTableRowProps) {
  const unitPricing = calculateUnitPricing(view.variant.landedCost, view.variant.retailPrice);
  const locationSummary = getLocationStockSummary(view, locations, 3);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${view.product.name}, ${view.variant.sku}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Cell flex={2.2}>
        <Text variant="label" numberOfLines={1}>
          {view.product.name}
        </Text>
        <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={1}>
          {formatVariantLabel(view.variant.color, view.variant.size)}
        </Text>
      </Cell>
      <Cell flex={1.4}>
        <Text variant="bodySmall" numberOfLines={1}>
          {view.variant.sku}
        </Text>
        <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
          {view.variant.barcode}
        </Text>
      </Cell>
      <Cell flex={1}>
        <Text variant="bodySmall" numberOfLines={1}>
          {view.brand.name}
        </Text>
      </Cell>
      <Cell flex={1}>
        <Text variant="bodySmall" numberOfLines={1}>
          {view.category.name}
        </Text>
      </Cell>
      <Cell flex={1.6}>
        <Text variant="bodySmall" numberOfLines={2}>
          {locationSummary.short}
        </Text>
      </Cell>
      <Cell flex={0.7} align="right">
        <Text variant="label">{view.totalQuantity}</Text>
      </Cell>
      <Cell flex={0.9} align="right">
        <Text variant="bodySmall">{formatCurrency(unitPricing.landedCost)}</Text>
      </Cell>
      <Cell flex={0.9} align="right">
        <Text variant="bodySmall">{formatCurrency(unitPricing.retailPrice)}</Text>
      </Cell>
      <Cell flex={0.8} align="right">
        <Text variant="bodySmall">{formatCurrency(unitPricing.profit)}</Text>
      </Cell>
      <Cell flex={0.7} align="right">
        <Text variant="bodySmall">{formatPercent(unitPricing.marginPercent)}</Text>
      </Cell>
      <Cell flex={1} align="right">
        <InventoryStockBadge status={view.stockStatus} />
      </Cell>
    </Pressable>
  );
}

function Cell({
  children,
  flex,
  align = 'left',
}: {
  children: React.ReactNode;
  flex: number;
  align?: 'left' | 'right';
}) {
  return (
    <View style={[styles.cell, { flex, alignItems: align === 'right' ? 'flex-end' : 'flex-start' }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.disabledSurface,
  },
  headerRow: {
    backgroundColor: colors.disabledSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cell: {
    gap: 2,
    minWidth: 0,
  },
});

export function InventoryTableHeader() {
  return (
    <View style={[styles.row, styles.headerRow]}>
      <HeaderCell flex={2.2} label="Product / Variant" />
      <HeaderCell flex={1.4} label="SKU / Barcode" />
      <HeaderCell flex={1} label="Brand" />
      <HeaderCell flex={1} label="Category" />
      <HeaderCell flex={1.6} label="Locations" />
      <HeaderCell flex={0.7} label="Stock" align="right" />
      <HeaderCell flex={0.9} label="Landed" align="right" />
      <HeaderCell flex={0.9} label="Retail" align="right" />
      <HeaderCell flex={0.8} label="Profit" align="right" />
      <HeaderCell flex={0.7} label="Margin" align="right" />
      <HeaderCell flex={1} label="Status" align="right" />
    </View>
  );
}

function HeaderCell({
  label,
  flex,
  align = 'left',
}: {
  label: string;
  flex: number;
  align?: 'left' | 'right';
}) {
  return (
    <View style={[styles.cell, { flex, alignItems: align === 'right' ? 'flex-end' : 'flex-start' }]}>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
    </View>
  );
}
