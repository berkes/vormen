import { Svg } from "@svgdotjs/svg.js";

/**
 * Reads an SVG file and returns the first <g> element found.
 * @param path The path to the SVG file.
 * @returns The first <g> element found in the SVG file.
 * @throws If no <g> element is found in the SVG file.
 */
export function readSvg(path: string): Svg {
  const text = Deno.readTextFileSync(path);
  const svg = new Svg().svg(text).findOne("svg") as Svg;
  return svg;
}
