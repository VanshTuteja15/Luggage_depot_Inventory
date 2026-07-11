import type { ParsedProductFormValues } from '@/schemas/forms';
import { getRetailRepository } from '@/repositories';
import { invalidateRetailCaches } from '@/services/cache/invalidate-retail-cache';
import type { Product, ProductVariant } from '@/types/domain';
import { createBarcode, createId } from '@/utils/id';

export class CatalogServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogServiceError';
  }
}

export function createProductWithVariant(
  values: ParsedProductFormValues,
  initialStockByLocation: Record<string, number> = {}
): { productId: string; variantId: string } {
  const repo = getRetailRepository();

  if (repo.isSkuTaken(values.sku)) {
    throw new CatalogServiceError(`SKU "${values.sku}" is already in use`);
  }

  const now = new Date().toISOString();
  const productId = createId();
  const variantId = createId();

  const product: Product = {
    id: productId,
    name: values.name.trim(),
    brandId: values.brandId,
    categoryId: values.categoryId,
    supplierId: values.supplierId,
    description: values.description.trim(),
    notes: values.notes.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const variant: ProductVariant = {
    id: variantId,
    productId,
    sku: values.sku.trim(),
    barcode: values.barcode.trim(),
    color: values.color.trim(),
    size: values.size.trim(),
    landedCost: values.landedCost,
    retailPrice: values.retailPrice,
    reorderPoint: values.reorderPoint,
    threshold: values.threshold,
    active: values.active,
    createdAt: now,
    updatedAt: now,
  };

  repo.createProduct(product);
  repo.createVariant(variant);

  Object.entries(initialStockByLocation).forEach(([locationId, quantity]) => {
    if (quantity <= 0) return;

    repo.createInventoryRecord({
      id: createId(),
      variantId,
      locationId,
      quantity,
      updatedAt: now,
    });

    repo.createStockMovement({
      id: createId(),
      variantId,
      locationId,
      change: quantity,
      reason: 'Initial stock on product creation',
      movementType: 'initial_stock',
      createdAt: now,
    });
  });

  invalidateRetailCaches();
  return { productId, variantId };
}

export function updateProductWithVariant(
  productId: string,
  variantId: string,
  values: ParsedProductFormValues
): void {
  const repo = getRetailRepository();
  const product = repo.getProductById(productId);
  const variant = repo.getVariantById(variantId);

  if (!product || !variant) {
    throw new CatalogServiceError('Product or variant not found');
  }

  if (repo.isSkuTaken(values.sku, variantId)) {
    throw new CatalogServiceError(`SKU "${values.sku}" is already in use`);
  }

  const now = new Date().toISOString();

  repo.updateProduct({
    ...product,
    name: values.name.trim(),
    brandId: values.brandId,
    categoryId: values.categoryId,
    supplierId: values.supplierId,
    description: values.description.trim(),
    notes: values.notes.trim(),
    updatedAt: now,
  });

  repo.updateVariant({
    ...variant,
    sku: values.sku.trim(),
    barcode: values.barcode.trim(),
    color: values.color.trim(),
    size: values.size.trim(),
    landedCost: values.landedCost,
    retailPrice: values.retailPrice,
    reorderPoint: values.reorderPoint,
    threshold: values.threshold,
    active: values.active,
    updatedAt: now,
  });

  invalidateRetailCaches();
}

export function generateSuggestedBarcode(): string {
  return createBarcode(Date.now() % 1_000_000_000);
}
