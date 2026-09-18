import { Drawing, Grid, Random, readSvg } from "@berkes/vormen";

const drawing = new Drawing()
  .withA4Size()
  .withMargin(20)
  .withBackgroundColor("#fff");

const canvas = drawing.build();

const grid = new Grid()
  .withSize(drawing.getInnerWidth(), drawing.getInnerHeight())
  .withCols(20)
  .withRows(20)
  .withSquareCells();

const rand = new Random();

const tileNames = ["tile_round", "tile_cross"];

const tiles = tileNames.map((tileName) => {
  const tile = readSvg(`examples/assets/${tileName}.svg`);
  tile.id(tileName);
  return tile;
});

tiles.forEach((tile) => {
  canvas.defs().add(tile);
});

grid.cells().forEach((cell) => {
  const tileName = tileNames[rand.between(0, tileNames.length - 1)];
  const tile = canvas.use(`${tileName}`);
  tile.x(cell.x).y(cell.y).width(cell.width).height(cell.height);
  tile.rotate(rand.between(0, 3) * 90, cell.centerX, cell.centerY);
});

const text = canvas.text(`drawing: ${rand.seed}`);

text.x(0).y(drawing.getInnerHeight());

console.log(drawing.svg());
