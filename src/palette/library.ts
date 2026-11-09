/**
 * Palette library - Loading palettes from the user-managed `./palettes/`
 * directory.
 *
 * Part of the Palette module. The library is a directory of `.gpl` files in
 * the drawing project (same convention as `saves/`). Vormen only reads it,
 * never writes to it, and ships no palettes of its own. See ADR-0002.
 */
import { parseGpl } from "./gpl.ts";
import type { Palette } from "./palette.ts";

/**
 * The default palette library directory, relative to the drawing project.
 */
const DEFAULT_DIR = "./palettes";

/**
 * Load a palette by name from the palette library.
 *
 * Reads every `.gpl` file in the library directory, so it can fail loudly on
 * duplicate palette names. The palette name is the file's `Name:` header, or
 * the file basename (without `.gpl`) for old-format files without a `Name:`
 * line.
 *
 * @param name The palette name to load
 * @param dir The palette library directory, `./palettes` by default
 * @returns The palette
 */
export async function loadPalette(
  name: string,
  dir: string = DEFAULT_DIR,
): Promise<Palette> {
  const base = dir.replace(/\/+$/, "") || dir;
  let entries: Deno.DirEntry[];
  try {
    entries = [];
    for await (const entry of Deno.readDir(base)) {
      entries.push(entry);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(
        `Palette library not found: no directory "${dir}". Create it and add .gpl palette files to it.`,
      );
    }
    throw error;
  }

  const files = entries.filter(isGplFile).map((entry) => entry.name).sort();

  const palettes = await Promise.all(
    files.map(async (file) => {
      const data = await Deno.readTextFile(`${base}/${file}`);
      return parseGpl(data, file.replace(/\.gpl$/i, ""));
    }),
  );

  const fileOfName = new Map<string, string>();
  for (const [index, palette] of palettes.entries()) {
    const existing = fileOfName.get(palette.name);
    if (existing !== undefined) {
      throw new Error(
        `Duplicate palette name "${palette.name}" in "${dir}": "${existing}" and "${
          files[index]
        }"`,
      );
    }
    fileOfName.set(palette.name, files[index]);
  }

  const palette = palettes.find((candidate) => candidate.name === name);
  if (!palette) {
    throw new Error(`Palette "${name}" not found in "${dir}"`);
  }
  return palette;
}

function isGplFile(entry: Deno.DirEntry): boolean {
  return entry.isFile && entry.name.toLowerCase().endsWith(".gpl");
}
