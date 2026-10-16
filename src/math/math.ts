/**
 * Math - Calculation utilities, randomness, and noise generation.
 *
 * This module provides mathematical utilities for use in drawings.
 * Contains functions like constrain.
 */

export function constrain(x: number, min: number, max: number): number {
  if (x < min) {
    return min;
  } else if (x > max) {
    return max;
  }
  return x;
}

export function map(
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
