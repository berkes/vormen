/**
 * Path utilities
 *
 * This module provides a class to build Path Data Strings as defined in
 * [https://www.w3.org/TR/SVG/paths.html#PathData](w3c SVG Spec on PathData)
 *
 * Features:
 * - Build a path from points
 * - Uitilites to get first, last, previous etc points
 * - Make corners in a path round with a radius
 */

import type { Point } from "@berkes/vormen";

export class PathBuilder {
  private _points: Point[];
  private _rounded_radius: number = 0;
  private _rounding_contstrained: boolean = false;
  private _closed: boolean = false;

  constructor(points: Point[]) {
    this._points = points;
  }

  withRounding(radius: number): PathBuilder {
    this._rounded_radius = radius;
    return this;
  }

  withRoundingConstrained(constrained: boolean): PathBuilder {
    this._rounding_contstrained = constrained;
    return this;
  }

  withClosed(closed: boolean): PathBuilder {
    this._closed = closed;
    return this;
  }

  push(point: Point): PathBuilder {
    this._points.push(point);
    return this;
  }

  get(idx: number): Point {
    if (idx < 0 || idx >= this._points.length) {
      throw new Error(
        `Index ${idx} out of bounds: 0..${this._points.length - 1}`,
      );
    }
    return this._points[idx];
  }

  tryGet(idx: number): Point | undefined {
    return this._points[idx];
  }

  getCyclic(idx: number): Point {
    if (this._points.length <= 0) {
      throw new Error("No points in path");
    }
    if (idx < 0) {
      return this.getCyclic(this._points.length + idx);
    } else if (idx >= this._points.length) {
      return this.getCyclic(idx - this._points.length);
    } else {
      return this.get(idx);
    }
  }

  indexOf(point: Point): number {
    return this._points.indexOf(point);
  }

  get points(): Point[] {
    return this._points;
  }

  get start(): Point {
    return this._points[0]!;
  }

  get end(): Point {
    return this._points[this._points.length - 1]!;
  }

  build(): string {
    let out = "";
    if (this._rounded_radius === 0) {
      out = `M${this.start.x} ${this.start.y}`;
      this._points.forEach((point) => {
        out += `L${point.x} ${point.y}`;
      });
    } else {
      this._points.forEach((point, idx) => {
        const prev = this.getCyclic(idx - 1);
        const next = this.getCyclic(idx + 1);

        let radius = this._rounded_radius;
        if (this._rounding_contstrained) {
          const dist1 = point.dist(prev);
          const dist2 = point.dist(next);
          radius = Math.min(radius, dist1 / 2, dist2 / 2);
        }

        const newPoint1 = point.pointAtDistanceTowards(prev, radius);
        const newPoint2 = point.pointAtDistanceTowards(next, radius);

        if (point == this.start) {
          out += `M${newPoint1.x} ${newPoint1.y}`;
        }

        out += `L${newPoint1.x} ${newPoint1.y}`;
        out += `Q${point.x} ${point.y},${newPoint2.x} ${newPoint2.y}`;
      });
    }

    if (this._closed) {
      out += "Z";
    }
    return out;
  }
}
