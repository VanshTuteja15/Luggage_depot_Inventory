import type { BadgeVariant } from '@/constants/theme';
import { getRetailRepository } from '@/repositories';
import {
  filterVariantViews,
  getDistinctFilterOptions,
  getVariantViews,
} from '@/services/filter';
import type { Location, VariantFilter, VariantStockStatus, VariantView } from '@/types/domain';

export type InventoryActiveFilter = 'all' | 'active' | 'inactive';

export interface InventoryFilterState {
  search: string;
  brandId: string;
  categoryId: string;
  color: string;
  size: string;
  locationId: string;
  retailPriceMin: string;
  retailPriceMax: string;
  landedCostMin: string;
  landedCostMax: string;
  lowStockOnly: boolean;
  outOfStockOnly: boolean;
  activeFilter: InventoryActiveFilter;
}

export const DEFAULT_INVENTORY_FILTER_STATE: InventoryFilterState = {
  search: '',
  brandId: '',
  categoryId: '',
  color: '',
  size: '',
  locationId: '',
  retailPriceMin: '',
  retailPriceMax: '',
  landedCostMin: '',
  landedCostMax: '',
  lowStockOnly: false,
  outOfStockOnly: false,
  activeFilter: 'all',
};

export interface InventoryFilterOptions {
  brands: ReturnType<typeof getDistinctFilterOptions>['brands'];
  categories: ReturnType<typeof getDistinctFilterOptions>['categories'];
  colors: string[];
  sizes: string[];
  locations: Location[];
}

export interface InventoryListData {
  allViews: VariantView[];
  filterOptions: InventoryFilterOptions;
}

function parseOptionalPrice(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function toVariantFilter(state: InventoryFilterState): VariantFilter {
  const filter: VariantFilter = {
    search: state.search.trim() || undefined,
    retailPriceMin: parseOptionalPrice(state.retailPriceMin),
    retailPriceMax: parseOptionalPrice(state.retailPriceMax),
    landedCostMin: parseOptionalPrice(state.landedCostMin),
    landedCostMax: parseOptionalPrice(state.landedCostMax),
    lowStock: state.lowStockOnly || undefined,
    outOfStock: state.outOfStockOnly || undefined,
  };

  if (state.brandId) filter.brandIds = [state.brandId];
  if (state.categoryId) filter.categoryIds = [state.categoryId];
  if (state.color) filter.colors = [state.color];
  if (state.size) filter.sizes = [state.size];
  if (state.locationId) filter.locationIds = [state.locationId];

  if (state.activeFilter === 'active') filter.active = true;
  if (state.activeFilter === 'inactive') filter.active = false;

  return filter;
}

export function hasActiveInventoryFilters(state: InventoryFilterState): boolean {
  return JSON.stringify(state) !== JSON.stringify(DEFAULT_INVENTORY_FILTER_STATE);
}

export function loadInventoryListData(): InventoryListData {
  const allViews = getVariantViews();
  const distinct = getDistinctFilterOptions(allViews);
  const locations = getRetailRepository().getLocations();

  return {
    allViews,
    filterOptions: {
      brands: distinct.brands,
      categories: distinct.categories,
      colors: distinct.colors,
      sizes: distinct.sizes,
      locations,
    },
  };
}

export function queryInventoryList(
  allViews: VariantView[],
  state: InventoryFilterState
): VariantView[] {
  return filterVariantViews(allViews, toVariantFilter(state));
}

export function stockStatusLabel(status: VariantStockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'needs_reorder':
      return 'Reorder';
    default:
      return status;
  }
}

export function stockStatusBadgeVariant(status: VariantStockStatus): BadgeVariant {
  switch (status) {
    case 'in_stock':
      return 'success';
    case 'low_stock':
      return 'warning';
    case 'out_of_stock':
      return 'error';
    case 'needs_reorder':
      return 'error';
    default:
      return 'neutral';
  }
}

export function stockStatusBadgeIcon(
  status: VariantStockStatus
): 'checkmark-circle' | 'alert-circle' | 'close-circle' | 'cart' {
  switch (status) {
    case 'in_stock':
      return 'checkmark-circle';
    case 'low_stock':
      return 'alert-circle';
    case 'out_of_stock':
      return 'close-circle';
    case 'needs_reorder':
      return 'cart';
    default:
      return 'alert-circle';
  }
}

export function getLocationStockSummary(
  view: VariantView,
  locations: Location[],
  maxShown = 2
): { short: string; full: string } {
  const stocked = locations
    .map((location) => ({
      name: location.name,
      quantity: view.quantityByLocation[location.id] ?? 0,
    }))
    .filter((entry) => entry.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);

  if (stocked.length === 0) {
    return { short: 'No stock', full: 'No stock at any location' };
  }

  const formatEntry = (name: string, quantity: number) => {
    const shortName = name
      .replace(' Centre', '')
      .replace(' Mall', '')
      .replace(' Calgary', '');
    return `${shortName}: ${quantity}`;
  };

  const full = stocked.map((entry) => formatEntry(entry.name, entry.quantity)).join(' · ');
  const visible = stocked
    .slice(0, maxShown)
    .map((entry) => formatEntry(entry.name, entry.quantity))
    .join(' · ');
  const hiddenCount = stocked.length - maxShown;

  return {
    short: hiddenCount > 0 ? `${visible} · +${hiddenCount} more` : visible,
    full,
  };
}

export function formatVariantLabel(color: string, size: string): string {
  return `${color} / ${size}`;
}
