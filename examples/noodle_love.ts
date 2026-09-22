import { Drawing, Grid, Random, readSvg } from "@berkes/vormen";

const drawing = new Drawing()
  .withA4Size()
  .withMargin(20)
  .withBackgroundColor("#fff");

const canvas = drawing.build();

const COLUMNS = 20;
const ROWS = 25;
const grid = new Grid()
  .withSize(drawing.getInnerWidth(), drawing.getInnerHeight())
  .withCols(COLUMNS)
  .withRows(ROWS)
  .withSquareCells();

const rand = new Random();

const tileNames = ["tile_round", "tile_cross"];
const tiles = tileNames.map((tileName) => {
  const tile = readSvg(`examples/assets/${tileName}.svg`);
  tile.id(tileName);
  return tile;
});

const centerTile = readSvg("examples/assets/heart.svg");
centerTile.id("center-tile");
canvas.defs().add(centerTile);

tiles.forEach((tile) => {
  canvas.defs().add(tile);
});

grid.cells().forEach((cell) => {
  const tileName = tileNames[rand.between(0, tileNames.length - 1)];
  const tile = canvas.use(tileName);
  tile.x(cell.x).y(cell.y).width(cell.width).height(cell.height);
  tile.rotate(rand.between(0, 3) * 90, cell.centerX, cell.centerY);
});

// Our center tile is 3 x 2 cells we add our center over the grid at this position
const centerCell = grid.pickCell(
  Math.floor(COLUMNS / 2) - 2,
  Math.floor(ROWS / 2) - 1,
)!;
const centerTileX = centerCell.x;
const centerTileY = centerCell.y;
const centerTileWidth = centerCell.width * 3;
const centerTileHeight = centerCell.height * 2;

canvas.rect(centerTileWidth, centerTileHeight).x(centerTileX).y(centerTileY)
  .fill("#ffffff");
canvas.use("center-tile").x(centerTileX).y(centerTileY).width(centerTileWidth)
  .height(
    centerTileHeight,
  );

const text = canvas.text(`Noodle ${rand.seed}`);

text.x(0).y(drawing.getInnerHeight());

console.log(drawing.svg());
