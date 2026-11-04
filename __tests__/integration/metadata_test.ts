/**
 * Integration test for metadata in drawings: the runner renders a drawing
 * that sets Metadata and a Caption, and the produced SVG embeds standard,
 * machine-readable metadata plus the printable caption.
 */
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { registerWindow, Svg } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";

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

Deno.test("render embeds standard metadata readable by exiftool and Inkscape", async () => {
  const svg = await render();

  assertStringIncludes(svg, "<title>Metadata Drawing</title>");
  assertStringIncludes(
    svg,
    "<desc>A drawing with embedded metadata and a caption</desc>",
  );
  assertStringIncludes(svg, "<metadata>");
  assertStringIncludes(svg, '<cc:Work rdf:about="">');
  assertStringIncludes(svg, "<dc:format>image/svg+xml</dc:format>");
  assertStringIncludes(svg, "<dc:title>Metadata Drawing</dc:title>");
  assertStringIncludes(svg, "<dc:creator>Vormen Tester</dc:creator>");
  assertStringIncludes(
    svg,
    "<dc:rights>Copyright 2026 Vormen Tester</dc:rights>",
  );
  assertStringIncludes(svg, "<dc:date>2026-11-04T10:00:00.000Z</dc:date>");
  assertStringIncludes(
    svg,
    "<dc:source>https://github.com/berkes/vormen</dc:source>",
  );
  assertStringIncludes(
    svg,
    '<cc:license rdf:resource="https://creativecommons.org/licenses/by/4.0/"></cc:license>',
  );
  assertStringIncludes(svg, "<rdf:li>generative</rdf:li>");
  assertStringIncludes(svg, "<rdf:li>metadata</rdf:li>");
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
  assertStringIncludes(svg, "seed: override-99");
});

Deno.test("render prints the caption and expands the viewBox when there is no margin", async () => {
  const svg = await render();

  assertStringIncludes(svg, 'id="metadata_caption"');
  assertStringIncludes(
    svg,
    "Metadata Drawing — Vormen Tester — seed: metadata-seed-42",
  );
  assertStringIncludes(svg, 'text-anchor="end"');
  // The 12.5 unit caption strip is added below the 300 high drawing.
  assertStringIncludes(svg, 'viewBox="0 0 400 312.5"');
  assertStringIncludes(svg, 'height="312.5"');
  // The artwork itself is untouched.
  assertStringIncludes(svg, 'id="the-rect"');
  assertStringIncludes(svg, "matrix(1,0,0,1,0,0)");
});

Deno.test("render keeps the viewBox when the margin fits the caption", async () => {
  const svg = await render(["--setting.margin=20"]);

  assertStringIncludes(svg, 'viewBox="0 0 400 300"');
  assertStringIncludes(svg, 'height="300"');
  assertStringIncludes(svg, 'id="metadata_caption"');
  assertStringIncludes(svg, "matrix(1,0,0,1,20,20)");
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
