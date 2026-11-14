---
sidebar_position: 1
title: Cubic Disarray
---

import useBaseUrl from "@docusaurus/useBaseUrl";

Cubic Disarray, after Georg Nees: a grid of white squares whose rotation grows
stronger towards the bottom rows, on an A4 page with a gray background.

The rotation strength is a setting: the higher it is, the more the squares
scatter. Both SVGs below use the same seed and only differ in the
`rotationStrength` setting (`2` and `5`).



**Download:** <a href={useBaseUrl("/downloads/cubic-disarray.ts")} download>cubic-disarray.ts</a>
Run it as described under [Download and run an example](/examples).

```vorm name="cubic-disarray"
/**
 * Cubic Disarray, after Georg Nees.
 *
 * A grid of squares that rotate more and more as the rows go down.
 *
 * Run it and redirect the output to a file:
 * Run it: deno run cubic-disarray.ts render -o out.svg
 */
import {
  Drawing,
  Grid,
  Random,
  Settings,
  type SettingsData,
  StandardSize,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  rotationStrength: 2,
  seed: "fancy-red-chicken",
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withStandardSize(StandardSize.A4)
    .withMargin(20)
    .withBackgroundColor("#eee");
  const canvas = drawing.build();
  const grid = new Grid()
    .withSize(drawing.width, drawing.height)
    .withCols(8)
    .withRows(9)
    .withPadding(4)
    .withSquareCells();
  const rand = new Random(settings.seed);
  grid.cells().forEach((cell) => {
    const square = canvas.rect(cell.width, cell.height)
      .fill("white")
      .stroke({ color: "black", width: 1 })
      .move(cell.x, cell.y);
    if (cell.row > 1) {
      square.rotate(
        rand.between(-cell.row, cell.row) * settings.rotationStrength,
      );
    }
  });
  // Add seeed
  canvas.text(`seed ${settings.seed}`).x(0).cy(
    drawing.height,
  );
  return drawing.svg();
}

Vormen(draw, defaultSettings);
```
