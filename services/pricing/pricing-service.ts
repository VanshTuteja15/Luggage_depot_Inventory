import type { PricingMetrics, ProductVariant } from '@/types/domain';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateUnitPricing(
  landedCost: number,
  retailPrice: number
): Pick<PricingMetrics, 'landedCost' | 'retailPrice' | 'profit' | 'marginPercent' | 'markupPercent'> {
  const profit = round(retailPrice - landedCost);
  const marginPercent = retailPrice > 0 ? round(profit / retailPrice) : 0;
  const markupPercent = landedCost > 0 ? round(profit / landedCost) : 0;

  return {
    landedCost,
    retailPrice,
    profit,
    marginPercent,
    markupPercent,
  };
}

export function calculatePricingMetrics(
  variant: Pick<ProductVariant, 'landedCost' | 'retailPrice'>,
  quantity: number
): PricingMetrics {
  const unit = calculateUnitPricing(variant.landedCost, variant.retailPrice);
  const safeQty = Math.max(0, quantity);

  return {
    ...unit,
    quantity: safeQty,
    inventoryValue: round(unit.landedCost * safeQty),
    potentialRevenue: round(unit.retailPrice * safeQty),
    potentialProfit: round(unit.profit * safeQty),
  };
}

export function sumPricingMetrics(items: PricingMetrics[]): Pick<
  PricingMetrics,
  'inventoryValue' | 'potentialRevenue' | 'potentialProfit' | 'quantity'
> {
  return items.reduce(
    (acc, item) => ({
      quantity: acc.quantity + item.quantity,
      inventoryValue: round(acc.inventoryValue + item.inventoryValue),
      potentialRevenue: round(acc.potentialRevenue + item.potentialRevenue),
      potentialProfit: round(acc.potentialProfit + item.potentialProfit),
    }),
    { quantity: 0, inventoryValue: 0, potentialRevenue: 0, potentialProfit: 0 }
  );
}
