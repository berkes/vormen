import { assertEquals } from "@std/assert";
import { Grid } from "./grid.ts";

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
