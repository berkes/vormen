/**
 * Render module for Vormen drawings.
 *
 * This module provides the rendering functionality for the Vormen library.
 */

import type { Drawing } from "../drawing/drawing.ts";
import type { Settings } from "../settings/settings.ts";
import type { VormenOptions } from "./types.ts";

/**
 * Write SVG to output.
 * If outfile is '-' or undefined, write to stdout.
 * Otherwise, write to the specified file.
 */
export async function writeSvg(svg: string, outfile?: string): Promise<void> {
  if (outfile === "-" || outfile === undefined) {
    console.log(svg);
  } else {
    await Deno.writeTextFile(outfile, svg);
  }
}

/**
 * Main render function - invoke the factory and write the SVG.
 */
export async function render(
  draw: (settings: Settings) => Drawing,
  settings: Settings,
  options: VormenOptions,
): Promise<void> {
  const drawing = draw(settings);
  const svg = drawing.svg();
  await writeSvg(svg, options.outfile);
}
