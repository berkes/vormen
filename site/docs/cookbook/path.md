---
sidebar_position: 6
title: "Path: PathBuilder vs RoundedPathBuilder"
---

import useBaseUrl from "@docusaurus/useBaseUrl";

Build SVG path data from points. Left: `PathBuilder` with straight segments. Right: `RoundedPathBuilder` rounds every corner with a quadratic bezier (`withRounding(18)`).

**Download:** <a href={useBaseUrl("/downloads/cookbook-path.ts")} download>cookbook-path.ts</a> — run it
as described under [Download and run an example](/examples).

```vorm name="cookbook-path"
/**
 * Cookbook: Path — PathBuilder vs RoundedPathBuilder.
 *
 * The same points drawn twice: angular straight segments (left) and corners
 * rounded with quadratic beziers (right).
 */
import {
  Drawing,
  PathBuilder,
  Point,
  RoundedPathBuilder,
  Vormen,
} from "@berkes/vormen";

function draw(): string {
  const drawing = new Drawing()
    .withSize(360, 240)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();

  const base = [
    new Point(20, 180),
    new Point(60, 60),
    new Point(100, 150),
    new Point(140, 50),
  ];
  const left = base;
  const right = base.map((p) => new Point(p.x + 190, p.y));

  const angular = new PathBuilder(left).withClosed(true).build();
  const rounded = new RoundedPathBuilder(right).withRounding(18).withClosed(
    true,
  )
    .build();

  canvas.path(angular).fill("none").stroke({ color: "#333", width: 2 });
  canvas.path(rounded)
    .fill("rgba(91, 75, 138, 0.15)")
    .stroke({ color: "#5b4b8a", width: 2 });

  return drawing.svg();
}

Vormen(draw, {});
```
