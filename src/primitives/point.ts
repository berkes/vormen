/**
 * Point - Geometric primitive for a point in 2D space.
 *
 * Part of the Primitives module, this class represents a point in a 2D space.
 * Provides operations for vector calculations, point arithmetic, and distance-based
 * point positioning.
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

  /**
   * Creates a Point at the origin (0, 0).
   */
  static origin(): Point {
    return new Point(0, 0);
  }

  /**
   * Creates a vector from this point to another point.
   *
   * @example
   * const a = new Point(0, 0);
   * const b = new Point(3, 4);
   * const vector = a.to(b); // Vector(3, 4)
   */
  to(other: Point): Vector {
    return new Vector(other.x - this.x, other.y - this.y);
  }

  /**
   * Returns a new point offset by the given vector.
   * This is equivalent to: new Point(this.x + v.x, this.y + v.y)
   *
   * @example
   * const p = new Point(1, 2);
   * const v = new Vector(3, 4);
   * const result = p.add(v); // Point(4, 6)
   */
  add(v: Vector): Point {
    return new Point(this.x + v.x, this.y + v.y);
  }

  /**
   * Returns a new point at the specified distance from this point towards another point.
   *
   * This calculates the unit vector from this point to the other point, scales it by
   * the given distance, and adds it to this point. The result is a point on the line
   * between this point and the other point, at exactly `distance` units away from this point.
   *
   * @param other - The target point defining the direction
   * @param distance - The distance from this point towards the other point
   * @returns A new Point at the specified distance towards the other point
   * @throws Error if this point and the other point are the same (degenerate line)
   *
   * @example
   * // Point at distance 5 from (0,0) towards (0,10)
   * const start = new Point(0, 0);
   * const end = new Point(0, 10);
   * const pointAt5 = start.pointAtDistanceTowards(end, 5); // Point(0, 5)
   *
   * @example
   * // To find a point at distance L from end point b towards point a:
   * // b.pointAtDistanceTowards(a, L)
   * // This is equivalent to: b.add(b.to(a).normalized.scale(L))
   * const a = new Point(0, 0);
   * const b = new Point(10, 0);
   * const pointAt3FromB = b.pointAtDistanceTowards(a, 3); // Point(7, 0)
   */
  pointAtDistanceTowards(other: Point, distance: number): Point {
    if (this.equals(other)) {
      throw new Error(
        "Cannot calculate direction: start and end are the same point",
      );
    }
    return this.add(this.to(other).normalized.scale(distance));
  }

  /**
   * Calculates the Euclidean distance between this point and another point.
   */
  dist(other: Point): number {
    return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2);
  }

  /**
   * Checks if this point is equal to another point.
   * Uses strict equality (===) for both x and y coordinates.
   */
  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Returns a string representation of this point in the format "(x, y)".
   */
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

/**
 * Vector - Geometric primitive for vector mathematics.
 *
 * Part of the Primitives module, this class represents a 2D vector with x and y
 * components. Provides operations like distance calculation, scaling, normalization,
 * and lerping.
 */
export class Vector {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Euclidean length (magnitude) of this vector.
   * Calculated using Math.hypot which is numerically stable.
   *
   * @example
   * const v = new Vector(3, 4);
   * console.log(v.length); // 5
   */
  get length(): number {
    return Math.hypot(this.x, this.y);
  }

  /**
   * Returns a unit vector in the same direction as this vector.
   * A unit vector has a length of 1.
   *
   * @throws Error if this is the zero vector (0, 0)
   * @example
   * const v = new Vector(3, 4);
   * const unit = v.normalized; // Vector(0.6, 0.8)
   */
  get normalized(): Vector {
    const len = this.length;
    if (len === 0) {
      throw new Error("Cannot normalize the zero vector");
    }
    return new Vector(this.x / len, this.y / len);
  }

  /**
   * Returns a new vector scaled by the given factor.
   * Multiplies both x and y components by the scale factor.
   *
   * @param s - The scale factor
   * @example
   * const v = new Vector(1, 2);
   * const scaled = v.scale(3); // Vector(3, 6)
   */
  scale(s: number): Vector {
    return new Vector(this.x * s, this.y * s);
  }

  /**
   * Returns a new vector pointing in the opposite direction, with the same length.
   * Equivalent to scaling by -1.
   *
   * @example
   * const v = new Vector(3, 4);
   * const neg = v.negate(); // Vector(-3, -4)
   */
  negate(): Vector {
    return new Vector(-this.x, -this.y);
  }

  static lerp(a: Vector, b: Vector, t: number): Vector {
    return new Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  dist(otherVec: Vector): number {
    return Math.sqrt(
      Math.pow(this.x - otherVec.x, 2) + Math.pow(this.y - otherVec.y, 2),
    );
  }

  distX(otherVec: Vector): number {
    return Math.abs(this.x - otherVec.x);
  }

  distY(otherVec: Vector): number {
    return Math.abs(this.y - otherVec.y);
  }
}
