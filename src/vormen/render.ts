/**
 * Render module for Vormen drawings.
 *
 * This module provides the rendering functionality for the Vormen library.
 */

import type { Drawing } from "../drawing/drawing.ts";
import type { Settings } from "../settings/settings.ts";

/**
 * Generate default output filename in format: saves/[drawingfilename]-[iso-date-time-with-seconds].svg
 */
function defaultOutfile(): string {
  try {
    const mainModule = Deno.mainModule;
    const pathname = new URL(mainModule).pathname;
    const basename = pathname.split("/").pop() || "drawing";
    const filename = basename.replace(/\.[^.]+$/, "");

    const now = new Date();
    const timestamp =
      now.toISOString().replace(/T/, "-").replace(/:/g, "-").split(".")[0];

    return `saves/${filename}-${timestamp}.svg`;
  } catch {
    const now = new Date();
    const timestamp =
      now.toISOString().replace(/T/, "-").replace(/:/g, "-").split(".")[0];
    return `saves/drawing-${timestamp}.svg`;
  }
}

/**
 * Write SVG to output.
 * If outfile is '-' or undefined, write to stdout.
 * Otherwise, write to the specified file.
 */
async function writeSvg(svg: string, outfile: string): Promise<void> {
  const dir = outfile.split("/").slice(0, -1).join("/");
  if (dir) {
    await Deno.mkdir(dir, { recursive: true });
  }
  await Deno.writeTextFile(outfile, svg);
}

/**
 * Main render function - invoke the factory and write the SVG.
 */
export async function render(
  draw: (settings: Settings) => Drawing,
  settings: Settings,
  outfile?: string,
): Promise<void> {
  const drawing = draw(settings);
  const svg = drawing.svg();

  if (outfile === "-") {
    console.log(svg);
  } else {
    const finalOutfile = outfile || defaultOutfile();
    await writeSvg(svg, finalOutfile);
  }
}
