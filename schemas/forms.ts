import { z } from 'zod';

import { getRetailRepository } from '@/repositories';

const nonNegativeNumber = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((value) => !Number.isNaN(Number(value)), `${label} must be a number`)
    .refine((value) => Number(value) >= 0, `${label} cannot be negative`);

const nonNegativeInteger = (label: string) =>
  nonNegativeNumber(label).refine(
    (value) => Number.isInteger(Number(value)),
    `${label} must be a whole number`
  );

const optionalBarcode = z
  .string()
  .refine(
    (value) => value.trim() === '' || value.trim().length >= 8,
    'Barcode must be at least 8 characters when provided'
  );

export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brandId: z.string().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  description: z.string(),
  notes: z.string(),
});

export const variantEntryFormSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  size: z.string().min(1, 'Size is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: optionalBarcode,
  landedCost: nonNegativeNumber('Landed cost'),
  retailPrice: nonNegativeNumber('Retail price'),
  reorderPoint: nonNegativeInteger('Reorder point'),
  threshold: nonNegativeInteger('Low-stock threshold'),
  active: z.boolean(),
  initialStock: z.record(z.string(), z.string()).optional(),
});

export const multiVariantProductFormSchema = productFormSchema.extend({
  variants: z.array(variantEntryFormSchema).min(1, 'At least one variant is required'),
});

export const addVariantsFormSchema = z.object({
  variants: z.array(variantEntryFormSchema).min(1, 'At least one variant is required'),
});

export const variantFormSchema = variantEntryFormSchema.omit({ initialStock: true });

export const addProductFormSchema = productFormSchema.merge(variantFormSchema);
export const editProductFormSchema = addProductFormSchema;

export const stockAdjustFormSchema = z.object({
  change: z
    .string()
    .min(1, 'Quantity change is required')
    .refine((value) => !Number.isNaN(Number(value)), 'Must be a number')
    .refine((value) => Number(value) !== 0, 'Change cannot be zero'),
  reason: z.string().min(1, 'Reason is required'),
});

export const transferStockFormSchema = z.object({
  variantId: z.string().min(1, 'Product variant is required'),
  fromLocationId: z.string().min(1, 'From location is required'),
  toLocationId: z.string().min(1, 'To location is required'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((value) => !Number.isNaN(Number(value)), 'Must be a number')
    .refine((value) => Number(value) > 0, 'Quantity must be greater than zero'),
  reason: z.string().min(1, 'Reason is required'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type VariantEntryFormValues = z.infer<typeof variantEntryFormSchema>;
export type MultiVariantProductFormValues = z.infer<typeof multiVariantProductFormSchema>;
export type AddVariantsFormValues = z.infer<typeof addVariantsFormSchema>;
export type AddProductFormValues = z.infer<typeof addProductFormSchema>;
export type EditProductFormValues = z.infer<typeof editProductFormSchema>;
export type StockAdjustFormValues = z.infer<typeof stockAdjustFormSchema>;
export type TransferStockFormValues = z.infer<typeof transferStockFormSchema>;

export type ParsedVariantEntry = {
  color: string;
  size: string;
  sku: string;
  barcode: string;
  landedCost: number;
  retailPrice: number;
  reorderPoint: number;
  threshold: number;
  active: boolean;
  initialStockByLocation: Record<string, number>;
};

export type ParsedProductFormValues = {
  name: string;
  brandId: string;
  categoryId: string;
  supplierId: string;
  description: string;
  notes: string;
  color: string;
  size: string;
  sku: string;
  barcode: string;
  landedCost: number;
  retailPrice: number;
  reorderPoint: number;
  threshold: number;
  active: boolean;
};

function parseInitialStock(record?: Record<string, string>): Record<string, number> {
  if (!record) return {};
  return Object.fromEntries(
    Object.entries(record)
      .map(([locationId, qty]) => [locationId, Number(qty)] as const)
      .filter(([, qty]) => Number.isFinite(qty) && qty > 0)
  );
}

export function parseVariantEntry(values: VariantEntryFormValues): ParsedVariantEntry {
  return {
    color: values.color.trim(),
    size: values.size.trim(),
    sku: values.sku.trim(),
    barcode: values.barcode.trim(),
    landedCost: Number(values.landedCost),
    retailPrice: Number(values.retailPrice),
    reorderPoint: Number(values.reorderPoint),
    threshold: Number(values.threshold),
    active: values.active,
    initialStockByLocation: parseInitialStock(values.initialStock),
  };
}

export function parseProductFormValues(values: AddProductFormValues): ParsedProductFormValues {
  return {
    ...values,
    landedCost: Number(values.landedCost),
    retailPrice: Number(values.retailPrice),
    reorderPoint: Number(values.reorderPoint),
    threshold: Number(values.threshold),
  };
}

/** Client-side uniqueness checks for inline form errors (before repository) */
export function validateVariantEntriesForForm(
  variants: VariantEntryFormValues[],
  options: { productId?: string; excludeVariantId?: string } = {}
): Record<string, string> {
  const errors: Record<string, string> = {};
  const repo = getRetailRepository();
  const seenSku = new Map<string, number>();
  const seenBarcode = new Map<string, number>();
  const seenColorSize = new Map<string, number>();

  variants.forEach((variant, index) => {
    const skuKey = variant.sku.trim().toLowerCase();
    if (skuKey) {
      if (seenSku.has(skuKey)) {
        errors[`variants.${index}.sku`] = 'Duplicate SKU in this form';
      } else {
        seenSku.set(skuKey, index);
      }
      if (repo.isSkuTaken(variant.sku, options.excludeVariantId)) {
        errors[`variants.${index}.sku`] = `SKU "${variant.sku}" is already in use`;
      }
    }

    const barcode = variant.barcode.trim();
    if (barcode) {
      const barcodeKey = barcode.toLowerCase();
      if (seenBarcode.has(barcodeKey)) {
        errors[`variants.${index}.barcode`] = 'Duplicate barcode in this form';
      } else {
        seenBarcode.set(barcodeKey, index);
      }
      if (repo.isBarcodeTaken(barcode, options.excludeVariantId)) {
        errors[`variants.${index}.barcode`] = `Barcode "${barcode}" is already in use`;
      }
    }

    const csKey = `${variant.color.trim().toLowerCase()}::${variant.size.trim().toLowerCase()}`;
    if (variant.color.trim() && variant.size.trim()) {
      if (seenColorSize.has(csKey)) {
        errors[`variants.${index}.color`] = 'Duplicate color/size in this form';
        errors[`variants.${index}.size`] = 'Duplicate color/size in this form';
      } else {
        seenColorSize.set(csKey, index);
      }
      if (
        options.productId &&
        repo.hasColorSizeConflict(
          options.productId,
          variant.color,
          variant.size,
          options.excludeVariantId
        )
      ) {
        errors[`variants.${index}.color`] = 'This color/size already exists on the product';
        errors[`variants.${index}.size`] = 'This color/size already exists on the product';
      }
    }
  });

  return errors;
}

export function validateEditVariantUniqueness(
  values: EditProductFormValues,
  productId: string,
  variantId: string
): Partial<Record<keyof EditProductFormValues, string>> {
  const nested = validateVariantEntriesForForm(
    [{ ...values, initialStock: {} }],
    { productId, excludeVariantId: variantId }
  );

  const flat: Partial<Record<keyof EditProductFormValues, string>> = {};
  Object.entries(nested).forEach(([path, message]) => {
    const field = path.split('.').pop();
    if (field && field in values) {
      flat[field as keyof EditProductFormValues] = message;
    }
  });
  return flat;
}
