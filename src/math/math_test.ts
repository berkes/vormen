import { assertEquals } from "@std/assert";
import { constrain } from "./math.ts";

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
