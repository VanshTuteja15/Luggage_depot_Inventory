import { FORECAST_LOOKBACK_DAYS } from '@/data/seed/constants';
import type { SalesHistoryRecord, SalesSummary } from '@/types/domain';
import { calculateAverageDailySales } from '@/services/forecast';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateSalesSummary(
  sales: SalesHistoryRecord[],
  lookbackDays: number = FORECAST_LOOKBACK_DAYS
): SalesSummary {
  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const recent = sales.filter((sale) => new Date(sale.soldAt).getTime() >= cutoff);

  const unitsSold = recent.reduce((sum, sale) => sum + sale.quantity, 0);
  const revenue = round(
    recent.reduce((sum, sale) => sum + sale.quantity * sale.unitRetailPrice, 0)
  );
  const estimatedProfit = round(
    recent.reduce(
      (sum, sale) => sum + sale.quantity * (sale.unitRetailPrice - sale.unitLandedCost),
      0
    )
  );

  return {
    lookbackDays,
    unitsSold,
    revenue,
    estimatedProfit,
    orderCount: recent.length,
    averageDailySales: calculateAverageDailySales(sales, lookbackDays),
  };
}
