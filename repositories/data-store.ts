import { generateSeedData } from '@/data/seed';
import type { SeedDataSet } from '@/types/domain';

import type { MutableRetailRepository } from './in-memory-retail-repository';
import { createInMemoryRetailRepository } from './in-memory-retail-repository';

let store: SeedDataSet | null = null;
let repository: MutableRetailRepository | null = null;

export function getDataStore(): SeedDataSet {
  if (!store) {
    store = generateSeedData();
  }
  return store;
}

export function getRetailRepository(): MutableRetailRepository {
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
