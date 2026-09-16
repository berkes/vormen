export function randomBetween(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomBetweenFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomChance(chance: number): boolean {
  return Math.random() < chance;
}
