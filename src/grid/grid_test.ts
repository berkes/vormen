import { assertEquals, assertNotStrictEquals } from "@std/assert";
import { Grid } from "./grid.ts";

Deno.test("with-methods return a distinct Grid and leave the original unchanged", () => {
  const base = new Grid().withSize(300, 400);

  const withCols = base.withCols(10);
  assertNotStrictEquals(withCols, base);
  assertEquals(withCols.numCols, 10);
  assertEquals(base.numCols, 0);

  const withRows = withCols.withRows(20);
  assertNotStrictEquals(withRows, withCols);
  assertEquals(withRows.numRows, 20);
  assertEquals(withCols.numRows, 0);

  const padded = withRows.withPadding(8);
  assertNotStrictEquals(padded, withRows);
  assertEquals(padded.cellWidth, 14); // 30 - 8 - 8
  assertEquals(withRows.cellWidth, 30);

  const withPaddingTop = padded.withPaddingTop(0);
  assertNotStrictEquals(withPaddingTop, padded);
  assertEquals(withPaddingTop.cellHeight, 12); // 20 - 0 - 8
  assertEquals(padded.cellHeight, 4); // 20 - 8 - 8

  const square = withRows.withSquareCells();
  assertNotStrictEquals(square, withRows);
  assertEquals(square.height, 600); // 20 rows * 30 wide cells
  assertEquals(withRows.height, 400);
});

Deno.test("cells() of a copied grid are generated against the copy", () => {
  const base = new Grid().withSize(100, 100).withCols(2).withRows(2);
  assertEquals(base.cells().length, 4); // Warms the cells cache.

  const padded = base.withPadding(10);

  assertEquals(padded.cells()[0].width, 30); // 50 - 10 - 10
  assertEquals(base.cells()[0].width, 50);
});

Deno.test("builder common", () => {
  const grid = new Grid().withSize(300, 400).withCols(10).withRows(20);
  assertEquals(grid.width, 300);
  assertEquals(grid.height, 400);
});

Deno.test("withCols withRows negative", () => {
  const grid = new Grid().withCols(-10).withRows(-20);
  assertEquals(grid.numRows, 0);
  assertEquals(grid.numCols, 0);
});

Deno.test("padding single", () => {
  const grid = new Grid().withSize(300, 400).withCols(10).withRows(10)
    .withPadding(8);
  const firstCell = grid.cells()[0];
  assertEquals(firstCell.x, 8);
  assertEquals(firstCell.y, 8);
  assertEquals(firstCell.width, 14); // 300 / 10 - 8 - 8 = 14
  assertEquals(firstCell.height, 24); // 400 / 10 - 8 - 8 = 24

  const secondRowCell = grid.cells()[10];
  assertEquals(secondRowCell.x, 8);
  assertEquals(secondRowCell.y, 48); // 2 * 24
});

Deno.test("padding multiple", () => {
  const grid = new Grid().withSize(300, 400).withCols(10).withRows(10)
    .withPaddingTop(8).withPaddingLeft(7).withPaddingRight(6).withPaddingBottom(
      5,
    );
  const firstCell = grid.cells()[0];
  assertEquals(firstCell.x, 7);
  assertEquals(firstCell.y, 8);
  assertEquals(firstCell.width, 17); // 300 / 10 - 7 - 6 = 17
  assertEquals(firstCell.height, 27);

  const secondColCell = grid.cells()[1];
  assertEquals(secondColCell.x, 37); // (7 + 17 + 6) + 7 = 37

  const secondRowCell = grid.cells()[10];
  assertEquals(secondRowCell.x, 7);
  assertEquals(secondRowCell.y, 48); // (8 + 27 + 5) + 8 = 48
});

Deno.test("withSquareCells", () => {
  const grid = new Grid().withSize(300, 400).withCols(10).withRows(10)
    .withSquareCells();

  assertEquals(grid.numCols, 10);
  assertEquals(grid.numRows, 10);
  assertEquals(grid.cellWidth, 30);
  assertEquals(grid.cellHeight, 30);
});

Deno.test("cells()", () => {
  const grid = new Grid().withSize(300, 400).withCols(10).withRows(10);
  const cells = grid.cells();
  assertEquals(cells.length, 100);
  cells.forEach((cell) => {
    const expectedX = cell.col * cell.width;
    const expectedY = cell.row * cell.height;
    assertEquals(cell.x, expectedX);
    assertEquals(cell.y, expectedY);
  });
});

Deno.test("Cell centerX and centerY", () => {
  const grid = new Grid().withSize(10, 10).withCols(1).withRows(1);
  const cell = grid.cells()[0];
  assertEquals(cell.centerX, 5);
  assertEquals(cell.centerY, 5);
});

Deno.test("intersections()", () => {
  const grid = new Grid().withSize(30, 30).withCols(3).withRows(3);
  const intersections = grid.intersections();
  assertEquals(intersections.length, 16);
  assertEquals(intersections.map((p) => p.toString()), [
    "(0, 0)",
    "(10, 0)",
    "(20, 0)",
    "(30, 0)",
    "(0, 10)",
    "(10, 10)",
    "(20, 10)",
    "(30, 10)",
    "(0, 20)",
    "(10, 20)",
    "(20, 20)",
    "(30, 20)",
    "(0, 30)",
    "(10, 30)",
    "(20, 30)",
    "(30, 30)",
  ]);
});

Deno.test("intersections() with non-square cells", () => {
  const grid = new Grid().withSize(20, 30).withCols(2).withRows(3);
  const intersections = grid.intersections();
  assertEquals(intersections.length, 12);
  assertEquals(intersections.map((p) => `${p.x},${p.y}`), [
    "0,0",
    "10,0",
    "20,0",
    "0,10",
    "10,10",
    "20,10",
    "0,20",
    "10,20",
    "20,20",
    "0,30",
    "10,30",
    "20,30",
  ]);
});

Deno.test("intersections() with padding uses outer cell size", () => {
  const grid = new Grid().withSize(30, 30).withCols(3).withRows(3)
    .withPadding(1);
  const intersections = grid.intersections();
  assertEquals(intersections.length, 16);
  assertEquals(intersections[0].toString(), "(0, 0)");
  assertEquals(intersections[1].toString(), "(10, 0)");
  assertEquals(intersections[15].toString(), "(30, 30)");
});

Deno.test("intersections() on empty grid", () => {
  const noCols = new Grid().withSize(30, 30).withRows(3);
  assertEquals(noCols.intersections(), []);

  const noRows = new Grid().withSize(30, 30).withCols(3);
  assertEquals(noRows.intersections(), []);
});
