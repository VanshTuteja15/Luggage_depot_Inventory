import type { SalesHistoryRecord } from '@/types/domain';

/** Raw Clover order line — shape for future API mapping */
export interface CloverOrderLine {
  orderId: string;
  lineItemId: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  unitPriceCents: number;
  soldAt: string;
  locationExternalId: string;
}

/** Raw Clover order batch from API or export */
export interface CloverOrderExport {
  orders: CloverOrderLine[];
  exportedAt: string;
}

/**
 * Future Clover POS adapter.
 * Implement this interface when integrating with Clover API — never call Clover from UI code.
 */
export interface CloverSalesAdapter {
  readonly providerName: 'clover';
  fetchOrdersSince(since: Date): Promise<CloverOrderExport>;
  mapOrderLineToSalesRecord(
    line: CloverOrderLine,
    variantId: string,
    locationId: string,
    unitLandedCost: number
  ): SalesHistoryRecord;
}
