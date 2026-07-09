import { z } from 'zod';

import { MOVEMENT_TYPES, SALES_SOURCES } from '@/types/domain';

export const locationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string(),
  city: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const brandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const supplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  contactEmail: z.string().email(),
  leadTimeDays: z.number().int().min(0),
  createdAt: z.string().datetime(),
});

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid(),
  description: z.string(),
  notes: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const productVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().min(1),
  barcode: z.string().min(8),
  color: z.string().min(1),
  size: z.string().min(1),
  landedCost: z.number().min(0),
  retailPrice: z.number().min(0),
  reorderPoint: z.number().int().min(0),
  threshold: z.number().int().min(0),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const inventoryRecordSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().int().min(0),
  updatedAt: z.string().datetime(),
});

export const stockMovementSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  locationId: z.string().uuid(),
  change: z.number().int(),
  reason: z.string().min(1),
  movementType: z.enum(MOVEMENT_TYPES),
  relatedLocationId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
});

export const salesHistoryRecordSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitRetailPrice: z.number().min(0),
  unitLandedCost: z.number().min(0),
  soldAt: z.string().datetime(),
  source: z.enum(SALES_SOURCES),
  externalOrderId: z.string().optional(),
});

export const seedDataSetSchema = z.object({
  locations: z.array(locationSchema),
  categories: z.array(categorySchema),
  brands: z.array(brandSchema),
  suppliers: z.array(supplierSchema),
  products: z.array(productSchema),
  variants: z.array(productVariantSchema),
  inventory: z.array(inventoryRecordSchema),
  stockMovements: z.array(stockMovementSchema),
  salesHistory: z.array(salesHistoryRecordSchema),
});

export type LocationInput = z.infer<typeof locationSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type InventoryRecordInput = z.infer<typeof inventoryRecordSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type SalesHistoryRecordInput = z.infer<typeof salesHistoryRecordSchema>;
