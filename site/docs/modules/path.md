---
sidebar_position: 8
title: Path
---

Building SVG path data strings from points, as defined in the
[w3c SVG Spec on PathData](https://www.w3.org/TR/SVG/paths.html#PathData).
Contains the PathBuilder and RoundedPathBuilder classes.

- **PathBuilder**: Builds an angular path (straight line segments) from a list
  of points. Uses the builder pattern: `new PathBuilder(points)`, optionally
  `.withClosed(true)` to close the path, then `.build()` returns the path data
  string.
- **RoundedPathBuilder**: Extends PathBuilder to draw every corner as a
  quadratic bezier curve. Set the corner radius with `.withRounding(radius)` and
  optionally `.withRoundingConstrained(true)` to shrink the radius so corners
  never overlap on close-together points.

Both builders are constructed from points, so a path built with one can be
re-drawn with the other by re-using the points, e.g.
`new RoundedPathBuilder(linearPath.points)`.

All builder methods (`withClosed()`, `push()`, `withRounding()` and
`withRoundingConstrained()`) return a new builder and leave the builder they
were called on unchanged.

## Example

Dedicated example: [Path cookbook page](/cookbook/path)
(download + source there). Rendered output:

```vorm name="modules-path-demo"
import { Drawing, PathBuilder, Point, RoundedPathBuilder, Vormen } from "@berkes/vormen";

function draw(): string {
  const drawing = new Drawing().withSize(240, 120).withBackgroundColor("#fff");
  const canvas = drawing.build();
  const pts = [new Point(15, 90), new Point(45, 30), new Point(75, 80), new Point(105, 25)];
  canvas.path(new PathBuilder(pts).withClosed(true).build())
    .fill("none").stroke({ color: "#333", width: 2 });
  const shifted = pts.map((p) => new Point(p.x + 120, p.y));
  canvas.path(new RoundedPathBuilder(shifted).withRounding(10).withClosed(true).build())
    .fill("rgba(91,75,138,0.15)").stroke({ color: "#5b4b8a", width: 2 });
  return drawing.svg();
}

Vormen(draw, {});
```
