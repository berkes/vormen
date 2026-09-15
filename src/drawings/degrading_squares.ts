import { Rect } from "@svgdotjs/svg.js";
import { DrawingBuilder } from "../lib/drawing.js";
import { Grid } from "../lib/grid.js";

const drawing = DrawingBuilder.new()
  .withA4Size()
  .withMargin(20)
  .withBackgroundColor("#f0f0f0");

const canvas = drawing.build()

const grid = Grid.new().withSize(4, 4).withSize(drawing.getInnerWidth(), drawing.getInnerHeight());

for (const cell of grid.cells()) {
  const rect = new Rect().size(cell.cellWidth(), cell.cellHeight());
  rect.move(cell.x, cell.y);

  const hue = 255 * Math.random();
  rect.fill(`hsl(${hue}, 70%, 70%)`);

  canvas.add(rect);
}
