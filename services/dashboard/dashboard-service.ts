import { getRetailRepository } from '@/repositories';
import { isReorderNeeded } from '@/services/forecast';
import { getVariantViews } from '@/services/filter';
import { sumPricingMetrics } from '@/services/pricing';
import type {
  DashboardMetrics,
  ForecastAlert,
  ForecastRiskLevel,
  RankedItem,
  StockMovementView,
} from '@/types/domain';

let cachedMetrics: DashboardMetrics | null = null;

function riskMessage(risk: ForecastRiskLevel, daysRemaining: number | null, sku: string): string {
  switch (risk) {
    case 'critical':
      return daysRemaining !== null
        ? `${sku} may stock out in ${daysRemaining} days`
        : `${sku} is at critical stock levels`;
    case 'high':
      return `${sku} needs attention — ${daysRemaining ?? 'low'} days of cover remaining`;
    case 'medium':
      return `${sku} approaching reorder point`;
    default:
      return `${sku} stock levels are healthy`;
  }
}

function buildRankedBrands(): RankedItem[] {
  const views = getVariantViews();
  const totals = new Map<string, { name: string; revenue: number; units: number }>();

  views.forEach((view) => {
    const current = totals.get(view.brand.id) ?? { name: view.brand.name, revenue: 0, units: 0 };
    current.revenue += view.pricing.potentialRevenue;
    current.units += view.totalQuantity;
    totals.set(view.brand.id, current);
  });

  return [...totals.entries()]
    .map(([id, data]) => ({
      id,
      name: data.name,
      value: data.revenue,
      label: `${data.units} units on hand`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function buildRankedCategories(): RankedItem[] {
  const views = getVariantViews();
  const totals = new Map<string, { name: string; value: number; units: number }>();

  views.forEach((view) => {
    const current = totals.get(view.category.id) ?? {
      name: view.category.name,
      value: 0,
      units: 0,
    };
    current.value += view.pricing.inventoryValue;
    current.units += view.totalQuantity;
    totals.set(view.category.id, current);
  });

  return [...totals.entries()]
    .map(([id, data]) => ({
      id,
      name: data.name,
      value: data.value,
      label: `${data.units} units stocked`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function buildRecentMovements(): StockMovementView[] {
  const repo = getRetailRepository();
  return repo.getRecentMovements(8).map((movement) => {
    const variant = repo.getVariantById(movement.variantId);
    const product = variant ? repo.getProductById(variant.productId) : undefined;
    const location = repo.getLocationById(movement.locationId);

    return {
      id: movement.id,
      variantSku: variant?.sku ?? 'Unknown SKU',
      productName: product?.name ?? 'Unknown product',
      locationName: location?.name ?? 'Unknown location',
      change: movement.change,
      reason: movement.reason,
      movementType: movement.movementType,
      createdAt: movement.createdAt,
    };
  });
}

function buildForecastAlerts(): ForecastAlert[] {
  const views = getVariantViews();

  return views
    .filter(
      (view) =>
        view.forecast.riskLevel === 'high' ||
        view.forecast.riskLevel === 'critical' ||
        view.forecast.riskLevel === 'medium'
    )
    .sort((a, b) => {
      const riskOrder: Record<ForecastRiskLevel, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      return riskOrder[a.forecast.riskLevel] - riskOrder[b.forecast.riskLevel];
    })
    .slice(0, 6)
    .map((view) => ({
      variantId: view.variant.id,
      sku: view.variant.sku,
      productName: view.product.name,
      riskLevel: view.forecast.riskLevel,
      daysRemaining: view.forecast.daysRemaining,
      recommendedReorder: view.forecast.recommendedReorder,
      message: riskMessage(
        view.forecast.riskLevel,
        view.forecast.daysRemaining,
        view.variant.sku
      ),
    }));
}

export function computeDashboardMetrics(): DashboardMetrics {
  const repo = getRetailRepository();
  const views = getVariantViews();
  const activeViews = views.filter((v) => v.variant.active);
  const pricingTotals = sumPricingMetrics(activeViews.map((v) => v.pricing));

  const lowStockCount = activeViews.filter((v) => v.stockStatus === 'low_stock').length;
  const outOfStockCount = activeViews.filter((v) => v.stockStatus === 'out_of_stock').length;
  const needReorderingCount = activeViews.filter((v) =>
    isReorderNeeded(v.forecast, v.variant.reorderPoint)
  ).length;

  return {
    inventoryValue: pricingTotals.inventoryValue,
    potentialRevenue: pricingTotals.potentialRevenue,
    potentialProfit: pricingTotals.potentialProfit,
    totalUnits: pricingTotals.quantity,
    totalProducts: repo.getProducts().length,
    totalVariants: activeViews.length,
    lowStockCount,
    outOfStockCount,
    needReorderingCount,
    topBrands: buildRankedBrands(),
    topCategories: buildRankedCategories(),
    recentMovements: buildRecentMovements(),
    forecastAlerts: buildForecastAlerts(),
  };
}

export function getDashboardMetrics(): DashboardMetrics {
  if (!cachedMetrics) {
    cachedMetrics = computeDashboardMetrics();
  }
  return cachedMetrics;
}

export function clearDashboardCache(): void {
  cachedMetrics = null;
}
