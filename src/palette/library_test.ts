import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import { loadPalette } from "./library.ts";

const NEW_FORMAT = [
  "GIMP Palette",
  "Name: wet-tokyo",
  "Columns: 2",
  "11 19 38\tInk",
  "240 248 255\tPaper",
].join("\n");

const OLD_FORMAT = [
  "GIMP Palette",
  "255 87 51\tEmber",
  "79 129 189\tDusk",
].join("\n");

async function makeLibrary(files: Record<string, string>): Promise<string> {
  const dir = await Deno.makeTempDir({ prefix: "vormen-palettes-" });
  for (const [name, data] of Object.entries(files)) {
    await Deno.writeTextFile(`${dir}/${name}`, data);
  }
  return dir;
}

Deno.test("loadPalette loads a palette by its Name: header", async () => {
  const dir = await makeLibrary({ "wet-tokyo.gpl": NEW_FORMAT });
  try {
    const palette = await loadPalette("wet-tokyo", dir);
    assertEquals(palette.name, "wet-tokyo");
    assertEquals(palette.colors, ["#0b1326", "#f0f8ff"]);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("loadPalette falls back to the file basename for old-format files", async () => {
  const dir = await makeLibrary({ "retro.gpl": OLD_FORMAT });
  try {
    const palette = await loadPalette("retro", dir);
    assertEquals(palette.name, "retro");
    assertEquals(palette.colorNamed("Ember"), "#ff5733");
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("loadPalette ignores files that are not .gpl", async () => {
  const dir = await makeLibrary({
    "wet-tokyo.gpl": NEW_FORMAT,
    "notes.txt": "not a palette",
    "README.md": "# not a palette either",
  });
  try {
    const palette = await loadPalette("wet-tokyo", dir);
    assertEquals(palette.size, 2);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("loadPalette fails loudly on an unknown palette name", async () => {
  const dir = await makeLibrary({ "wet-tokyo.gpl": NEW_FORMAT });
  try {
    const error = await assertRejects(
      () => loadPalette("does-not-exist", dir),
      Error,
    );
    assertStringIncludes(error.message, 'Palette "does-not-exist" not found');
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("loadPalette fails loudly on duplicate palette names", async () => {
  const dir = await makeLibrary({
    "a.gpl": NEW_FORMAT,
    "b.gpl": NEW_FORMAT,
  });
  try {
    const error = await assertRejects(
      () => loadPalette("wet-tokyo", dir),
      Error,
    );
    assertStringIncludes(error.message, 'Duplicate palette name "wet-tokyo"');
    assertStringIncludes(error.message, '"a.gpl" and "b.gpl"');
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("loadPalette fails loudly when the library directory is missing", async () => {
  const error = await assertRejects(
    () => loadPalette("wet-tokyo", "/tmp/vormen-no-such-dir"),
    Error,
  );
  assertStringIncludes(error.message, "Palette library not found");
});

Deno.test("loadPalette loads the integration test fixtures from ./palettes", async () => {
  const here = new URL(".", import.meta.url).pathname;
  const dir = `${here}../../__tests__/integration/palettes/`;
  const wetTokyo = await loadPalette("wet-tokyo", dir);
  assertEquals(wetTokyo.size, 5);
  const retro = await loadPalette("retro", dir);
  assertEquals(retro.name, "retro");
  assertEquals(retro.colorNamed("Amber"), "#ffc300");
});
