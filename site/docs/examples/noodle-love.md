---
sidebar_position: 4
title: Noodle Love
---

import useBaseUrl from "@docusaurus/useBaseUrl";

A grid of round and cross tiles, each placed in a cell and rotated by a random
multiple of 90 degrees, with a heart in the center. It showcases grids with
square cells, the seedable `Random` generator, and reusing external SVG assets
with `readSvg` and defs.


**Download:** <a href={useBaseUrl("/downloads/noodle_love.ts")} download>noodle_love.ts</a>
Run it as described under [Download and run an example](/examples).

```vorm name="noodle-love"
/**
 * Noodle Love (inline docs version).
 *
 * A grid of round and cross tiles, each rotated by a random multiple of 90
 * degrees, with a heart in the center. Showcases grids with square cells and
 * the seedable Random generator.
 */
import {
  Drawing,
  Grid,
  PathBuilder,
  Point,
  Random,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "noodle-love",
  cols: 6,
  rows: 5,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withSize(360, 300)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();
  const grid = new Grid()
    .withSize(drawing.width, drawing.height)
    .withCols(settings.cols)
    .withRows(settings.rows)
    .withPadding(6)
    .withSquareCells();
  const rand = new Random(settings.seed);
  const cells = grid.cells();
  const center = cells[Math.floor(cells.length / 2)];
  cells.forEach((cell) => {
    const s = Math.min(cell.width, cell.height) / 4;
    if (cell === center) {
      const cx = cell.centerX;
      const cy = cell.centerY;
      const heart = new PathBuilder([
        new Point(cx, cy + s * 1.4),
        new Point(cx - s * 2, cy),
        new Point(cx - s, cy - s * 1.2),
        new Point(cx, cy - s * 0.4),
        new Point(cx + s, cy - s * 1.2),
        new Point(cx + s * 2, cy),
      ]).withClosed(true).build();
      canvas.path(heart).fill("#c0392b");
      return;
    }
    const r = rand.pick([0, 90, 180, 270]) * (Math.PI / 180);
    const dx = Math.cos(r) * s;
    const dy = Math.sin(r) * s;
    if (rand.chance(0.5)) {
      canvas.circle(s * 2)
        .fill("none")
        .stroke({ color: "#2c3e50", width: 2 })
        .cx(cell.centerX)
        .cy(cell.centerY);
    } else {
      canvas.line(cell.centerX - dx, cell.centerY - dy, cell.centerX + dx, cell.centerY + dy)
        .stroke({ color: "#2c3e50", width: 2 });
      canvas.line(cell.centerX - dy, cell.centerY + dx, cell.centerX + dy, cell.centerY - dx)
        .stroke({ color: "#2c3e50", width: 2 });
    }
  });
  return drawing.svg();
}

Vormen(draw, defaultSettings);
```
