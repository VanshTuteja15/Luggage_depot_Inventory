import { FlatList, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import {
  EmptyState,
  ErrorState,
  Header,
  LoadingState,
  ScreenContainer,
  SearchBar,
  Text,
} from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

import { InventoryCard } from './InventoryCard';
import { InventoryFiltersPanel } from './InventoryFiltersPanel';
import { InventoryTableHeader, InventoryTableRow } from './InventoryTableRow';
import { useInventoryList } from '../hooks/useInventoryList';

const DESKTOP_BREAKPOINT = 1024;

export function InventoryView() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const {
    filterState,
    updateFilter,
    filtersExpanded,
    setFiltersExpanded,
    filteredViews,
    filterOptions,
    totalVariantCount,
    resultCount,
    loading,
    error,
    clearFilters,
  } = useInventoryList();

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState message="Loading inventory..." />
      </ScreenContainer>
    );
  }

  if (error || !filterOptions) {
    return (
      <ScreenContainer scroll={false}>
        <ErrorState message={error ?? 'Inventory data is unavailable.'} />
      </ScreenContainer>
    );
  }

  const listHeader = (
    <View style={styles.headerSection}>
      <Header
        title="Inventory"
        subtitle="Search and filter variants across all Calgary locations"
      />
      <SearchBar
        value={filterState.search}
        onChangeText={(value) => updateFilter('search', value)}
        placeholder="Search name, SKU, barcode, brand..."
        accessibilityLabel="Search inventory"
      />
      <InventoryFiltersPanel
        expanded={filtersExpanded}
        onToggleExpanded={() => setFiltersExpanded((current) => !current)}
        filterState={filterState}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
        filterOptions={filterOptions}
      />
      <Text variant="bodySmall" color={colors.textSecondary} style={styles.resultCount}>
        Showing {resultCount} of {totalVariantCount} variants
      </Text>
    </View>
  );

  if (filteredViews.length === 0) {
    return (
      <ScreenContainer>
        {listHeader}
        <EmptyState
          title="No variants match your filters"
          description="Try clearing filters or broadening your search to find products faster."
          icon="search-outline"
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      </ScreenContainer>
    );
  }

  if (isDesktop) {
    return (
      <ScreenContainer padded={false}>
        <View style={styles.desktopHeader}>{listHeader}</View>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={styles.tableContainer}>
            <InventoryTableHeader />
            {filteredViews.map((view) => (
              <InventoryTableRow
                key={view.variant.id}
                view={view}
                locations={filterOptions.locations}
              />
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      <FlatList
        data={filteredViews}
        keyExtractor={(item) => item.variant.id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <InventoryCard view={item} locations={filterOptions.locations} />
        )}
        ItemSeparatorComponent={ListSeparator}
      />
    </ScreenContainer>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  resultCount: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  desktopHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  tableContainer: {
    minWidth: 1180,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
});
