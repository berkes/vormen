import { assertEquals, assertThrows } from "@std/assert";
import { parseGpl } from "./gpl.ts";

Deno.test("parseGpl parses the new format: Name, Columns, comments, empty lines, named and unnamed colors", () => {
  const data = [
    "GIMP Palette",
    "Name: test-palette",
    "Columns: 4",
    "# a comment",
    "",
    "0 0 0\tBlack",
    "255 255 255 White",
    "255 0 0",
  ].join("\n");
  const palette = parseGpl(data, "fallback");
  assertEquals(palette.name, "test-palette");
  assertEquals(palette.size, 3);
  assertEquals(palette.colors, ["#000000", "#ffffff", "#ff0000"]);
  assertEquals(palette.colorNamed("Black"), "#000000");
});

Deno.test("parseGpl strips the palette name and color names", () => {
  const data = [
    "GIMP Palette",
    "Name:   spaced name  ",
    "10 20 30  My  Color ",
  ].join("\n");
  const palette = parseGpl(data, "fallback");
  assertEquals(palette.name, "spaced name");
  assertEquals(palette.colorNamed("My  Color"), "#0a141e");
});

Deno.test("parseGpl treats a file whose second line is not Name: as old format and uses the fallback name", () => {
  const data = [
    "GIMP Palette",
    "# old format: no Name: line",
    "255 87 51\tEmber",
    "79 129 189\tDusk",
  ].join("\n");
  const palette = parseGpl(data, "retro");
  assertEquals(palette.name, "retro");
  assertEquals(palette.colors, ["#ff5733", "#4f81bd"]);
});

Deno.test("parseGpl accepts a Columns: line without a Name: line only as a color line error in old format", () => {
  const data = ["GIMP Palette", "Columns: 4", "1 2 3"].join("\n");
  assertThrows(
    () => parseGpl(data, "fallback"),
    Error,
    'line 2 is not a color description: "Columns: 4"',
  );
});

Deno.test("parseGpl throws when the magic first line is missing", () => {
  assertThrows(
    () => parseGpl("Name: x\n1 2 3\n", "fallback"),
    Error,
    'first line must be "GIMP Palette"',
  );
  assertThrows(() => parseGpl("", "fallback"), Error, "GIMP Palette");
});

Deno.test("parseGpl throws on an empty Name: line", () => {
  assertThrows(
    () => parseGpl("GIMP Palette\nName:   \n1 2 3\n", "fallback"),
    Error,
    "Name: line is empty",
  );
});

Deno.test("parseGpl validates the Columns: value", () => {
  assertThrows(
    () => parseGpl("GIMP Palette\nName: x\nColumns: 256\n1 2 3\n", "f"),
    Error,
    "Columns: must be an integer between 0 and 255",
  );
  assertThrows(
    () => parseGpl("GIMP Palette\nName: x\nColumns: many\n1 2 3\n", "f"),
    Error,
    "Columns: must be an integer between 0 and 255",
  );
  // 0 and 255 are valid
  parseGpl("GIMP Palette\nName: x\nColumns: 0\n1 2 3\n", "f");
  parseGpl("GIMP Palette\nName: x\nColumns: 255\n1 2 3\n", "f");
});

Deno.test("parseGpl throws on color components outside 0-255", () => {
  for (const line of ["256 0 0", "255 0 256", "999 999 999"]) {
    assertThrows(
      () => parseGpl(`GIMP Palette\nName: x\n${line}\n`, "f"),
      Error,
      "outside 0-255",
    );
  }
});

Deno.test("parseGpl throws on invalid color lines", () => {
  const invalid = [
    "-1 0 0", // negative
    "1.5 0 0", // not an integer
    "red", // not numbers
    "1 2", // missing component
    "1 2 3Red", // name must be separated by whitespace
    "   ", // whitespace-only line is not an empty line
  ];
  for (const line of invalid) {
    assertThrows(
      () => parseGpl(`GIMP Palette\nName: x\n${line}\n`, "f"),
      Error,
      "not a color description",
    );
  }
});

Deno.test("parseGpl throws when the file has no colors", () => {
  assertThrows(
    () => parseGpl("GIMP Palette\nName: x\n# only a comment\n", "f"),
    Error,
    "no colors found",
  );
});

Deno.test("parseGpl handles CRLF line endings", () => {
  const palette = parseGpl("GIMP Palette\r\nName: crlf\r\n1 2 3\tInk\r\n", "f");
  assertEquals(palette.name, "crlf");
  assertEquals(palette.colorNamed("Ink"), "#010203");
});

const here = new URL(".", import.meta.url).pathname;
const fixturesDir = `${here}../../__tests__/integration/palettes/`;

Deno.test("parseGpl parses the wet-tokyo fixture (new format with Name: header)", async () => {
  const data = await Deno.readTextFile(`${fixturesDir}wet-tokyo.gpl`);
  const palette = parseGpl(data, "wet-tokyo");
  assertEquals(palette.name, "wet-tokyo");
  assertEquals(palette.size, 5);
  assertEquals(palette.colorNamed("Ink"), "#0b1326");
  assertEquals(palette.colorNamed("Paper"), "#f0f8ff");
  assertEquals(palette.colorAt(1), "#22304f");
});

Deno.test("parseGpl parses the retro fixture (old format, filename fallback)", async () => {
  const data = await Deno.readTextFile(`${fixturesDir}retro.gpl`);
  const palette = parseGpl(data, "retro");
  assertEquals(palette.name, "retro");
  assertEquals(palette.size, 4);
  assertEquals(palette.colorNamed("Ink"), "#ff5733");
});
