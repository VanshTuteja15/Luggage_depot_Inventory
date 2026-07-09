/** Stock movement audit types — aligned with future Supabase enum */
export const MOVEMENT_TYPES = [
  'initial_stock',
  'manual_adjustment',
  'transfer_out',
  'transfer_in',
  'csv_import',
  'correction',
  'deletion_adjustment',
  'sale',
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

/** Sales record source — Clover adapter will use `clover` */
export const SALES_SOURCES = ['seed', 'clover', 'manual', 'csv_import'] as const;

export type SalesSource = (typeof SALES_SOURCES)[number];

export type ForecastRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type VariantStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'needs_reorder';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  leadTimeDays: number;
  createdAt: string;
}

/** Parent product — no stock or pricing at this level */
export interface Product {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  supplierId: string;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Sellable SKU — all inventory, pricing, and forecasting attach here */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string;
  color: string;
  size: string;
  landedCost: number;
  retailPrice: number;
  reorderPoint: number;
  threshold: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Per-location stock for a variant */
export interface InventoryRecord {
  id: string;
  variantId: string;
  locationId: string;
  quantity: number;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  variantId: string;
  locationId: string;
  change: number;
  reason: string;
  movementType: MovementType;
  relatedLocationId?: string;
  createdBy?: string;
  createdAt: string;
}

/** Clover-ready sales line item */
export interface SalesHistoryRecord {
  id: string;
  variantId: string;
  locationId: string;
  quantity: number;
  unitRetailPrice: number;
  unitLandedCost: number;
  soldAt: string;
  source: SalesSource;
  externalOrderId?: string;
}

export interface PricingMetrics {
  landedCost: number;
  retailPrice: number;
  profit: number;
  marginPercent: number;
  markupPercent: number;
  quantity: number;
  inventoryValue: number;
  potentialRevenue: number;
  potentialProfit: number;
}

export interface VariantForecast {
  variantId: string;
  sku: string;
  productName: string;
  averageDailySales: number;
  totalOnHand: number;
  daysRemaining: number | null;
  recommendedReorder: number;
  riskLevel: ForecastRiskLevel;
}

export interface RankedItem {
  id: string;
  name: string;
  value: number;
  label: string;
}

export interface StockMovementView {
  id: string;
  variantSku: string;
  productName: string;
  locationName: string;
  change: number;
  reason: string;
  movementType: MovementType;
  createdAt: string;
}

export interface ForecastAlert {
  variantId: string;
  sku: string;
  productName: string;
  riskLevel: ForecastRiskLevel;
  daysRemaining: number | null;
  recommendedReorder: number;
  message: string;
}

export interface DashboardMetrics {
  inventoryValue: number;
  potentialRevenue: number;
  potentialProfit: number;
  totalUnits: number;
  totalProducts: number;
  totalVariants: number;
  lowStockCount: number;
  outOfStockCount: number;
  needReorderingCount: number;
  topBrands: RankedItem[];
  topCategories: RankedItem[];
  recentMovements: StockMovementView[];
  forecastAlerts: ForecastAlert[];
}

export interface VariantFilter {
  brandIds?: string[];
  categoryIds?: string[];
  colors?: string[];
  sizes?: string[];
  retailPriceMin?: number;
  retailPriceMax?: number;
  landedCostMin?: number;
  landedCostMax?: number;
  locationIds?: string[];
  lowStock?: boolean;
  outOfStock?: boolean;
  needsReorder?: boolean;
  active?: boolean;
  search?: string;
}

export interface VariantView {
  variant: ProductVariant;
  product: Product;
  brand: Brand;
  category: Category;
  totalQuantity: number;
  quantityByLocation: Record<string, number>;
  pricing: PricingMetrics;
  forecast: VariantForecast;
  stockStatus: VariantStockStatus;
}

export interface SeedDataSet {
  locations: Location[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  products: Product[];
  variants: ProductVariant[];
  inventory: InventoryRecord[];
  stockMovements: StockMovement[];
  salesHistory: SalesHistoryRecord[];
}

export interface SeedDataStats {
  locations: number;
  categories: number;
  brands: number;
  suppliers: number;
  products: number;
  variants: number;
  inventoryRecords: number;
  stockMovements: number;
  salesHistoryRecords: number;
  salesHistoryDays: number;
}
