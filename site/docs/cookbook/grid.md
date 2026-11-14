---
sidebar_position: 3
title: Grid
---

import useBaseUrl from "@docusaurus/useBaseUrl";

`Grid` lays out invisible cells over the drawing; `cells()` yields each cell with position and size. Here one circle per cell. `cols` and `rows` are settings: try `--setting.cols=6`.

**Download:** <a href={useBaseUrl("/downloads/cookbook-grid.ts")} download>cookbook-grid.ts</a> — run it
as described under [Download and run an example](/examples).

```vorm name="cookbook-grid"
/**
 * Cookbook: Grid.
 *
 * Lay out cells over the drawing and draw one circle per cell. The grid is
 * invisible; it only provides positions and sizes. Settings control the
 * number of columns and rows.
 */
import {
  Drawing,
  Grid,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "cookbook-grid",
  cols: 4,
  rows: 3,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withSize(320, 240)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();
  const grid = new Grid()
    .withSize(drawing.width, drawing.height)
    .withCols(settings.cols)
    .withRows(settings.rows)
    .withPadding(8);
  grid.cells().forEach((cell) => {
    const radius = Math.min(cell.width, cell.height) / 2 - 2;
    canvas.circle(radius)
      .fill("none")
      .stroke({ color: "#2c3e50", width: 1.5 })
      .cx(cell.centerX)
      .cy(cell.centerY);
  });
  return drawing.svg();
}

Vormen(draw, defaultSettings);
```
