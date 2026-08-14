/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 * Provides deterministic random numbers for shareable visual scenes.
 */

export function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) || 123456789;
}

export function createSeed(input?: string | number): number {
  if (typeof input === 'number') {
    return Math.floor(Math.abs(input)) || 123456789;
  }
  if (typeof input === 'string' && input.trim().length > 0) {
    const parsed = parseInt(input, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
    return hashString(input);
  }
  return Math.floor(Math.random() * 89999999) + 10000000;
}

export class SeededRandom {
  private prng: () => number;
  public seed: number;

  constructor(seedInput?: string | number) {
    this.seed = createSeed(seedInput);
    this.prng = mulberry32(this.seed);
  }

  public next(): number {
    return this.prng();
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  public choice<T>(array: T[]): T {
    const index = this.int(0, array.length - 1);
    return array[index];
  }

  public boolean(trueProbability = 0.5): boolean {
    return this.next() < trueProbability;
  }
}
