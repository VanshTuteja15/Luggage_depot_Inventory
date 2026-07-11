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

import type { RetailMutationRepository } from './mutation-interface';
import type { RetailRepository } from './interfaces';

export type MutableRetailRepository = RetailRepository & RetailMutationRepository;

export function createInMemoryRetailRepository(data: SeedDataSet): MutableRetailRepository {
  const locationById = new Map(data.locations.map((l) => [l.id, l]));
  const categoryById = new Map(data.categories.map((c) => [c.id, c]));
  const brandById = new Map(data.brands.map((b) => [b.id, b]));
  const productById = new Map(data.products.map((p) => [p.id, p]));
  const variantById = new Map(data.variants.map((v) => [v.id, v]));
  const skuIndex = new Map(data.variants.map((v) => [v.sku.toLowerCase(), v.id]));

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

  const movementsByVariant = new Map<string, StockMovement[]>();
  data.stockMovements.forEach((movement) => {
    const list = movementsByVariant.get(movement.variantId) ?? [];
    list.push(movement);
    movementsByVariant.set(movement.variantId, list);
  });

  let sortedMovements = [...data.stockMovements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function resortMovements() {
    sortedMovements = [...data.stockMovements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

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
    getMovementsByVariantId: (variantId: string, limit = 20): StockMovement[] => {
      const movements = movementsByVariant.get(variantId) ?? [];
      return [...movements]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },

    createProduct: (product: Product): Product => {
      data.products.push(product);
      productById.set(product.id, product);
      return product;
    },

    updateProduct: (product: Product): Product => {
      const index = data.products.findIndex((entry) => entry.id === product.id);
      if (index === -1) throw new Error(`Product ${product.id} not found`);
      data.products[index] = product;
      productById.set(product.id, product);
      return product;
    },

    createVariant: (variant: ProductVariant): ProductVariant => {
      if (skuIndex.has(variant.sku.toLowerCase())) {
        throw new Error(`SKU ${variant.sku} is already in use`);
      }
      data.variants.push(variant);
      variantById.set(variant.id, variant);
      skuIndex.set(variant.sku.toLowerCase(), variant.id);
      return variant;
    },

    updateVariant: (variant: ProductVariant): ProductVariant => {
      const existing = variantById.get(variant.id);
      if (!existing) throw new Error(`Variant ${variant.id} not found`);

      const normalizedSku = variant.sku.toLowerCase();
      const ownerId = skuIndex.get(normalizedSku);
      if (ownerId && ownerId !== variant.id) {
        throw new Error(`SKU ${variant.sku} is already in use`);
      }

      skuIndex.delete(existing.sku.toLowerCase());
      const index = data.variants.findIndex((entry) => entry.id === variant.id);
      data.variants[index] = variant;
      variantById.set(variant.id, variant);
      skuIndex.set(normalizedSku, variant.id);
      return variant;
    },

    isSkuTaken: (sku: string, excludeVariantId?: string): boolean => {
      const ownerId = skuIndex.get(sku.toLowerCase());
      if (!ownerId) return false;
      return excludeVariantId ? ownerId !== excludeVariantId : true;
    },

    createInventoryRecord: (record: InventoryRecord): InventoryRecord => {
      data.inventory.push(record);
      const list = inventoryByVariant.get(record.variantId) ?? [];
      list.push(record);
      inventoryByVariant.set(record.variantId, list);
      return record;
    },

    createStockMovement: (movement: StockMovement): StockMovement => {
      data.stockMovements.push(movement);
      const list = movementsByVariant.get(movement.variantId) ?? [];
      list.push(movement);
      movementsByVariant.set(movement.variantId, list);
      resortMovements();
      return movement;
    },
  };
}
