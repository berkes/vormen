import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';
import alea from 'alea';

interface Stringifiable {
  toString(): string;
}

class Noise {
  private _noise: NoiseFunction2D;

  constructor(seed: Stringifiable = "seed") {
    const prng = alea(seed);

    this._noise = createNoise2D(prng);
  }

  get(x: number, y: number) {
    return this._noise(x, y);
  }
}

export { Noise };
