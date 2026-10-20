import type { Point } from "./point.ts";

/**
 * Line
 *
 * Part of the Primitives module, this class represents a line in a 2D space.
 * Provides operations for vector calculations, point arithmetic, distance calculations
 * and intersection detection.
 */
export class Line {
  private _start: Point;
  private _end: Point;

  constructor(start: Point, end: Point) {
    this._start = start;
    this._end = end;
  }

  /**
   * Get the start point of the line.
   * @returns The start point of the line.
   */
  get start(): Point {
    return this._start;
  }

  /**
   * Get the end point of the line.
   * @returns The end point of the line.
   */
  get end(): Point {
    return this._end;
  }

  /**
   * Get the length of the line.
   * @returns The length of the line.
   */
  get length(): number {
    return this.start.dist(this.end);
  }
}
