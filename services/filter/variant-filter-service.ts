import { getRetailRepository } from '@/repositories';
import { calculatePricingMetrics } from '@/services/pricing';
import { calculateVariantForecast, isReorderNeeded } from '@/services/forecast';
import type {
  Brand,
  Category,
  Product,
  ProductVariant,
  VariantFilter,
  VariantStockStatus,
  VariantView,
} from '@/types/domain';

function resolveStockStatus(
  variant: ProductVariant,
  totalQuantity: number,
  needsReorder: boolean
): VariantStockStatus {
  if (totalQuantity === 0) return 'out_of_stock';
  if (needsReorder) return 'needs_reorder';
  if (totalQuantity <= variant.threshold) return 'low_stock';
  return 'in_stock';
}

function matchesSearch(
  product: Product,
  brand: Brand,
  variant: ProductVariant,
  search: string
): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return (
    product.name.toLowerCase().includes(term) ||
    brand.name.toLowerCase().includes(term) ||
    variant.sku.toLowerCase().includes(term) ||
    variant.color.toLowerCase().includes(term) ||
    variant.size.toLowerCase().includes(term)
  );
}

export function buildVariantViews(): VariantView[] {
  const repo = getRetailRepository();

  return repo.getVariants().map((variant) => {
    const product = repo.getProductById(variant.productId);
    const brand = product ? repo.getBrandById(product.brandId) : undefined;
    const category = product ? repo.getCategoryById(product.categoryId) : undefined;

    if (!product || !brand || !category) {
      throw new Error(`Missing catalog data for variant ${variant.sku}`);
    }

    const inventoryRecords = repo.getInventoryByVariantId(variant.id);
    const quantityByLocation = inventoryRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.locationId] = record.quantity;
      return acc;
    }, {});
    const totalQuantity = inventoryRecords.reduce((sum, r) => sum + r.quantity, 0);
    const sales = repo.getSalesByVariantId(variant.id);
    const forecast = calculateVariantForecast({
      variant,
      productName: product.name,
      totalOnHand: totalQuantity,
      sales,
    });
    const needsReorder = isReorderNeeded(forecast, variant.reorderPoint);

    return {
      variant,
      product,
      brand,
      category,
      totalQuantity,
      quantityByLocation,
      pricing: calculatePricingMetrics(variant, totalQuantity),
      forecast,
      stockStatus: resolveStockStatus(variant, totalQuantity, needsReorder),
    };
  });
}

let cachedViews: VariantView[] | null = null;

export function getVariantViews(): VariantView[] {
  if (!cachedViews) {
    cachedViews = buildVariantViews();
  }
  return cachedViews;
}

export function filterVariantViews(views: VariantView[], filter: VariantFilter): VariantView[] {
  return views.filter((view) => {
    if (filter.active !== undefined && view.variant.active !== filter.active) return false;
    if (filter.brandIds?.length && !filter.brandIds.includes(view.brand.id)) return false;
    if (filter.categoryIds?.length && !filter.categoryIds.includes(view.category.id)) return false;
    if (filter.colors?.length && !filter.colors.includes(view.variant.color)) return false;
    if (filter.sizes?.length && !filter.sizes.includes(view.variant.size)) return false;

    if (filter.retailPriceMin !== undefined && view.variant.retailPrice < filter.retailPriceMin) {
      return false;
    }
    if (filter.retailPriceMax !== undefined && view.variant.retailPrice > filter.retailPriceMax) {
      return false;
    }
    if (filter.landedCostMin !== undefined && view.variant.landedCost < filter.landedCostMin) {
      return false;
    }
    if (filter.landedCostMax !== undefined && view.variant.landedCost > filter.landedCostMax) {
      return false;
    }

    if (filter.locationIds?.length) {
      const hasStock = filter.locationIds.some(
        (locationId) => (view.quantityByLocation[locationId] ?? 0) > 0
      );
      if (!hasStock) return false;
    }

    if (filter.lowStock && view.stockStatus !== 'low_stock') return false;
    if (filter.outOfStock && view.stockStatus !== 'out_of_stock') return false;
    if (filter.needsReorder && view.stockStatus !== 'needs_reorder') return false;
    if (filter.search && !matchesSearch(view.product, view.brand, view.variant, filter.search)) {
      return false;
    }

    return true;
  });
}

export function getDistinctFilterOptions(views: VariantView[]) {
  return {
    brands: [...new Map(views.map((v) => [v.brand.id, v.brand])).values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    categories: [...new Map(views.map((v) => [v.category.id, v.category])).values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    colors: [...new Set(views.map((v) => v.variant.color))].sort(),
    sizes: [...new Set(views.map((v) => v.variant.size))].sort(),
  };
}
