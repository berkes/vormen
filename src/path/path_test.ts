/**
 * Unit tests for PathBuilder.
 */
import { PathBuilder } from "./path.ts";
import { Point } from "../primitives/point.ts";
import { assert, assertEquals, assertThrows } from "@std/assert";

// Helper to create points for readability
const p = (x: number, y: number) => new Point(x, y);

Deno.test("PathBuilder constructor with points", () => {
  const points = [p(0, 0), p(10, 0), p(10, 10), p(0, 10)];
  const builder = new PathBuilder(points);

  assertEquals(builder.points, points);
  assertEquals(builder.start, p(0, 0));
  assertEquals(builder.end, p(0, 10));
});

Deno.test("PathBuilder constructor with empty array", () => {
  const builder = new PathBuilder([]);

  assertEquals(builder.points, []);
  assertEquals(builder.start, undefined);
  assertEquals(builder.end, undefined);
});

Deno.test("PathBuilder constructor with single point", () => {
  const builder = new PathBuilder([p(5, 5)]);

  assertEquals(builder.points, [p(5, 5)]);
  assertEquals(builder.start, p(5, 5));
  assertEquals(builder.end, p(5, 5));
});

Deno.test("withClosed sets closed and returns this", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);
  const result = builder.withClosed(true);

  assert(result === builder);
});

Deno.test("push adds point and returns this", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);
  const result = builder.push(p(20, 20));

  assert(result === builder);
  assertEquals(builder.points, [p(0, 0), p(10, 10), p(20, 20)]);
  assertEquals(builder.end, p(20, 20));
});

Deno.test("get returns point at valid index", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10), p(20, 20)]);

  assertEquals(builder.get(0), p(0, 0));
  assertEquals(builder.get(1), p(10, 10));
  assertEquals(builder.get(2), p(20, 20));
});

Deno.test("get throws on negative index", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);

  assertThrows(
    () => builder.get(-1),
    Error,
    "Index -1 out of bounds: 0..1",
  );
});

Deno.test("get throws on index >= length", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);

  assertThrows(
    () => builder.get(2),
    Error,
    "Index 2 out of bounds: 0..1",
  );
});

Deno.test("get throws on index way out of bounds", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);

  assertThrows(
    () => builder.get(100),
    Error,
    "Index 100 out of bounds: 0..1",
  );
});

Deno.test("tryGet returns point at valid index", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10), p(20, 20)]);

  assertEquals(builder.tryGet(0), p(0, 0));
  assertEquals(builder.tryGet(1), p(10, 10));
  assertEquals(builder.tryGet(2), p(20, 20));
});

Deno.test("tryGet returns undefined for negative index", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);

  assertEquals(builder.tryGet(-1), undefined);
});

Deno.test("tryGet returns undefined for index >= length", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);

  assertEquals(builder.tryGet(2), undefined);
});

Deno.test("tryGet returns undefined for way out of bounds index", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);

  assertEquals(builder.tryGet(100), undefined);
});

Deno.test("getCyclic returns point with positive index", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10), p(20, 20)]);

  assertEquals(builder.getCyclic(0), p(0, 0));
  assertEquals(builder.getCyclic(1), p(10, 10));
  assertEquals(builder.getCyclic(2), p(20, 20));
  assertEquals(builder.getCyclic(3), p(0, 0));
  assertEquals(builder.getCyclic(4), p(10, 10));
  assertEquals(builder.getCyclic(5), p(20, 20));
});

Deno.test("getCyclic returns point with negative index", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10), p(20, 20)]);

  assertEquals(builder.getCyclic(-1), p(20, 20));
  assertEquals(builder.getCyclic(-2), p(10, 10));
  assertEquals(builder.getCyclic(-3), p(0, 0));
  assertEquals(builder.getCyclic(-4), p(20, 20));
});

Deno.test("getCyclic throws on empty points", () => {
  const builder = new PathBuilder([]);

  assertThrows(
    () => builder.getCyclic(0),
    Error,
    "No points in path",
  );
});

Deno.test("indexOf returns correct index", () => {
  const point1 = p(0, 0);
  const point2 = p(10, 10);
  const point3 = p(20, 20);
  const builder = new PathBuilder([point1, point2, point3]);

  assertEquals(builder.indexOf(point1), 0);
  assertEquals(builder.indexOf(point2), 1);
  assertEquals(builder.indexOf(point3), 2);
});

Deno.test("indexOf returns -1 for non-existent point", () => {
  const builder = new PathBuilder([p(0, 0), p(10, 10), p(20, 20)]);
  const other = p(30, 30);

  assertEquals(builder.indexOf(other), -1);
});

Deno.test("build() with no rounding produces simple path", async (t) => {
  const builder = new PathBuilder([p(0, 0), p(10, 0), p(10, 10)]);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with single point and no rounding", async (t) => {
  const builder = new PathBuilder([p(5, 5)]);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with two points and no rounding", async (t) => {
  const builder = new PathBuilder([p(0, 0), p(10, 10)]);
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with closed path and no rounding", async (t) => {
  const builder = new PathBuilder([p(0, 0), p(10, 0), p(10, 10)]).withClosed(
    true,
  );
  const result = builder.build();

  await t.assertSnapshot(result);
});

Deno.test("build() with empty points array", () => {
  const builder = new PathBuilder([]);

  assertThrows(
    () => builder.build(),
    Error,
    "Cannot read properties of undefined",
  );
});

Deno.test("getCyclic with single point", () => {
  const builder = new PathBuilder([p(5, 5)]);

  assertEquals(builder.getCyclic(0), p(5, 5));
  assertEquals(builder.getCyclic(1), p(5, 5));
  assertEquals(builder.getCyclic(-1), p(5, 5));
  assertEquals(builder.getCyclic(100), p(5, 5));
  assertEquals(builder.getCyclic(-100), p(5, 5));
});

Deno.test("push preserves existing points", () => {
  const points = [p(0, 0), p(10, 10)];
  const builder = new PathBuilder(points);
  builder.push(p(20, 20));

  assertEquals(points, [p(0, 0), p(10, 10), p(20, 20)]);
});

Deno.test("multiple push calls", () => {
  const builder = new PathBuilder([p(0, 0)]);
  builder.push(p(10, 10));
  builder.push(p(20, 20));
  builder.push(p(30, 30));

  assertEquals(builder.points, [p(0, 0), p(10, 10), p(20, 20), p(30, 30)]);
});
