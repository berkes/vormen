import { assertAlmostEquals, assertEquals } from "@std/assert";
import { almostEqual, constrain, map } from "./math.ts";

Deno.test("constrain ints within", () => {
  assertEquals(constrain(10, 1, 100), 10);
});
Deno.test("constrain ints border", () => {
  assertEquals(constrain(1, 1, 100), 1);
  assertEquals(constrain(100, 1, 100), 100);
});
Deno.test("constrain ints outside", () => {
  assertEquals(constrain(0, 1, 100), 1);
  assertEquals(constrain(101, 1, 100), 100);
});

Deno.test("constrain floats within", () => {
  assertEquals(constrain(10.5, 1, 100), 10.5);
});
Deno.test("constrain floats border", () => {
  assertEquals(constrain(1.0, 1, 100), 1.0);
  assertEquals(constrain(100.0, 1, 100), 100.0);
});
Deno.test("constrain floats outside", () => {
  assertEquals(constrain(0.0, 1, 100), 1.0);
  assertEquals(constrain(101.0, 1, 100), 100.0);
});

Deno.test("map ints within", () => {
  assertEquals(map(10, 1, 10, 1, 100), 100);
});
Deno.test("map ints border", () => {
  assertEquals(map(1, 1, 10, 1, 100), 1);
  assertEquals(map(10, 1, 10, 1, 100), 100);
});
Deno.test("map ints outside", () => {
  assertEquals(map(0, 1, 10, 1, 100), -10);
  assertEquals(map(11, 1, 10, 1, 100), 111);
});
Deno.test("map float within", () => {
  assertAlmostEquals(map(5.5, 0, 10, 0, 100), 55.0, 0.1);
});

Deno.test("almostEqual with default epsilon (0.001)", () => {
  assertEquals(almostEqual(1.0, 1.0), true);
  assertEquals(almostEqual(1.0, 1.0000000001), true);
  assertEquals(almostEqual(1.0, 1.01), false);
});

Deno.test("almostEqual with custom epsilon", () => {
  assertEquals(almostEqual(1.0, 1.0, 0.00000001), true);
  assertEquals(almostEqual(1.0, 1.00000001, 0.00000001), true);
  assertEquals(almostEqual(1.0, 1.0000001, 0.00000001), false);
});
