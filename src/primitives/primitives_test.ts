/**
 * Unit tests for Point and Vector primitives.
 */
import { Point, Vector } from "./point.ts";
import { assert, assertEquals, assertThrows } from "@std/assert";

Deno.test("Point.to() creates vector from this point to other", () => {
  const a = new Point(1, 2);
  const b = new Point(4, 6);
  const vec = a.to(b);
  assertEquals(vec.x, 3);
  assertEquals(vec.y, 4);
});

Deno.test("Point.add() offsets point by vector", () => {
  const p = new Point(1, 2);
  const v = new Vector(3, 4);
  const result = p.add(v);
  assertEquals(result.x, 4);
  assertEquals(result.y, 6);
});

Deno.test("Point.equals() checks equality", () => {
  const a = new Point(1, 2);
  const b = new Point(1, 2);
  const c = new Point(2, 3);
  assert(a.equals(b));
  assert(!a.equals(c));
});

Deno.test("Point.toString() returns formatted string", () => {
  const p = new Point(3, 4);
  assertEquals(p.toString(), "(3, 4)");
});

Deno.test("Point.pointAtDistanceTowards() - basic case", () => {
  const start = new Point(0, 0);
  const end = new Point(0, 10);
  const result = start.pointAtDistanceTowards(end, 5);
  assertEquals(result.x, 0);
  assertEquals(result.y, 5);
});

Deno.test("Point.pointAtDistanceTowards() - diagonal line", () => {
  const start = new Point(0, 0);
  const end = new Point(3, 4); // hypotenuse = 5
  const result = start.pointAtDistanceTowards(end, 2.5);
  // Vector from start to end is (3,4), normalized is (0.6, 0.8)
  // Scaled by 2.5: (1.5, 2.0)
  assertEquals(result.x, 1.5);
  assertEquals(result.y, 2.0);
});

Deno.test("Point.pointAtDistanceTowards() - example from docs", () => {
  // Example: point at distance L from end point b towards point a
  // This is: b.pointAtDistanceTowards(a, L)
  const a = new Point(0, 0);
  const b = new Point(10, 0);
  const L = 3;
  const result = b.pointAtDistanceTowards(a, L);
  assertEquals(result.x, 7);
  assertEquals(result.y, 0);
});

Deno.test("Point.pointAtDistanceTowards() - throws on degenerate line", () => {
  const a = new Point(5, 5);
  assertThrows(
    () => a.pointAtDistanceTowards(a, 10),
    Error,
    "Cannot calculate direction: start and end are the same point",
  );
});

Deno.test("Point.pointAtDistanceTowards() - distance of 0", () => {
  const a = new Point(0, 0);
  const b = new Point(10, 10);
  const result = a.pointAtDistanceTowards(b, 0);
  assertEquals(result.x, 0);
  assertEquals(result.y, 0);
});

Deno.test("Vector.length - simple case", () => {
  const v = new Vector(3, 4);
  assertEquals(v.length, 5);
});

Deno.test("Vector.length - zero vector", () => {
  const v = new Vector(0, 0);
  assertEquals(v.length, 0);
});

Deno.test("Vector.length - negative components", () => {
  const v = new Vector(-3, -4);
  assertEquals(v.length, 5);
});

Deno.test("Vector.normalized - simple case", () => {
  const v = new Vector(3, 4);
  const normalized = v.normalized;
  assertEquals(normalized.x, 0.6);
  assertEquals(normalized.y, 0.8);
  assertEquals(normalized.length, 1);
});

Deno.test("Vector.normalized - throws on zero vector", () => {
  const v = new Vector(0, 0);
  assertThrows(
    () => v.normalized,
    Error,
    "Cannot normalize the zero vector",
  );
});

Deno.test("Vector.scale() - positive scale", () => {
  const v = new Vector(1, 2);
  const scaled = v.scale(3);
  assertEquals(scaled.x, 3);
  assertEquals(scaled.y, 6);
});

Deno.test("Vector.scale() - negative scale", () => {
  const v = new Vector(1, 2);
  const scaled = v.scale(-2);
  assertEquals(scaled.x, -2);
  assertEquals(scaled.y, -4);
});

Deno.test("Vector.negate() - basic case", () => {
  const v = new Vector(3, 4);
  const negated = v.negate();
  assertEquals(negated.x, -3);
  assertEquals(negated.y, -4);
});

Deno.test("Vector.static lerp()", () => {
  const a = new Vector(0, 0);
  const b = new Vector(10, 10);
  const result = Vector.lerp(a, b, 0.5);
  assertEquals(result.x, 5);
  assertEquals(result.y, 5);
});

Deno.test("Vector.dist() - distance between vectors", () => {
  const a = new Vector(0, 0);
  const b = new Vector(3, 4);
  assertEquals(a.dist(b), 5);
});

Deno.test("Vector.distX() - horizontal distance", () => {
  const a = new Vector(1, 5);
  const b = new Vector(4, 5);
  assertEquals(a.distX(b), 3);
});

Deno.test("Vector.distY() - vertical distance", () => {
  const a = new Vector(5, 1);
  const b = new Vector(5, 4);
  assertEquals(a.distY(b), 3);
});

Deno.test("Chained operations: pointAtDistanceFromEnd example", () => {
  // This demonstrates the example from the documentation:
  // const back = a.to(b).normalized.scale(l).negate();
  // return b.add(back);
  const a = new Point(0, 0);
  const b = new Point(10, 0);
  const l = 3;

  // Manual calculation using chained operations
  const back = a.to(b).normalized.scale(l).negate();
  const result = b.add(back);

  assertEquals(result.x, 7);
  assertEquals(result.y, 0);

  // This should be equivalent to b.pointAtDistanceTowards(a, l)
  const result2 = b.pointAtDistanceTowards(a, l);
  assertEquals(result.x, result2.x);
  assertEquals(result.y, result2.y);
});
