import { FORECAST_LOOKBACK_DAYS } from '@/data/seed/constants';
import type { ForecastRiskLevel, ProductVariant, SalesHistoryRecord, VariantForecast } from '@/types/domain';

const TARGET_COVER_DAYS = 21;

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function resolveRiskLevel(
  daysRemaining: number | null,
  totalOnHand: number,
  reorderPoint: number
): ForecastRiskLevel {
  if (totalOnHand === 0) return 'critical';
  if (daysRemaining === null) return totalOnHand <= reorderPoint ? 'medium' : 'low';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 14) return 'high';
  if (daysRemaining <= 21 || totalOnHand <= reorderPoint) return 'medium';
  return 'low';
}

export function calculateAverageDailySales(
  sales: SalesHistoryRecord[],
  lookbackDays: number = FORECAST_LOOKBACK_DAYS
): number {
  if (sales.length === 0) return 0;

  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const recent = sales.filter((s) => new Date(s.soldAt).getTime() >= cutoff);
  if (recent.length === 0) return 0;

  const totalUnits = recent.reduce((sum, s) => sum + s.quantity, 0);
  return round(totalUnits / lookbackDays, 3);
}

export function calculateVariantForecast(params: {
  variant: ProductVariant;
  productName: string;
  totalOnHand: number;
  sales: SalesHistoryRecord[];
}): VariantForecast {
  const { variant, productName, totalOnHand, sales } = params;
  const averageDailySales = calculateAverageDailySales(sales);

  const daysRemaining =
    averageDailySales > 0 ? round(totalOnHand / averageDailySales, 1) : totalOnHand > 0 ? null : 0;

  const targetStock = Math.ceil(averageDailySales * TARGET_COVER_DAYS);
  const recommendedReorder = Math.max(0, targetStock - totalOnHand);

  const riskLevel = resolveRiskLevel(daysRemaining, totalOnHand, variant.reorderPoint);

  return {
    variantId: variant.id,
    sku: variant.sku,
    productName,
    averageDailySales,
    totalOnHand,
    daysRemaining,
    recommendedReorder,
    riskLevel,
  };
}

export function isReorderNeeded(forecast: VariantForecast, reorderPoint: number): boolean {
  return (
    forecast.totalOnHand <= reorderPoint ||
    forecast.riskLevel === 'high' ||
    forecast.riskLevel === 'critical'
  );
}

export function riskLevelToBadgeVariant(
  risk: ForecastRiskLevel
): 'success' | 'warning' | 'error' | 'neutral' {
  switch (risk) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
    case 'critical':
      return 'error';
    default:
      return 'neutral';
  }
}
