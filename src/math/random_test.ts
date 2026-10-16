import { assertEquals } from "@std/assert";
import { Random } from "./random.ts";
import { assertAlmostEquals } from "@std/assert/almost-equals";

/**
 * This tests Random. Which is a seeded, and therefore deterministic
 * randomizer. We can therefore test against known outcomes.
 */

const SEED = "123";

function rnd(): Random {
  return new Random(SEED);
}

Deno.test("Random between() with integers", () => {
  assertEquals(rnd().between(1, 10), 5);
});

Deno.test("Random between() with negative and positive integers", () => {
  assertEquals(rnd().between(-10, 10), 0);
});

Deno.test("Random between() with floats", () => {
  assertAlmostEquals(rnd().between(1.1, 10.1), 5.4211728);
});
