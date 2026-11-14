/**
 * Cookbook: Primitives — Point and Vector.
 *
 * Points and vectors are not drawn themselves; use them to calculate, then
 * draw the result. Here: a line between two points, a point at a distance
 * from b towards a, and a point derived by scaling the vector a->b.
 */
import { Drawing, Point, Vormen } from "@berkes/vormen";

function draw(): string {
  const drawing = new Drawing()
    .withSize(320, 240)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();

  const a = new Point(40, 200);
  const b = new Point(280, 40);

  canvas.line(a.x, a.y, b.x, b.y).stroke({ color: "#333", width: 2 });

  // A point 80 units from b towards a.
  const c = b.pointAtDistanceTowards(a, 80);
  canvas.circle(8).fill("#c0392b").cx(c.x).cy(c.y);

  // Same idea with vector math: start at b, walk 40 units along a->b.
  const d = b.add(a.to(b).normalized.scale(-40));
  canvas.circle(5).fill("#2980b9").cx(d.x).cy(d.y);

  return drawing.svg();
}

Vormen(draw, {});
