/**
 * RoundedPathBuilder - Building SVG path data strings with rounded corners.
 *
 * Extends the PathBuilder from path.ts: every point in the path becomes a
 * corner, drawn as a quadratic bezier curve with the configured radius.
 *
 * Features:
 * - Round the corners of a path with a radius
 * - Optionally constrain the radius to half the distance to the neighbouring
 *   points, so corners never overlap
 */

import { PathBuilder } from "./path.ts";

export class RoundedPathBuilder extends PathBuilder {
  private _radius: number = 0;
  private _constrained: boolean = false;

  withRounding(radius: number): this {
    this._radius = radius;
    return this;
  }

  withRoundingConstrained(constrained: boolean): this {
    this._constrained = constrained;
    return this;
  }

  protected override buildSegments(): string {
    let out = "";
    this.points.forEach((point, idx) => {
      const prev = this.getCyclic(idx - 1);
      const next = this.getCyclic(idx + 1);

      let radius = this._radius;
      if (this._constrained) {
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
    return out;
  }
}
