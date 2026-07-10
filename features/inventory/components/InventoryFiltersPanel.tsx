import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input, Select, Text } from '@/components/ui';
import { colors, spacing, touchTarget } from '@/constants/theme';
import type { InventoryFilterState } from '@/services/inventory';
import { hasActiveInventoryFilters } from '@/services/inventory';
import type { InventoryFilterOptions } from '@/services/inventory';

type InventoryFiltersPanelProps = {
  expanded: boolean;
  onToggleExpanded: () => void;
  filterState: InventoryFilterState;
  onUpdateFilter: <K extends keyof InventoryFilterState>(
    key: K,
    value: InventoryFilterState[K]
  ) => void;
  onClearFilters: () => void;
  filterOptions: InventoryFilterOptions;
};

const ALL_OPTION = '';

export function InventoryFiltersPanel({
  expanded,
  onToggleExpanded,
  filterState,
  onUpdateFilter,
  onClearFilters,
  filterOptions,
}: InventoryFiltersPanelProps) {
  const filtersActive = hasActiveInventoryFilters(filterState);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse filters' : 'Expand filters'}
        accessibilityState={{ expanded }}
        onPress={onToggleExpanded}
        style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Ionicons name="options-outline" size={20} color={colors.primary} />
          <Text variant="label">Filters</Text>
          {filtersActive ? <View style={styles.activeDot} /> : null}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.panel}>
          <View style={styles.grid}>
            <Select
              label="Brand"
              placeholder="All brands"
              value={filterState.brandId || ALL_OPTION}
              options={[
                { label: 'All brands', value: ALL_OPTION },
                ...filterOptions.brands.map((brand) => ({ label: brand.name, value: brand.id })),
              ]}
              onChange={(value) => onUpdateFilter('brandId', value === ALL_OPTION ? '' : value)}
            />
            <Select
              label="Category"
              placeholder="All categories"
              value={filterState.categoryId || ALL_OPTION}
              options={[
                { label: 'All categories', value: ALL_OPTION },
                ...filterOptions.categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
              onChange={(value) =>
                onUpdateFilter('categoryId', value === ALL_OPTION ? '' : value)
              }
            />
            <Select
              label="Color"
              placeholder="All colors"
              value={filterState.color || ALL_OPTION}
              options={[
                { label: 'All colors', value: ALL_OPTION },
                ...filterOptions.colors.map((color) => ({ label: color, value: color })),
              ]}
              onChange={(value) => onUpdateFilter('color', value === ALL_OPTION ? '' : value)}
            />
            <Select
              label="Size"
              placeholder="All sizes"
              value={filterState.size || ALL_OPTION}
              options={[
                { label: 'All sizes', value: ALL_OPTION },
                ...filterOptions.sizes.map((size) => ({ label: size, value: size })),
              ]}
              onChange={(value) => onUpdateFilter('size', value === ALL_OPTION ? '' : value)}
            />
            <Select
              label="Location"
              placeholder="All locations"
              value={filterState.locationId || ALL_OPTION}
              options={[
                { label: 'All locations', value: ALL_OPTION },
                ...filterOptions.locations.map((location) => ({
                  label: location.name,
                  value: location.id,
                })),
              ]}
              onChange={(value) =>
                onUpdateFilter('locationId', value === ALL_OPTION ? '' : value)
              }
            />
            <Select
              label="Status"
              placeholder="All variants"
              value={filterState.activeFilter}
              options={[
                { label: 'All variants', value: 'all' },
                { label: 'Active only', value: 'active' },
                { label: 'Inactive only', value: 'inactive' },
              ]}
              onChange={(value) =>
                onUpdateFilter('activeFilter', value as InventoryFilterState['activeFilter'])
              }
            />
          </View>

          <View style={styles.priceRow}>
            <Input
              label="Retail min"
              placeholder="0"
              keyboardType="decimal-pad"
              value={filterState.retailPriceMin}
              onChangeText={(value) => onUpdateFilter('retailPriceMin', value)}
            />
            <Input
              label="Retail max"
              placeholder="999"
              keyboardType="decimal-pad"
              value={filterState.retailPriceMax}
              onChangeText={(value) => onUpdateFilter('retailPriceMax', value)}
            />
            <Input
              label="Landed min"
              placeholder="0"
              keyboardType="decimal-pad"
              value={filterState.landedCostMin}
              onChangeText={(value) => onUpdateFilter('landedCostMin', value)}
            />
            <Input
              label="Landed max"
              placeholder="999"
              keyboardType="decimal-pad"
              value={filterState.landedCostMax}
              onChangeText={(value) => onUpdateFilter('landedCostMax', value)}
            />
          </View>

          <View style={styles.toggleChips}>
            <FilterChip
              label="Low stock only"
              selected={filterState.lowStockOnly}
              onPress={() => onUpdateFilter('lowStockOnly', !filterState.lowStockOnly)}
            />
            <FilterChip
              label="Out of stock only"
              selected={filterState.outOfStockOnly}
              onPress={() => onUpdateFilter('outOfStockOnly', !filterState.outOfStockOnly)}
            />
          </View>

          {filtersActive ? (
            <Button label="Clear filters" variant="outline" onPress={onClearFilters} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text variant="bodySmall" color={selected ? colors.primary : colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleRow: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  panel: {
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  grid: {
    gap: spacing.md,
  },
  priceRow: {
    gap: spacing.md,
  },
  toggleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.disabledSurface,
  },
});
