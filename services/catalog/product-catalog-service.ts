import { getRetailRepository } from '@/repositories';
import { RepositoryError } from '@/repositories/mutation-interface';
import { invalidateRetailCaches } from '@/services/cache/invalidate-retail-cache';
import type { ParsedVariantEntry, ProductFormValues } from '@/schemas/forms';
import type { Product, ProductVariant } from '@/types/domain';
import { createBarcode, createId } from '@/utils/id';

export class CatalogServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogServiceError';
  }
}

function wrapRepositoryError(error: unknown): never {
  if (error instanceof RepositoryError) {
    throw new CatalogServiceError(error.message);
  }
  throw error;
}

export function createProductWithVariants(
  productValues: ProductFormValues,
  variants: ParsedVariantEntry[]
): { productId: string; variantIds: string[]; firstVariantId: string } {
  const repo = getRetailRepository();
  const now = new Date().toISOString();
  const productId = createId();

  const product: Product = {
    id: productId,
    name: productValues.name.trim(),
    brandId: productValues.brandId,
    categoryId: productValues.categoryId,
    supplierId: productValues.supplierId,
    description: productValues.description.trim(),
    notes: productValues.notes.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const variantPayload = variants.map((entry) => {
    const variantId = createId();
    const variant: ProductVariant = {
      id: variantId,
      productId,
      sku: entry.sku,
      barcode: entry.barcode || createBarcode(variantId.length + Date.now()),
      color: entry.color,
      size: entry.size,
      landedCost: entry.landedCost,
      retailPrice: entry.retailPrice,
      reorderPoint: entry.reorderPoint,
      threshold: entry.threshold,
      active: entry.active,
      createdAt: now,
      updatedAt: now,
    };
    return { variant, initialStockByLocation: entry.initialStockByLocation };
  });

  try {
    const result = repo.createProductWithVariants(product, variantPayload);
    invalidateRetailCaches();
    return { ...result, firstVariantId: result.variantIds[0] };
  } catch (error) {
    wrapRepositoryError(error);
  }
}

export function addVariantsToProduct(
  productId: string,
  variants: ParsedVariantEntry[]
): string[] {
  const repo = getRetailRepository();
  const now = new Date().toISOString();

  const variantPayload = variants.map((entry) => {
    const variantId = createId();
    const variant: ProductVariant = {
      id: variantId,
      productId,
      sku: entry.sku,
      barcode: entry.barcode || createBarcode(variantId.length + Date.now()),
      color: entry.color,
      size: entry.size,
      landedCost: entry.landedCost,
      retailPrice: entry.retailPrice,
      reorderPoint: entry.reorderPoint,
      threshold: entry.threshold,
      active: entry.active,
      createdAt: now,
      updatedAt: now,
    };
    return { variant, initialStockByLocation: entry.initialStockByLocation };
  });

  try {
    const variantIds = repo.addVariantsToProduct(productId, variantPayload);
    invalidateRetailCaches();
    return variantIds;
  } catch (error) {
    wrapRepositoryError(error);
  }
}

export function updateProductWithVariant(
  productId: string,
  variantId: string,
  values: import('@/schemas/forms').ParsedProductFormValues
): void {
  const repo = getRetailRepository();
  const product = repo.getProductById(productId);
  const variant = repo.getVariantById(variantId);

  if (!product || !variant) {
    throw new CatalogServiceError('Product or variant not found');
  }

  const now = new Date().toISOString();

  try {
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
  } catch (error) {
    wrapRepositoryError(error);
  }
}

/** @deprecated Use createProductWithVariants — kept for compatibility */
export function createProductWithVariant(
  values: import('@/schemas/forms').ParsedProductFormValues,
  initialStockByLocation: Record<string, number> = {}
): { productId: string; variantId: string } {
  const result = createProductWithVariants(
    {
      name: values.name,
      brandId: values.brandId,
      categoryId: values.categoryId,
      supplierId: values.supplierId,
      description: values.description,
      notes: values.notes,
    },
    [
      {
        color: values.color,
        size: values.size,
        sku: values.sku,
        barcode: values.barcode,
        landedCost: values.landedCost,
        retailPrice: values.retailPrice,
        reorderPoint: values.reorderPoint,
        threshold: values.threshold,
        active: values.active,
        initialStockByLocation,
      },
    ]
  );
  return { productId: result.productId, variantId: result.firstVariantId };
}

export function generateSuggestedBarcode(): string {
  return createBarcode(Date.now() % 1_000_000_000);
}
