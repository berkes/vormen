import alea from "alea";
import type { Stringifiable } from "./types.ts";

/**
 * Random - Seeded pseudo-random number generator.
 *
 * Part of the Math module, this class provides reproducible randomness
 * with methods like between() and betweenFloat().
 */
export class Random {
  private _prng: () => number;
  private _seed: string;

  constructor(seed: Stringifiable | undefined = undefined) {
    if (!seed) {
      seed = Math.floor(Math.random() * 1_000_000_000).toString();
    }

    const prng = alea(seed.toString());

    this._prng = prng;
    this._seed = seed.toString();
  }

  private next(): number {
    return this._prng();
  }

  between(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  betweenFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  chance(chance: number): boolean {
    return this.next() < chance;
  }

  get seed(): string {
    return this._seed;
  }
}
