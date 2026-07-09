import type {
  Brand,
  Category,
  InventoryRecord,
  Location,
  Product,
  ProductVariant,
  SalesHistoryRecord,
  SeedDataSet,
  StockMovement,
  Supplier,
} from '@/types/domain';

import type { RetailRepository } from './interfaces';

export function createInMemoryRetailRepository(data: SeedDataSet): RetailRepository {
  const locationById = new Map(data.locations.map((l) => [l.id, l]));
  const categoryById = new Map(data.categories.map((c) => [c.id, c]));
  const brandById = new Map(data.brands.map((b) => [b.id, b]));
  const productById = new Map(data.products.map((p) => [p.id, p]));
  const variantById = new Map(data.variants.map((v) => [v.id, v]));

  const inventoryByVariant = new Map<string, InventoryRecord[]>();
  data.inventory.forEach((record) => {
    const list = inventoryByVariant.get(record.variantId) ?? [];
    list.push(record);
    inventoryByVariant.set(record.variantId, list);
  });

  const salesByVariant = new Map<string, SalesHistoryRecord[]>();
  data.salesHistory.forEach((sale) => {
    const list = salesByVariant.get(sale.variantId) ?? [];
    list.push(sale);
    salesByVariant.set(sale.variantId, list);
  });

  const sortedMovements = [...data.stockMovements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    getLocations: (): Location[] => data.locations,
    getLocationById: (id: string): Location | undefined => locationById.get(id),
    getCategories: (): Category[] => data.categories,
    getCategoryById: (id: string): Category | undefined => categoryById.get(id),
    getBrands: (): Brand[] => data.brands,
    getBrandById: (id: string): Brand | undefined => brandById.get(id),
    getSuppliers: (): Supplier[] => data.suppliers,
    getProducts: (): Product[] => data.products,
    getProductById: (id: string): Product | undefined => productById.get(id),
    getVariants: (): ProductVariant[] => data.variants,
    getVariantById: (id: string): ProductVariant | undefined => variantById.get(id),
    getVariantsByProductId: (productId: string): ProductVariant[] =>
      data.variants.filter((v) => v.productId === productId),

    getInventory: (): InventoryRecord[] => data.inventory,
    getInventoryByVariantId: (variantId: string): InventoryRecord[] =>
      inventoryByVariant.get(variantId) ?? [],
    getQuantityByVariantId: (variantId: string): number =>
      (inventoryByVariant.get(variantId) ?? []).reduce((sum, r) => sum + r.quantity, 0),
    getQuantityByVariantAndLocation: (variantId: string, locationId: string): number =>
      (inventoryByVariant.get(variantId) ?? []).find((r) => r.locationId === locationId)?.quantity ?? 0,

    getSalesHistory: (): SalesHistoryRecord[] => data.salesHistory,
    getSalesByVariantId: (variantId: string): SalesHistoryRecord[] =>
      salesByVariant.get(variantId) ?? [],
    getSalesSince: (since: Date): SalesHistoryRecord[] =>
      data.salesHistory.filter((s) => new Date(s.soldAt) >= since),

    getStockMovements: (): StockMovement[] => data.stockMovements,
    getRecentMovements: (limit: number): StockMovement[] => sortedMovements.slice(0, limit),
  };
}
