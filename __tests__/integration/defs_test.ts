/**
 * Integration test for definition elements: elements set with withDefs() end
 * up in the <defs> of the built SVG, where shapes in the drawing area can
 * reference them.
 */
import { assert, assertStringIncludes } from "@std/assert";
import { Drawing, StandardSize } from "@berkes/vormen";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";

/**
 * svg.js draws into a DOM, which does not exist outside the browser. svgdom
 * provides one, and hands back the SVG element to build into.
 */
function svgElement() {
  const window = createSVGWindow();
  registerWindow(window, window.document);
  return window.document.documentElement;
}

Deno.test("Drawing renders defs that drawn shapes reference", () => {
  const element = svgElement();

  const gradient = SVG().gradient("linear", (g) => {
    g.stop(0, "#ff0000");
    g.stop(1, "#0000ff");
  }).id("my-gradient");

  const drawing = new Drawing(element)
    .withStandardSize(StandardSize.A4)
    .withMargin(20)
    .withDefs([gradient]);

  const canvas = drawing.build();
  canvas.rect(100, 100).move(10, 10).fill(gradient);

  const svg = drawing.svg();
  assertStringIncludes(svg, "<defs");
  assertStringIncludes(svg, 'id="my-gradient"');
  assertStringIncludes(svg, 'fill="url(#my-gradient)"');
  // The gradient sits inside the defs, not in the drawing area
  assert(gradient.node.parentNode?.nodeName === "defs");
});
