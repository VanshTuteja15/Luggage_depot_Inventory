/** Deterministic RFC-4122-shaped IDs for reproducible seed data */
let counter = 0;

export function createId(): string {
  counter += 1;
  const hex = counter.toString(16).padStart(12, '0');
  return `10000000-0000-4000-8000-${hex}`;
}

export function resetIdCounter(): void {
  counter = 0;
}

export function createBarcode(seed: number): string {
  return `077${seed.toString().padStart(10, '0')}`.slice(0, 13);
}
