/**
 * Path - Building SVG path data strings from points.
 *
 * This module provides the PathBuilder class to build Path Data Strings as
 * defined in
 * [https://www.w3.org/TR/SVG/paths.html#PathData](w3c SVG Spec on PathData)
 *
 * Features:
 * - Build a path from points
 * - Utilities to get first, last, previous etc points
 */

import type { Point } from "../primitives/point.ts";

export class PathBuilder {
  private _points: Point[];
  private _closed: boolean = false;

  constructor(points: Point[]) {
    this._points = points;
  }

  withClosed(closed: boolean): this {
    this._closed = closed;
    return this;
  }

  push(point: Point): this {
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
    let out = this.buildSegments();
    if (this._closed) {
      out += "Z";
    }
    return out;
  }

  protected buildSegments(): string {
    let out = `M${this.start.x} ${this.start.y}`;
    this._points.forEach((point) => {
      out += `L${point.x} ${point.y}`;
    });
    return out;
  }
}
