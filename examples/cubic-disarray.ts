/**
 * Cubic Disarray, after Georg Nees.
 *
 * A grid of squares that rotate more and more as the rows go down.
 *
 * Run it and redirect the output to a file:
 *   deno run examples/cubic-disarray.ts > cubic-disarray.svg
 */

import { Drawing, Grid, Random, Settings, Vormen } from "@berkes/vormen";

const settings = new Settings({
  rotationStrength: 2,
});

function draw(settings: Settings): Drawing {
  const drawing = new Drawing()
    .withA4Size()
    .withMargin(20)
    .withBackgroundColor("#eee");

  const canvas = drawing.build();

  const grid = new Grid()
    .withSize(drawing.getInnerWidth(), drawing.getInnerHeight())
    .withCols(8)
    .withRows(9)
    .withPadding(4)
    .withSquareCells();

  const rand = new Random("seeed");

  grid.cells().forEach((cell) => {
    const square = canvas.rect(cell.width, cell.height)
      .fill("none")
      .stroke({ color: "black", width: 1 })
      .move(cell.x, cell.y);

    if (cell.row > 1) {
      square.rotate(
        rand.between(-cell.row, cell.row) * settings.getInt("rotationStrength"),
      );
    }
  });

  return drawing;
}

Vormen(draw, settings);
