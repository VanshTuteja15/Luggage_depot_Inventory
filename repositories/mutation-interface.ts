import type {
  InventoryRecord,
  Product,
  ProductVariant,
  StockMovement,
} from '@/types/domain';

export interface RetailMutationRepository {
  createProduct(product: Product): Product;
  updateProduct(product: Product): Product;
  createVariant(variant: ProductVariant): ProductVariant;
  updateVariant(variant: ProductVariant): ProductVariant;
  isSkuTaken(sku: string, excludeVariantId?: string): boolean;
  createInventoryRecord(record: InventoryRecord): InventoryRecord;
  createStockMovement(movement: StockMovement): StockMovement;
  getMovementsByVariantId(variantId: string, limit?: number): StockMovement[];
}
