import type {
  Brand,
  Category,
  InventoryRecord,
  Location,
  Product,
  ProductVariant,
  SalesHistoryRecord,
  StockMovement,
  Supplier,
} from '@/types/domain';

export interface CatalogRepository {
  getLocations(): Location[];
  getLocationById(id: string): Location | undefined;
  getCategories(): Category[];
  getCategoryById(id: string): Category | undefined;
  getBrands(): Brand[];
  getBrandById(id: string): Brand | undefined;
  getSuppliers(): Supplier[];
  getProducts(): Product[];
  getProductById(id: string): Product | undefined;
  getVariants(): ProductVariant[];
  getVariantById(id: string): ProductVariant | undefined;
  getVariantsByProductId(productId: string): ProductVariant[];
}

export interface InventoryRepository {
  getInventory(): InventoryRecord[];
  getInventoryByVariantId(variantId: string): InventoryRecord[];
  getQuantityByVariantId(variantId: string): number;
  getQuantityByVariantAndLocation(variantId: string, locationId: string): number;
}

export interface SalesRepository {
  getSalesHistory(): SalesHistoryRecord[];
  getSalesByVariantId(variantId: string): SalesHistoryRecord[];
  getSalesSince(since: Date): SalesHistoryRecord[];
}

export interface MovementRepository {
  getStockMovements(): StockMovement[];
  getRecentMovements(limit: number): StockMovement[];
}

export interface RetailRepository
  extends CatalogRepository,
    InventoryRepository,
    SalesRepository,
    MovementRepository {}
