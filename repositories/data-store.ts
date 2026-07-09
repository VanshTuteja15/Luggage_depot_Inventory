import { generateSeedData } from '@/data/seed';
import type { SeedDataSet } from '@/types/domain';

import type { RetailRepository } from './interfaces';
import { createInMemoryRetailRepository } from './in-memory-retail-repository';

let store: SeedDataSet | null = null;
let repository: RetailRepository | null = null;

export function getDataStore(): SeedDataSet {
  if (!store) {
    store = generateSeedData();
  }
  return store;
}

export function getRetailRepository(): RetailRepository {
  if (!repository) {
    repository = createInMemoryRetailRepository(getDataStore());
  }
  return repository;
}

/** For tests or future refresh — not used in production UI */
export function resetDataStore(): void {
  store = null;
  repository = null;
}
