/**
 * Integration test for plottable text: the runner renders a drawing that
 * adds a Text element to the canvas, and the produced SVG contains the text
 * as pen-stroke paths (no <text> element), so a pen plotter can draw it.
 */
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { SvgFont } from "@berkes/vormen";

const drawingPath = new URL(
  "drawings/text_drawing.ts",
  import.meta.url,
).pathname;
const cwd = new URL(".", import.meta.url).pathname;

async function render(): Promise<string> {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      drawingPath,
      "render",
      "--outfile=-",
    ],
    cwd,
  });
  const { code, stdout, stderr } = await command.output();
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  return new TextDecoder().decode(stdout);
}

Deno.test("render draws Text as a stroked path group, not a text element", async (t) => {
  const svg = await render();

  // No SVG <text>: a plotter could not draw it.
  assert(!svg.includes("<text"), svg);

  // The text is one <path> per glyph inside a translated <g id="label">:
  // pen-up travel is an M move or a separate element, fill is none, stroke
  // carries the color.
  const placed = SvgFont.named("HersheySans1").place(
    "Plottable!",
    12,
  );
  assertStringIncludes(svg, '<g transform="matrix(1,0,0,1,10,80)" id="label">');
  assert(placed.glyphs.length > 1, "expected one path per glyph");
  for (const glyph of placed.glyphs) {
    assertStringIncludes(svg, `d="${glyph.d}"`);
  }
  assertStringIncludes(svg, 'fill="none"');
  assertStringIncludes(svg, 'stroke="#333333"'); // svg.js expands #333
  // The glyph transform scales the path, so stroke-width is pre-divided by
  // the scale: effective width 0.8 user units at any size.
  assertStringIncludes(svg, `stroke-width="${0.8 / placed.scale}"`);

  await t.assertSnapshot(svg);
});
