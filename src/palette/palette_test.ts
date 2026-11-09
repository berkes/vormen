import { assertEquals, assertThrows } from "@std/assert";
import { Palette } from "./palette.ts";

function palette(): Palette {
  return new Palette("test", [
    { color: "#000000", name: "Black" },
    { color: "#ff0000" },
    { color: "#00ff00", name: "Green" },
  ]);
}

Deno.test("Palette exposes name, size and colors in order", () => {
  const p = palette();
  assertEquals(p.name, "test");
  assertEquals(p.size, 3);
  assertEquals(p.colors, ["#000000", "#ff0000", "#00ff00"]);
});

Deno.test("Palette constructor throws on an empty name or no colors", () => {
  assertThrows(() => new Palette("", [{ color: "#000000" }]), Error, "name");
  assertThrows(() => new Palette("test", []), Error, "at least one color");
});

Deno.test("Palette colorAt returns colors by index and throws out of range", () => {
  const p = palette();
  assertEquals(p.colorAt(0), "#000000");
  assertEquals(p.colorAt(2), "#00ff00");
  assertThrows(() => p.colorAt(3), Error, "no color at index 3");
  assertThrows(() => p.colorAt(-1), Error, "no color at index -1");
  assertThrows(() => p.colorAt(1.5), Error, "no color at index 1.5");
});

Deno.test("Palette colorNamed returns colors by name and throws on unknown names", () => {
  const p = palette();
  assertEquals(p.colorNamed("Black"), "#000000");
  assertEquals(p.colorNamed("Green"), "#00ff00");
  assertThrows(() => p.colorNamed("White"), Error, 'no color named "White"');
});
