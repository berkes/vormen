/**
 * `.gpl` parser - GIMP Palette (version 2) files.
 *
 * Implementation detail of the Palette module, behind the public API
 * (`loadPalette`): swapping it later is invisible to drawings. Implements the
 * official specification: https://developer.gimp.org/core/standards/gpl/
 *
 * - The first line MUST be `GIMP Palette`.
 * - If the second line starts with `Name:`, the rest of the line (stripped) is
 *   the palette name. Optionally, the next line may start with `Columns:`,
 *   followed by an integer between 0 and 255 (cosmetic, ignored).
 * - Otherwise the file is in the old format: colors start at the second line
 *   and the palette name is the file basename, passed in as `fallbackName`.
 * - Body lines: `#` comments and totally empty lines are ignored; any other
 *   line is a color description `r g b` (integers 0-255) followed by an
 *   optional color name (rest of the line, stripped).
 */
import { Palette, type PaletteColor } from "./palette.ts";

const MAGIC = "GIMP Palette";
const NAME_PREFIX = "Name:";
const COLUMNS_PREFIX = "Columns:";

/**
 * Parse `.gpl` file contents into a Palette.
 *
 * @param data The raw file contents
 * @param fallbackName Palette name for old-format files (no `Name:` line):
 * the file basename
 * @returns The parsed palette
 */
export function parseGpl(data: string, fallbackName: string): Palette {
  const lines = data.split("\n").map((line) =>
    line.endsWith("\r") ? line.slice(0, -1) : line
  );
  if (lines[0] !== MAGIC) {
    throw new Error(`Invalid .gpl file: first line must be "${MAGIC}"`);
  }

  let name: string;
  let start: number;
  if (lines.length > 1 && lines[1].startsWith(NAME_PREFIX)) {
    name = lines[1].slice(NAME_PREFIX.length).trim();
    if (name === "") {
      throw new Error("Invalid .gpl file: the Name: line is empty");
    }
    start = 2;
    if (lines.length > 2 && lines[2].startsWith(COLUMNS_PREFIX)) {
      const columns = lines[2].slice(COLUMNS_PREFIX.length).trim();
      if (!/^\d+$/.test(columns) || Number(columns) > 255) {
        throw new Error(
          `Invalid .gpl file: Columns: must be an integer between 0 and 255, got "${columns}"`,
        );
      }
      start = 3;
    }
  } else {
    name = fallbackName;
    start = 1;
  }

  const colors: PaletteColor[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    colors.push(parseColorLine(line, i + 1));
  }
  if (colors.length === 0) {
    throw new Error("Invalid .gpl file: no colors found");
  }
  return new Palette(name, colors);
}

/**
 * Parse one color description line: `r g b` plus an optional color name.
 */
function parseColorLine(line: string, lineNumber: number): PaletteColor {
  const match = line.trimStart().match(/^(\d+)\s+(\d+)\s+(\d+)(?:\s+(.*))?$/);
  if (!match) {
    throw new Error(
      `Invalid .gpl file: line ${lineNumber} is not a color description: "${line}"`,
    );
  }
  const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (r > 255 || g > 255 || b > 255) {
    throw new Error(
      `Invalid .gpl file: line ${lineNumber} has a color component outside 0-255: "${line}"`,
    );
  }
  const name = match[4]?.trim();
  const color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return name ? { color, name } : { color };
}

function toHex(component: number): string {
  return component.toString(16).padStart(2, "0");
}
