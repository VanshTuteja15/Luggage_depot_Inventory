export { getDataStore, getRetailRepository, resetDataStore } from './data-store';
export type { MutableRetailRepository } from './in-memory-retail-repository';
export type {
  CatalogRepository,
  InventoryRepository,
  MovementRepository,
  RetailRepository,
  SalesRepository,
} from './interfaces';
export type { RetailMutationRepository, VariantWithInitialStock } from './mutation-interface';
export { RepositoryError } from './mutation-interface';
