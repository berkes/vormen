/**
 * Integration test for the builder value semantics: every with*() method
 * returns a distinct, configured copy and leaves the object it was called
 * on unchanged, so one base configuration can be branched into several
 * variations.
 */
import {
  assertAlmostEquals,
  assertEquals,
  assertNotStrictEquals,
} from "@std/assert";
import { Drawing, Grid, StandardSize } from "@berkes/vormen";

Deno.test("Builders branch into distinct copies from one base", () => {
  const base = new Drawing().withStandardSize(StandardSize.A4);
  const drawing = base.withMargin(20);

  assertNotStrictEquals(drawing, base);
  assertEquals(base.margin.isZero(), true);

  const canvas = drawing.build();
  assertAlmostEquals(drawing.width, 753.70, 0.01);
  assertEquals(base.width, base.outerWidth);

  const grid = new Grid().withSize(drawing.width, drawing.height).withCols(4)
    .withRows(4);
  const padded = grid.withPadding(5);

  assertNotStrictEquals(padded, grid);
  assertEquals(grid.cells()[0].width, drawing.width / 4);
  assertEquals(
    padded.cells()[0].width,
    drawing.width / 4 - 10, // left and right padding
  );

  // The branched drawing can be built independently of the base.
  canvas.rect(10, 10).move(0, 0);
  assertEquals(drawing.svg().includes("margin_group"), true);
});
