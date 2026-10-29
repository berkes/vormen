/**
 * Unit tests for RoundedPathBuilder.
 */
import { RoundedPathBuilder } from "./rounded_path_builder.ts";
import { PathBuilder } from "./path.ts";
import { Point } from "../primitives/point.ts";
import { assert, assertEquals, assertNotStrictEquals } from "@std/assert";

// Helper to create points for readability
const p = (x: number, y: number) => new Point(x, y);

Deno.test("withRounding returns a distinct builder and leaves the original unchanged", () => {
  const builder = new RoundedPathBuilder([p(0, 0), p(10, 10)]);
  const result = builder.withRounding(5);

  assertNotStrictEquals(result, builder);
  assertEquals(builder.build(), "M0 0L0 0Q0 0,0 0L10 10Q10 10,10 10");
  assert(result.build() !== builder.build());
});

Deno.test("withRoundingConstrained returns a distinct builder and leaves the original unchanged", () => {
  // Points less than radius * 2 apart, so constraining shrinks the radius.
  const builder = new RoundedPathBuilder([p(0, 0), p(1, 0), p(2, 0)])
    .withRounding(5);
  const result = builder.withRoundingConstrained(true);

  assertNotStrictEquals(result, builder);
  assert(result.build() !== builder.build());
});

Deno.test("copies keep the rounding when chained through base-class methods", () => {
  const builder = new RoundedPathBuilder([p(0, 0), p(10, 0), p(10, 10)])
    .withRounding(4);

  const closed = builder.withClosed(true);
  assertNotStrictEquals(closed, builder);
  assert(closed instanceof RoundedPathBuilder);
  assertEquals(builder.build().includes("Z"), false);
  assert(closed.build().includes("Q"));
  assert(closed.build().includes("Z"));

  const pushed = builder.push(p(20, 10));
  assertNotStrictEquals(pushed, builder);
  assert(pushed instanceof RoundedPathBuilder);
  assert(pushed.build().includes("Q"));
});

Deno.test("chain multiple builder methods", () => {
  const builder = new RoundedPathBuilder([p(0, 0), p(10, 10)])
    .withRounding(5)
    .withRoundingConstrained(true)
    .withClosed(true)
    .push(p(20, 0));

  assertEquals(builder.points, [p(0, 0), p(10, 10), p(20, 0)]);
});

Deno.test("build() with rounding on square path", async (t) => {
  const builder = new RoundedPathBuilder([
    p(0, 0),
    p(10, 0),
    p(10, 10),
    p(0, 10),
  ])
    .withRounding(2);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with rounding on triangle path", async (t) => {
  const builder = new RoundedPathBuilder([p(0, 0), p(10, 0), p(5, 10)])
    .withRounding(1);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with rounding and closed path", async (t) => {
  const builder = new RoundedPathBuilder([
    p(0, 0),
    p(10, 0),
    p(10, 10),
    p(0, 10),
  ])
    .withRounding(2)
    .withClosed(true);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with constrained rounding reduces radius", async (t) => {
  const builder = new RoundedPathBuilder([p(0, 0), p(1, 0), p(10, 0)])
    .withRounding(5)
    .withRoundingConstrained(true);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with constrained rounding on very close points", async (t) => {
  const builder = new RoundedPathBuilder([p(0, 0), p(0.1, 0), p(0.2, 0)])
    .withRounding(10)
    .withRoundingConstrained(true);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("RoundedPathBuilder created from PathBuilder points", async (t) => {
  const linear = new PathBuilder([p(0, 0), p(10, 0), p(10, 10)]);
  const rounded = new RoundedPathBuilder(linear.points).withRounding(1);

  assertEquals(rounded.points, linear.points);
  assertEquals(rounded.start, p(0, 0));
  assertEquals(rounded.end, p(10, 10));

  await t.assertSnapshot(rounded.build());
});

Deno.test("PathBuilder created from RoundedPathBuilder points", () => {
  const rounded = new RoundedPathBuilder([p(0, 0), p(10, 0), p(10, 10)])
    .withRounding(1);
  const linear = new PathBuilder(rounded.points);

  assertEquals(linear.points, [p(0, 0), p(10, 0), p(10, 10)]);
});
