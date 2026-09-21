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
  seed: "fancy-red-chicken",
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

  const rand = new Random(settings.getString("seed"));

  grid.cells().forEach((cell) => {
    const square = canvas.rect(cell.width, cell.height)
      .fill("white")
      .stroke({ color: "black", width: 1 })
      .move(cell.x, cell.y);

    if (cell.row > 1) {
      square.rotate(
        rand.between(-cell.row, cell.row) * settings.getInt("rotationStrength"),
      );
    }
  });

  // Add seeed
  canvas.text(`seed ${settings.getString("seed")}`).x(0).cy(
    drawing.getInnerHeight(),
  );

  return drawing;
}

Vormen(draw, settings);
