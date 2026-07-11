import { getRetailRepository } from '@/repositories';
import { calculateVariantForecast, isReorderNeeded } from '@/services/forecast';
import { calculatePricingMetrics, calculateUnitPricing } from '@/services/pricing';
import { calculateSalesSummary } from '@/services/sales';
import type { VariantDetail, VariantStockStatus } from '@/types/domain';

function resolveStockStatus(
  totalQuantity: number,
  threshold: number,
  needsReorder: boolean
): VariantStockStatus {
  if (totalQuantity === 0) return 'out_of_stock';
  if (needsReorder) return 'needs_reorder';
  if (totalQuantity <= threshold) return 'low_stock';
  return 'in_stock';
}

export function getVariantDetail(variantId: string): VariantDetail | null {
  const repo = getRetailRepository();
  const variant = repo.getVariantById(variantId);
  if (!variant) return null;

  const product = repo.getProductById(variant.productId);
  if (!product) return null;

  const brand = repo.getBrandById(product.brandId);
  const category = repo.getCategoryById(product.categoryId);
  const supplier = repo.getSuppliers().find((entry) => entry.id === product.supplierId);

  if (!brand || !category || !supplier) return null;

  const inventoryRecords = repo.getInventoryByVariantId(variant.id);
  const totalQuantity = inventoryRecords.reduce((sum, record) => sum + record.quantity, 0);
  const sales = repo.getSalesByVariantId(variant.id);

  const forecast = calculateVariantForecast({
    variant,
    productName: product.name,
    totalOnHand: totalQuantity,
    sales,
  });
  const needsReorder = isReorderNeeded(forecast, variant.reorderPoint);

  return {
    product,
    variant,
    brand,
    category,
    supplier,
    siblingVariants: repo.getVariantsByProductId(product.id).filter((entry) => entry.id !== variant.id),
    inventoryByLocation: repo.getLocations().map((location) => ({
      locationId: location.id,
      locationName: location.name,
      quantity: inventoryRecords.find((record) => record.locationId === location.id)?.quantity ?? 0,
    })),
    totalQuantity,
    unitPricing: calculateUnitPricing(variant.landedCost, variant.retailPrice),
    pricing: calculatePricingMetrics(variant, totalQuantity),
    salesSummary: calculateSalesSummary(sales),
    forecast,
    stockStatus: resolveStockStatus(totalQuantity, variant.threshold, needsReorder),
    recentMovements: repo.getMovementsByVariantId(variant.id, 12).map((movement) => {
      const location = repo.getLocationById(movement.locationId);
      return {
        id: movement.id,
        variantSku: variant.sku,
        productName: product.name,
        locationName: location?.name ?? 'Unknown location',
        change: movement.change,
        reason: movement.reason,
        movementType: movement.movementType,
        createdAt: movement.createdAt,
      };
    }),
  };
}

export function getCatalogFormOptions() {
  const repo = getRetailRepository();
  return {
    brands: repo.getBrands(),
    categories: repo.getCategories(),
    suppliers: repo.getSuppliers(),
    locations: repo.getLocations(),
  };
}
