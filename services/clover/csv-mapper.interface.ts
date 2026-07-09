import type { SalesHistoryRecord } from '@/types/domain';

/** CSV row shape for Clover sales export or manual upload */
export interface CloverCsvSalesRow {
  order_id: string;
  line_item_id: string;
  sku?: string;
  barcode?: string;
  quantity: string;
  unit_price: string;
  sold_at: string;
  location_id: string;
}

/**
 * Maps external CSV formats to domain sales records.
 * Keeps import logic isolated from screens and repositories.
 */
export interface SalesCsvMapper {
  parseRow(row: CloverCsvSalesRow): {
    externalOrderId: string;
    sku?: string;
    barcode?: string;
    quantity: number;
    unitRetailPrice: number;
    soldAt: string;
    locationExternalId: string;
  };
  toSalesHistoryRecord(
    parsed: ReturnType<SalesCsvMapper['parseRow']>,
    variantId: string,
    locationId: string,
    unitLandedCost: number
  ): SalesHistoryRecord;
}
