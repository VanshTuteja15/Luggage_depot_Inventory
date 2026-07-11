import { z } from 'zod';

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

export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brandId: z.string().min(1, 'Brand is required'),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  description: z.string(),
  notes: z.string(),
});

export const variantFormSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  size: z.string().min(1, 'Size is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().min(8, 'Barcode must be at least 8 characters'),
  landedCost: nonNegativeNumber('Landed cost'),
  retailPrice: nonNegativeNumber('Retail price'),
  reorderPoint: nonNegativeInteger('Reorder point'),
  threshold: nonNegativeInteger('Low-stock threshold'),
  active: z.boolean(),
});

export const addProductFormSchema = productFormSchema.merge(variantFormSchema);

export const editProductFormSchema = addProductFormSchema;

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type VariantFormValues = z.infer<typeof variantFormSchema>;
export type AddProductFormValues = z.infer<typeof addProductFormSchema>;
export type EditProductFormValues = z.infer<typeof editProductFormSchema>;

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

export function parseProductFormValues(values: AddProductFormValues): ParsedProductFormValues {
  return {
    ...values,
    landedCost: Number(values.landedCost),
    retailPrice: Number(values.retailPrice),
    reorderPoint: Number(values.reorderPoint),
    threshold: Number(values.threshold),
  };
}
