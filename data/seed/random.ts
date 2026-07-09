/** Seeded pseudo-random for reproducible dummy data */
export function createSeededRandom(seed: number) {
  let state = seed;

  return {
    next(): number {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    pick<T>(items: T[]): T {
      return items[this.int(0, items.length - 1)];
    },
    chance(probability: number): boolean {
      return this.next() < probability;
    },
  };
}
