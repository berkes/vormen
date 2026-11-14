---
sidebar_position: 5
title: Grid
---

A grid system for organizing cells in a drawing. Contains Grid and Cell classes.
Grid uses the builder pattern for configuration; its `cells()` method yields
Cell objects that provide position and dimension information. Every `with*()`
method returns a new `Grid` and leaves the grid it was called on unchanged. The
grid isn't visible, but allows us to position elements in a grid with easy tools
like being able to loop over all the cells, get X and Y coordinates of a cell,
add paddings between cells and so on. `grid.intersections()` returns all points
where the grid lines cross, including the outer edges, sorted in ascending order
by y and then by x.

## Example

Dedicated example: [Grid cookbook page](/cookbook/grid)
(download + source there). Rendered output:

```vorm name="modules-grid-demo"
import { Drawing, Grid, Vormen } from "@berkes/vormen";

function draw(): string {
  const drawing = new Drawing().withSize(120, 120).withBackgroundColor("#fff");
  const canvas = drawing.build();
  new Grid().withSize(120, 120).withCols(3).withRows(3).withPadding(4)
    .cells()
    .forEach((cell) =>
      canvas.circle(Math.min(cell.width, cell.height) / 2 - 1)
        .fill("none").stroke({ color: "#2c3e50", width: 1 })
        .cx(cell.centerX).cy(cell.centerY)
    );
  return drawing.svg();
}

Vormen(draw, {});
```
