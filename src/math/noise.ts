import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import alea from "alea";
import type { Stringifiable } from "./types.ts";

/**
 * Noise - Seeded Simplex noise generator.
 *
 * Part of the Math module, this class provides reproducible noise generation
 * for use in generative art. Use the get(x, y) method to sample noise values.
 */
class Noise {
  private _noise: NoiseFunction2D;

  constructor(seed: Stringifiable = "seed") {
    const prng = alea(seed);

    this._noise = createNoise2D(prng);
  }

  get(x: number, y: number): number {
    return this._noise(x, y);
  }
}

export { Noise };
