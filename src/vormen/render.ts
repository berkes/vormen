/**
 * Render module for Vormen drawings.
 *
 * This module provides the rendering functionality for the Vormen library.
 */

import type { Drawing } from "../drawing/drawing.ts";
import type { Settings } from "../settings/settings.ts";

/**
 * Write SVG to output.
 * If outfile is '-' or undefined, write to stdout.
 * Otherwise, write to the specified file.
 */
export async function writeSvg(svg: string, outfile: string): Promise<void> {
  await Deno.writeTextFile(outfile, svg);
}

/**
 * Main render function - invoke the factory and write the SVG.
 */
export async function render(
  draw: (settings: Settings) => Drawing,
  settings: Settings,
  outfile: string,
): Promise<void> {
  const drawing = draw(settings);
  const svg = drawing.svg();

  if (outfile === "-") {
    console.log(svg);
  } else {
    await writeSvg(svg, outfile);
  }
}
