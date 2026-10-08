/**
 * Integration test for the Path domain: builds predictable paths with
 * PathBuilder and RoundedPathBuilder and draws them into one SVG through our
 * Drawing, by passing the built path data strings to SVG.Path.
 */
import { assertStringIncludes } from "@std/assert";
import {
  Drawing,
  PathBuilder,
  Point,
  RoundedPathBuilder,
} from "@berkes/vormen";

// Helper to create points for readability
const p = (x: number, y: number) => new Point(x, y);

// A predictable 40x40 square with its top-left corner at (x, y)
const square = (x: number, y: number) => [
  p(x, y),
  p(x + 40, y),
  p(x + 40, y + 40),
  p(x, y + 40),
];

// A predictable zigzag with its valleys on the baseline y and its peaks 20
// above it. Adjacent points are ~28.3 apart, so a rounding radius larger than
// ~14.1 only fits when constrained.
const zigzag = (y: number) => [
  p(5, y),
  p(25, y - 20),
  p(45, y),
  p(65, y - 20),
  p(85, y),
];

Deno.test("Drawing renders paths from PathBuilder and RoundedPathBuilder", async (t) => {
  const drawing = new Drawing().withSize(120, 180).withMargin(10);
  const canvas = drawing.build();

  // Top-left: angular closed square
  const linear = new PathBuilder(square(5, 5)).withClosed(true);
  canvas.path(linear.build()).id("linear-closed").fill("none").stroke({
    color: "black",
    width: 1,
  });

  // Top-right: rounded closed square
  const rounded = new RoundedPathBuilder(square(55, 5)).withRounding(8)
    .withClosed(true);
  canvas.path(rounded.build()).id("rounded-closed").fill("none").stroke({
    color: "black",
    width: 1,
  });

  // Bottom-left: rounded square converted from a linear builder's points
  const linearToConvert = new PathBuilder(square(5, 55)).withClosed(true);
  const converted = new RoundedPathBuilder(linearToConvert.points).withRounding(
    4,
  )
    .withClosed(true);
  canvas.path(converted.build()).id("converted-rounded-closed").fill("none")
    .stroke({
      color: "black",
      width: 1,
    });

  // Bottom-right: angular open triangle
  const open = new PathBuilder([p(55, 95), p(95, 95), p(75, 55)]);
  canvas.path(open.build()).id("linear-open").fill("none").stroke({
    color: "black",
    width: 1,
  });

  // Lower band: the same zigzag with the same radius, once unconstrained (the
  // corners overshoot and tangle) and once constrained (the radius shrinks to
  // fit between the points)
  const unconstrained = new RoundedPathBuilder(zigzag(125)).withRounding(20);
  canvas.path(unconstrained.build()).id("rounded-unconstrained").fill("none")
    .stroke({
      color: "black",
      width: 1,
    });

  const constrained = new RoundedPathBuilder(zigzag(155)).withRounding(20)
    .withRoundingConstrained(true);
  canvas.path(constrained.build()).id("rounded-constrained").fill("none")
    .stroke({
      color: "black",
      width: 1,
    });

  const svg = drawing.svg();

  // Confirm the exact path data strings made it into the SVG XML
  assertStringIncludes(svg, `d="${linear.build()}"`);
  assertStringIncludes(svg, `d="${rounded.build()}"`);
  assertStringIncludes(svg, `d="${converted.build()}"`);
  assertStringIncludes(svg, `d="${open.build()}"`);
  assertStringIncludes(svg, `d="${unconstrained.build()}"`);
  assertStringIncludes(svg, `d="${constrained.build()}"`);

  await t.assertSnapshot(svg);
});
