import { Rect } from "@svgdotjs/svg.js";
import { DrawingBuilder, Grid, Noise } from "../lib/index.ts";

const drawing = DrawingBuilder.new()
  .withA4Size()
  .withMargin(50)
  .withBackgroundColor("#f0f0f0");

const draw = drawing.build();

const grid = Grid.new()
  .withSize(drawing.getInnerWidth(), drawing.getInnerHeight())
  .withCols(9)
  .withRows(11)
  .withGutterFactor(0.10)
  .withSquareCells();

draw.add(grid.toSvg(true));
const noise = new Noise("foobar");

grid.cells().forEach(cell => {
  const square = new Rect().size(cell.width(), cell.height()).move(cell.x(), cell.y()).fill("none").stroke("#000000").opacity(0.5);
  const r = noise.get(cell.x(), cell.y()) * cell.row() * 2;
  square.rotate(r);
  draw.add(square);
});
