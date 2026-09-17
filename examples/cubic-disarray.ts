/// <reference lib="dom" />
/**
 * Cubic Disarray, after Georg Nees.
 *
 * A grid of squares that rotate more and more as the rows go down.
 *
 * Run it and redirect the output to a file:
 *   deno run examples/cubic-disarray.ts > cubic-disarray.svg
 */

import { Drawing, Grid, randomBetween } from "@berkes/vormen";
import { registerWindow } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";

const ROTATION_STRENGTH = 2;

// svg.js needs a DOM to draw into. Outside the browser, svgdom provides one.
const window = createSVGWindow();
registerWindow(window, window.document);

const drawing = new Drawing()
  .withA4Size()
  .withMargin(20)
  .withBackgroundColor("#eee");

const canvas = drawing.build(window.document.documentElement);

const grid = new Grid()
  .withSize(drawing.getInnerWidth(), drawing.getInnerHeight())
  .withCols(8)
  .withRows(9)
  .withPadding(4)
  .withSquareCells();

grid.cells().forEach((cell) => {
  const square = canvas.rect(cell.width, cell.height)
    .fill("none")
    .stroke({ color: "black", width: 1 })
    .move(cell.x, cell.y);

  if (cell.row > 1) {
    square.rotate(randomBetween(-cell.row, cell.row) * ROTATION_STRENGTH);
  }
});

console.log(canvas.root().svg());
