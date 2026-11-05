/**
 * Integration test for metadata in drawings: the runner renders a drawing
 * that sets Metadata and a Caption, and the produced SVG embeds standard,
 * machine-readable metadata plus the printable caption.
 */
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { registerWindow, Svg } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import { SvgFont } from "@berkes/vormen";

const drawingPath = new URL(
  "drawings/metadata_drawing.ts",
  import.meta.url,
).pathname;
const cwd = new URL(".", import.meta.url).pathname;

// svg.js parses into a DOM, which needs a registered window (svgdom).
const window = createSVGWindow();
registerWindow(window, window.document);

async function render(extraArgs: string[] = []): Promise<string> {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      drawingPath,
      "render",
      "--outfile=-",
      ...extraArgs,
    ],
    cwd,
  });
  const { code, stdout, stderr } = await command.output();
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  return new TextDecoder().decode(stdout);
}

function generatorJson(svg: string): unknown {
  const parsed = new Svg().svg(svg).findOne("svg") as Svg;
  const generators = parsed.node.getElementsByTagNameNS(
    "https://github.com/berkes/vormen",
    "generator",
  );
  assertEquals(generators.length, 1, "expected one vormen:generator element");
  return JSON.parse(generators[0].textContent ?? "");
}

Deno.test("render embeds standard metadata readable by exiftool and Inkscape", async (t) => {
  const svg = await render();

  await t.assertSnapshot(svg);
});

Deno.test("render embeds the generator settings as JSON in the vormen namespace", async () => {
  const svg = await render();

  assertEquals(generatorJson(svg), {
    settings: { seed: "metadata-seed-42", iterations: 8, margin: 0 },
  });
});

Deno.test("render stores settings overrides in the embedded metadata", async () => {
  const svg = await render(["--setting.seed=override-99"]);

  assertEquals(generatorJson(svg), {
    settings: { seed: "override-99", iterations: 8, margin: 0 },
  });
  // The caption is plottable text: the overridden seed appears in the
  // caption's per-glyph path data, rendered with the default EMSTech font at
  // size 10.
  const caption = SvgFont.named("EMSTech").place(
    "Metadata Drawing — Vormen Tester — seed: override-99",
    10,
  );
  for (const glyph of caption.glyphs) {
    assertStringIncludes(svg, `d="${glyph.d}"`);
  }
});

Deno.test("render prints the caption and expands the viewBox when there is no margin", async (t) => {
  const svg = await render();

  // The 20 unit caption strip is added below the 300 high drawing, and the
  // artwork itself is untouched.
  await t.assertSnapshot(svg);
});

Deno.test("render keeps the viewBox when the margin fits the caption", async (t) => {
  const svg = await render(["--setting.margin=20"]);

  await t.assertSnapshot(svg);
});

Deno.test("rendered metadata SVG parses back as well-formed XML", async () => {
  const svg = await render();

  const parsed = new Svg().svg(svg).findOne("svg") as Svg;
  assertEquals(parsed.findOne("title")?.node.textContent, "Metadata Drawing");
  const dcCreators = parsed.node.getElementsByTagNameNS(
    "http://purl.org/dc/elements/1.1/",
    "creator",
  );
  assertEquals(dcCreators.length, 1);
  assertEquals(dcCreators[0]?.textContent, "Vormen Tester");
  assert(
    parsed.node.getElementsByTagNameNS(
      "http://creativecommons.org/ns#",
      "Work",
    ).length === 1,
  );
});
