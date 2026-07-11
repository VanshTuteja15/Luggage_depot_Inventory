import type {
  InventoryRecord,
  Product,
  ProductVariant,
  StockMovement,
} from '@/types/domain';

export type VariantWithInitialStock = {
  variant: ProductVariant;
  initialStockByLocation: Record<string, number>;
};

export interface RetailMutationRepository {
  createProduct(product: Product): Product;
  updateProduct(product: Product): Product;
  createVariant(variant: ProductVariant): ProductVariant;
  updateVariant(variant: ProductVariant): ProductVariant;
  isSkuTaken(sku: string, excludeVariantId?: string): boolean;
  isBarcodeTaken(barcode: string, excludeVariantId?: string): boolean;
  hasColorSizeConflict(
    productId: string,
    color: string,
    size: string,
    excludeVariantId?: string
  ): boolean;
  createInventoryRecord(record: InventoryRecord): InventoryRecord;
  updateInventoryRecord(record: InventoryRecord): InventoryRecord;
  createStockMovement(movement: StockMovement): StockMovement;
  getMovementsByVariantId(variantId: string, limit?: number): StockMovement[];

  /** Validates all variants upfront, then creates product + variants + stock atomically */
  createProductWithVariants(
    product: Product,
    variants: VariantWithInitialStock[]
  ): { productId: string; variantIds: string[] };

  /** Validates upfront, then adds variants to an existing product atomically */
  addVariantsToProduct(productId: string, variants: VariantWithInitialStock[]): string[];

  /** Single call: validate, update inventory, insert manual_adjustment movement */
  adjustInventoryQuantity(
    variantId: string,
    locationId: string,
    change: number,
    reason: string
  ): void;

  /** Single call: validate, update both locations, insert transfer pair */
  transferStock(
    variantId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    reason: string
  ): void;
}

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}
