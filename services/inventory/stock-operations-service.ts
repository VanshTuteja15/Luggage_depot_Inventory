import { getRetailRepository } from '@/repositories';
import { RepositoryError } from '@/repositories/mutation-interface';
import { invalidateRetailCaches } from '@/services/cache/invalidate-retail-cache';
import { getVariantViews } from '@/services/filter';
import { formatVariantLabel } from '@/services/inventory/inventory-list-service';

export class StockOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockOperationError';
  }
}

function wrapError(error: unknown): never {
  if (error instanceof RepositoryError) {
    throw new StockOperationError(error.message);
  }
  throw error;
}

export function adjustInventoryQuantity(
  variantId: string,
  locationId: string,
  change: number,
  reason: string
): void {
  try {
    getRetailRepository().adjustInventoryQuantity(variantId, locationId, change, reason);
    invalidateRetailCaches();
  } catch (error) {
    wrapError(error);
  }
}

export function transferStock(
  variantId: string,
  fromLocationId: string,
  toLocationId: string,
  quantity: number,
  reason: string
): void {
  try {
    getRetailRepository().transferStock(
      variantId,
      fromLocationId,
      toLocationId,
      quantity,
      reason
    );
    invalidateRetailCaches();
  } catch (error) {
    wrapError(error);
  }
}

export function previewAdjustmentQuantity(currentQuantity: number, change: number): number {
  return currentQuantity + change;
}

export function getAvailableTransferQuantity(
  variantId: string,
  fromLocationId: string
): number {
  return getRetailRepository().getQuantityByVariantAndLocation(variantId, fromLocationId);
}

export function getStockOperationFormOptions() {
  const repo = getRetailRepository();
  const views = getVariantViews();

  return {
    variants: views.map((view) => ({
      label: `${view.product.name} · ${formatVariantLabel(view.variant.color, view.variant.size)} (${view.variant.sku})`,
      value: view.variant.id,
    })),
    locations: repo.getLocations(),
  };
}
