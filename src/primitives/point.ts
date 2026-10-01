/**
 * Vector - Geometric primitive for vector mathematics.
 *
 * Part of the Primitives module, this class represents a point in a 2D space.
 */
export class Point {
  private _x: number;
  private _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
}
