import { assertEquals, assertThrows } from "@std/assert";
import { Palette } from "./palette.ts";
import { Scheme } from "./scheme.ts";

function palette(): Palette {
  return new Palette("test", [
    { color: "#0b1326", name: "Ink" },
    { color: "#22304f", name: "Rain" },
    { color: "#f0f8ff", name: "Paper" },
  ]);
}

Deno.test("Scheme maps roles to colors by name and by index", () => {
  const scheme = new Scheme(palette(), {
    bg: "Ink",
    main: 1,
    accent: "Paper",
  });
  assertEquals(scheme.get("bg"), "#0b1326");
  assertEquals(scheme.get("main"), "#22304f");
  assertEquals(scheme.get("accent"), "#f0f8ff");
  assertEquals(scheme.palette.name, "test");
  assertEquals(scheme.roles(), ["bg", "main", "accent"]);
  assertEquals(scheme.has("bg"), true);
  assertEquals(scheme.has("nope"), false);
});

Deno.test("Scheme get throws on unknown roles", () => {
  const scheme = new Scheme(palette(), { bg: 0 });
  assertThrows(() => scheme.get("fg"), Error, 'no role "fg"');
});

Deno.test("Scheme constructor throws on unknown color names or indexes", () => {
  assertThrows(
    () => new Scheme(palette(), { bg: "Nope" }),
    Error,
    'no color named "Nope"',
  );
  assertThrows(
    () => new Scheme(palette(), { bg: 99 }),
    Error,
    "no color at index 99",
  );
});
