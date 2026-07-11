import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getDataStore } from '@/repositories';
import {
  DEFAULT_INVENTORY_FILTER_STATE,
  loadInventoryListData,
  queryInventoryList,
  type InventoryFilterState,
  type InventoryListData,
} from '@/services/inventory';

export function useInventoryList() {
  const [filterState, setFilterState] = useState<InventoryFilterState>(
    DEFAULT_INVENTORY_FILTER_STATE
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [data, setData] = useState<InventoryListData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    try {
      getDataStore();
      setData(loadInventoryListData());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load inventory');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredViews = useMemo(() => {
    if (!data) return [];
    return queryInventoryList(data.allViews, filterState);
  }, [data, filterState]);

  const clearFilters = () => setFilterState(DEFAULT_INVENTORY_FILTER_STATE);

  const updateFilter = <K extends keyof InventoryFilterState>(
    key: K,
    value: InventoryFilterState[K]
  ) => {
    setFilterState((current) => ({ ...current, [key]: value }));
  };

  return {
    filterState,
    updateFilter,
    setFilterState,
    filtersExpanded,
    setFiltersExpanded,
    filteredViews,
    filterOptions: data?.filterOptions ?? null,
    totalVariantCount: data?.allViews.length ?? 0,
    resultCount: filteredViews.length,
    loading: data === null && error === null,
    error,
    clearFilters,
  };
}
