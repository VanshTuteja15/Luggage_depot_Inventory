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
import { createId } from '@/utils/id';

import { RepositoryError, type RetailMutationRepository, type VariantWithInitialStock } from './mutation-interface';
import type { RetailRepository } from './interfaces';

export type MutableRetailRepository = RetailRepository & RetailMutationRepository;

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function colorSizeKey(color: string, size: string): string {
  return `${normalizeKey(color)}::${normalizeKey(size)}`;
}

export function createInMemoryRetailRepository(data: SeedDataSet): MutableRetailRepository {
  const locationById = new Map(data.locations.map((l) => [l.id, l]));
  const categoryById = new Map(data.categories.map((c) => [c.id, c]));
  const brandById = new Map(data.brands.map((b) => [b.id, b]));
  const productById = new Map(data.products.map((p) => [p.id, p]));
  const variantById = new Map(data.variants.map((v) => [v.id, v]));
  const skuIndex = new Map(data.variants.map((v) => [normalizeKey(v.sku), v.id]));
  const barcodeIndex = new Map(
    data.variants
      .filter((v) => v.barcode.trim())
      .map((v) => [normalizeKey(v.barcode), v.id])
  );

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

  function validateVariantBatch(
    productId: string | null,
    variants: VariantWithInitialStock[],
    excludeVariantIds: string[] = []
  ): void {
    if (variants.length === 0) {
      throw new RepositoryError('At least one variant is required');
    }

    const batchSkus = new Set<string>();
    const batchBarcodes = new Set<string>();
    const batchColorSize = new Set<string>();

    variants.forEach(({ variant }) => {
      const sku = normalizeKey(variant.sku);
      if (batchSkus.has(sku)) {
        throw new RepositoryError(`Duplicate SKU in form: ${variant.sku}`);
      }
      batchSkus.add(sku);

      const barcode = variant.barcode.trim();
      if (barcode) {
        const barcodeKey = normalizeKey(barcode);
        if (batchBarcodes.has(barcodeKey)) {
          throw new RepositoryError(`Duplicate barcode in form: ${barcode}`);
        }
        batchBarcodes.add(barcodeKey);
      }

      const csKey = colorSizeKey(variant.color, variant.size);
      if (batchColorSize.has(csKey)) {
        throw new RepositoryError(
          `Duplicate color/size in form: ${variant.color} / ${variant.size}`
        );
      }
      batchColorSize.add(csKey);
    });

    variants.forEach(({ variant }) => {
      if (skuIndex.has(normalizeKey(variant.sku)) && !excludeVariantIds.includes(variant.id)) {
        const owner = skuIndex.get(normalizeKey(variant.sku));
        if (owner && owner !== variant.id) {
          throw new RepositoryError(`SKU "${variant.sku}" is already in use`);
        }
      }

      const barcode = variant.barcode.trim();
      if (barcode) {
        const barcodeKey = normalizeKey(barcode);
        if (barcodeIndex.has(barcodeKey) && !excludeVariantIds.includes(variant.id)) {
          const owner = barcodeIndex.get(barcodeKey);
          if (owner && owner !== variant.id) {
            throw new RepositoryError(`Barcode "${barcode}" is already in use`);
          }
        }
      }

      if (productId) {
        const existing = data.variants.filter(
          (entry) =>
            entry.productId === productId &&
            !excludeVariantIds.includes(entry.id) &&
            entry.id !== variant.id
        );
        const conflict = existing.some(
          (entry) => colorSizeKey(entry.color, entry.size) === colorSizeKey(variant.color, variant.size)
        );
        if (conflict) {
          throw new RepositoryError(
            `Variant ${variant.color} / ${variant.size} already exists for this product`
          );
        }
      }
    });
  }

  function applyInitialStock(variantId: string, initialStockByLocation: Record<string, number>, now: string, reason: string) {
    Object.entries(initialStockByLocation).forEach(([locationId, quantity]) => {
      if (quantity <= 0) return;
      if (!locationById.has(locationId)) {
        throw new RepositoryError(`Unknown location: ${locationId}`);
      }

      const record: InventoryRecord = {
        id: createId(),
        variantId,
        locationId,
        quantity,
        updatedAt: now,
      };
      data.inventory.push(record);
      const list = inventoryByVariant.get(variantId) ?? [];
      list.push(record);
      inventoryByVariant.set(variantId, list);

      const movement: StockMovement = {
        id: createId(),
        variantId,
        locationId,
        change: quantity,
        reason,
        movementType: 'initial_stock',
        createdAt: now,
      };
      data.stockMovements.push(movement);
      const movements = movementsByVariant.get(variantId) ?? [];
      movements.push(movement);
      movementsByVariant.set(variantId, movements);
    });
    resortMovements();
  }

  function registerVariant(variant: ProductVariant) {
    data.variants.push(variant);
    variantById.set(variant.id, variant);
    skuIndex.set(normalizeKey(variant.sku), variant.id);
    if (variant.barcode.trim()) {
      barcodeIndex.set(normalizeKey(variant.barcode), variant.id);
    }
  }

  const repo: MutableRetailRepository = {
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
      if (index === -1) throw new RepositoryError(`Product ${product.id} not found`);
      data.products[index] = product;
      productById.set(product.id, product);
      return product;
    },

    createVariant: (variant: ProductVariant): ProductVariant => {
      if (skuIndex.has(normalizeKey(variant.sku))) {
        throw new RepositoryError(`SKU ${variant.sku} is already in use`);
      }
      registerVariant(variant);
      return variant;
    },

    updateVariant: (variant: ProductVariant): ProductVariant => {
      const existing = variantById.get(variant.id);
      if (!existing) throw new RepositoryError(`Variant ${variant.id} not found`);

      const normalizedSku = normalizeKey(variant.sku);
      const skuOwner = skuIndex.get(normalizedSku);
      if (skuOwner && skuOwner !== variant.id) {
        throw new RepositoryError(`SKU ${variant.sku} is already in use`);
      }

      const barcode = variant.barcode.trim();
      if (barcode) {
        const barcodeOwner = barcodeIndex.get(normalizeKey(barcode));
        if (barcodeOwner && barcodeOwner !== variant.id) {
          throw new RepositoryError(`Barcode ${barcode} is already in use`);
        }
      }

      if (
        repo.hasColorSizeConflict(variant.productId, variant.color, variant.size, variant.id)
      ) {
        throw new RepositoryError(
          `Variant ${variant.color} / ${variant.size} already exists for this product`
        );
      }

      skuIndex.delete(normalizeKey(existing.sku));
      if (existing.barcode.trim()) {
        barcodeIndex.delete(normalizeKey(existing.barcode));
      }

      const index = data.variants.findIndex((entry) => entry.id === variant.id);
      data.variants[index] = variant;
      variantById.set(variant.id, variant);
      skuIndex.set(normalizedSku, variant.id);
      if (barcode) {
        barcodeIndex.set(normalizeKey(barcode), variant.id);
      }
      return variant;
    },

    isSkuTaken: (sku: string, excludeVariantId?: string): boolean => {
      const ownerId = skuIndex.get(normalizeKey(sku));
      if (!ownerId) return false;
      return excludeVariantId ? ownerId !== excludeVariantId : true;
    },

    isBarcodeTaken: (barcode: string, excludeVariantId?: string): boolean => {
      const trimmed = barcode.trim();
      if (!trimmed) return false;
      const ownerId = barcodeIndex.get(normalizeKey(trimmed));
      if (!ownerId) return false;
      return excludeVariantId ? ownerId !== excludeVariantId : true;
    },

    hasColorSizeConflict: (
      productId: string,
      color: string,
      size: string,
      excludeVariantId?: string
    ): boolean => {
      const key = colorSizeKey(color, size);
      return data.variants.some(
        (entry) =>
          entry.productId === productId &&
          entry.id !== excludeVariantId &&
          colorSizeKey(entry.color, entry.size) === key
      );
    },

    createInventoryRecord: (record: InventoryRecord): InventoryRecord => {
      data.inventory.push(record);
      const list = inventoryByVariant.get(record.variantId) ?? [];
      list.push(record);
      inventoryByVariant.set(record.variantId, list);
      return record;
    },

    updateInventoryRecord: (record: InventoryRecord): InventoryRecord => {
      const list = inventoryByVariant.get(record.variantId) ?? [];
      const index = list.findIndex((entry) => entry.id === record.id);
      if (index === -1) throw new RepositoryError(`Inventory record ${record.id} not found`);
      list[index] = record;
      const dataIndex = data.inventory.findIndex((entry) => entry.id === record.id);
      if (dataIndex !== -1) data.inventory[dataIndex] = record;
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

    createProductWithVariants: (product, variants) => {
      validateVariantBatch(null, variants);

      data.products.push(product);
      productById.set(product.id, product);

      const variantIds: string[] = [];
      const now = new Date().toISOString();

      variants.forEach(({ variant, initialStockByLocation }) => {
        registerVariant({ ...variant, productId: product.id });
        variantIds.push(variant.id);
        applyInitialStock(
          variant.id,
          initialStockByLocation,
          now,
          'Initial stock on product creation'
        );
      });

      return { productId: product.id, variantIds };
    },

    addVariantsToProduct: (productId, variants) => {
      if (!productById.has(productId)) {
        throw new RepositoryError(`Product ${productId} not found`);
      }
      validateVariantBatch(productId, variants);

      const variantIds: string[] = [];
      const now = new Date().toISOString();

      variants.forEach(({ variant, initialStockByLocation }) => {
        registerVariant({ ...variant, productId });
        variantIds.push(variant.id);
        applyInitialStock(
          variant.id,
          initialStockByLocation,
          now,
          'Initial stock on new variant'
        );
      });

      return variantIds;
    },

    adjustInventoryQuantity: (variantId, locationId, change, reason) => {
      const trimmedReason = reason.trim();
      if (!trimmedReason) throw new RepositoryError('Reason is required');
      if (change === 0) throw new RepositoryError('Quantity change cannot be zero');
      if (!variantById.has(variantId)) throw new RepositoryError('Variant not found');
      if (!locationById.has(locationId)) throw new RepositoryError('Location not found');

      const records = inventoryByVariant.get(variantId) ?? [];
      let record = records.find((entry) => entry.locationId === locationId);
      const currentQty = record?.quantity ?? 0;
      const newQty = currentQty + change;

      if (newQty < 0) {
        throw new RepositoryError(
          `Cannot reduce below zero. Current: ${currentQty}, change: ${change}`
        );
      }

      const now = new Date().toISOString();

      if (record) {
        record = { ...record, quantity: newQty, updatedAt: now };
        const listIndex = records.findIndex((entry) => entry.id === record!.id);
        records[listIndex] = record;
        const dataIndex = data.inventory.findIndex((entry) => entry.id === record!.id);
        if (dataIndex !== -1) data.inventory[dataIndex] = record;
      } else if (change > 0) {
        record = {
          id: createId(),
          variantId,
          locationId,
          quantity: newQty,
          updatedAt: now,
        };
        data.inventory.push(record);
        records.push(record);
        inventoryByVariant.set(variantId, records);
      } else {
        throw new RepositoryError('Cannot reduce stock at a location with no inventory');
      }

      const movement: StockMovement = {
        id: createId(),
        variantId,
        locationId,
        change,
        reason: trimmedReason,
        movementType: 'manual_adjustment',
        createdAt: now,
      };
      data.stockMovements.push(movement);
      const movements = movementsByVariant.get(variantId) ?? [];
      movements.push(movement);
      movementsByVariant.set(variantId, movements);
      resortMovements();
    },

    transferStock: (variantId, fromLocationId, toLocationId, quantity, reason) => {
      const trimmedReason = reason.trim();
      if (quantity <= 0) throw new RepositoryError('Transfer quantity must be greater than zero');
      if (fromLocationId === toLocationId) {
        throw new RepositoryError('From and to locations must be different');
      }
      if (!trimmedReason) throw new RepositoryError('Reason is required');
      if (!variantById.has(variantId)) throw new RepositoryError('Variant not found');
      if (!locationById.has(fromLocationId) || !locationById.has(toLocationId)) {
        throw new RepositoryError('Invalid location selected');
      }

      const records = inventoryByVariant.get(variantId) ?? [];
      const fromRecord = records.find((entry) => entry.locationId === fromLocationId);
      const fromQty = fromRecord?.quantity ?? 0;

      if (fromQty < quantity) {
        throw new RepositoryError(
          `Insufficient stock at source. Available: ${fromQty}, requested: ${quantity}`
        );
      }

      const now = new Date().toISOString();
      const toRecord = records.find((entry) => entry.locationId === toLocationId);

      const updatedFrom: InventoryRecord = {
        ...fromRecord!,
        quantity: fromQty - quantity,
        updatedAt: now,
      };
      const fromListIndex = records.findIndex((entry) => entry.id === fromRecord!.id);
      records[fromListIndex] = updatedFrom;
      const fromDataIndex = data.inventory.findIndex((entry) => entry.id === fromRecord!.id);
      if (fromDataIndex !== -1) data.inventory[fromDataIndex] = updatedFrom;

      if (toRecord) {
        const updatedTo: InventoryRecord = {
          ...toRecord,
          quantity: toRecord.quantity + quantity,
          updatedAt: now,
        };
        const toListIndex = records.findIndex((entry) => entry.id === toRecord.id);
        records[toListIndex] = updatedTo;
        const toDataIndex = data.inventory.findIndex((entry) => entry.id === toRecord.id);
        if (toDataIndex !== -1) data.inventory[toDataIndex] = updatedTo;
      } else {
        const newTo: InventoryRecord = {
          id: createId(),
          variantId,
          locationId: toLocationId,
          quantity,
          updatedAt: now,
        };
        data.inventory.push(newTo);
        records.push(newTo);
      }
      inventoryByVariant.set(variantId, records);

      const outMovement: StockMovement = {
        id: createId(),
        variantId,
        locationId: fromLocationId,
        change: -quantity,
        reason: trimmedReason,
        movementType: 'transfer_out',
        relatedLocationId: toLocationId,
        createdAt: now,
      };
      const inMovement: StockMovement = {
        id: createId(),
        variantId,
        locationId: toLocationId,
        change: quantity,
        reason: trimmedReason,
        movementType: 'transfer_in',
        relatedLocationId: fromLocationId,
        createdAt: now,
      };

      data.stockMovements.push(outMovement, inMovement);
      const movements = movementsByVariant.get(variantId) ?? [];
      movements.push(outMovement, inMovement);
      movementsByVariant.set(variantId, movements);
      resortMovements();
    },
  };

  return repo;
}
