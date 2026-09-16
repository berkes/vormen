import type { Point } from "@svgdotjs/svg.js";

export class Vector {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromPoint(point: Point): Vector {
    return new Vector(point.x, point.y);
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
