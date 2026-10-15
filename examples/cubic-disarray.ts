/**
 * Cubic Disarray, after Georg Nees.
 *
 * A grid of squares that rotate more and more as the rows go down.
 *
 * Run it and redirect the output to a file:
 *   deno run examples/cubic-disarray.ts > cubic-disarray.svg
 */
import { Drawing, Grid, Random, Settings, Vormen } from "@berkes/vormen";

const schema = {
  rotationStrength: 2,
  seed: "fancy-red-chicken",
};

function draw(rawSettings: Record<string, string>): string {
  const settings = Settings.fromCLI(schema, rawSettings);
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
    drawing.getInnerHeight(),
  );
  return drawing.svg();
}

Vormen(draw, new Settings(schema));
