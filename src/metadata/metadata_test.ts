import { assert, assertEquals } from "@std/assert";
import { registerWindow, SVG, Svg } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import { appendMetadata, type Metadata, MetadataBuilder } from "./metadata.ts";

/**
 * svg.js draws into a DOM, which does not exist outside the browser. svgdom
 * provides one, and hands back the SVG element to build into.
 */
function svgElement() {
  const window = createSVGWindow();
  registerWindow(window, window.document);
  return window.document.documentElement;
}

function fullMetadata(): Metadata {
  return new MetadataBuilder()
    .title("Sunset Study")
    .description("A generative sunset & <stars>")
    .author("Ada Lovelace")
    .copyright("Copyright 2026 Ada Lovelace")
    .date(new Date("2026-11-04T10:00:00.000Z"))
    .url("https://example.com/sunset")
    .license("https://creativecommons.org/licenses/by/4.0/")
    .keywords(["generative", "sunset"])
    .settings({ seed: "abc", iterations: 8 })
    .build();
}

Deno.test("MetadataBuilder builds an empty Metadata by default", () => {
  const metadata = new MetadataBuilder().build();

  assertEquals(metadata.title, "");
  assertEquals(metadata.description, "");
  assertEquals(metadata.author, "");
  assertEquals(metadata.copyright, "");
  assertEquals(metadata.date, null);
  assertEquals(metadata.url, "");
  assertEquals(metadata.license, "");
  assertEquals(metadata.keywords, []);
  assertEquals(metadata.settings, null);
});

Deno.test("MetadataBuilder methods are chainable and set each field", () => {
  const builder = new MetadataBuilder();
  const date = new Date("2026-01-02T03:04:05.000Z");

  assertEquals(builder.title("T"), builder);
  builder
    .description("D")
    .author("A")
    .copyright("C")
    .date(date)
    .url("U")
    .license("L")
    .keywords(["k1", "k2"])
    .settings({ seed: "s" });

  const metadata = builder.build();
  assertEquals(metadata.title, "T");
  assertEquals(metadata.description, "D");
  assertEquals(metadata.author, "A");
  assertEquals(metadata.copyright, "C");
  assertEquals(metadata.date, date);
  assertEquals(metadata.url, "U");
  assertEquals(metadata.license, "L");
  assertEquals(metadata.keywords, ["k1", "k2"]);
  assertEquals(metadata.settings, { seed: "s" });
});

Deno.test("Metadata getters return copies of keywords and settings", () => {
  const metadata = fullMetadata();

  metadata.keywords.push("mutated");
  const settings = metadata.settings;
  assert(settings !== null);
  (settings as Record<string, string>).seed = "mutated";

  assertEquals(metadata.keywords, ["generative", "sunset"]);
  assertEquals(metadata.settings, { seed: "abc", iterations: 8 });
});

Deno.test("captionValues exposes metadata fields and settings as strings", () => {
  const values = fullMetadata().captionValues();

  assertEquals(values.title, "Sunset Study");
  assertEquals(values.description, "A generative sunset & <stars>");
  assertEquals(values.author, "Ada Lovelace");
  assertEquals(values.copyright, "Copyright 2026 Ada Lovelace");
  assertEquals(values.date, "2026-11-04");
  assertEquals(values.url, "https://example.com/sunset");
  assertEquals(values.license, "https://creativecommons.org/licenses/by/4.0/");
  assertEquals(values.keywords, "generative, sunset");
  assertEquals(values.seed, "abc");
  assertEquals(values.iterations, "8");
});

Deno.test("appendMetadata writes title, desc and an Inkscape-compatible RDF metadata block", async (t) => {
  const svg = SVG(svgElement());
  svg.size(100, 100);
  svg.rect(10, 10);

  appendMetadata(svg.node, fullMetadata());
  const out = svg.svg();

  const titleIndex = out.indexOf("<title>");
  const descIndex = out.indexOf("<desc>");
  const metadataIndex = out.indexOf("<metadata>");
  const rectIndex = out.indexOf("<rect");
  assert(
    titleIndex !== -1 && titleIndex < descIndex &&
      descIndex < metadataIndex && metadataIndex < rectIndex,
    `expected title, desc, metadata before the drawn content in: ${out}`,
  );
  await t.assertSnapshot(out);
});

Deno.test("appendMetadata writes a non-URL license as element text", () => {
  const svg = SVG(svgElement());
  appendMetadata(
    svg.node,
    new MetadataBuilder().license("All rights reserved").build(),
  );
  const out = svg.svg();

  assert(out.includes("<cc:license>All rights reserved</cc:license>"), out);
});

Deno.test("appendMetadata writes nothing for an empty Metadata", () => {
  const svg = SVG(svgElement());
  svg.rect(10, 10);

  appendMetadata(svg.node, new MetadataBuilder().build());
  const out = svg.svg();

  assert(!out.includes("<metadata"), out);
  assert(!out.includes("<title>"), out);
  assert(!out.includes("<desc>"), out);
});

Deno.test("appendMetadata writes only the fields that are set", async (t) => {
  const svg = SVG(svgElement());

  appendMetadata(svg.node, new MetadataBuilder().title("Only Title").build());
  await t.assertSnapshot(svg.svg());
});

Deno.test("appendMetadata writes the generator settings without other fields", async (t) => {
  const svg = SVG(svgElement());

  appendMetadata(
    svg.node,
    new MetadataBuilder().settings({ seed: "xyz" }).build(),
  );
  await t.assertSnapshot(svg.svg());
});

Deno.test("appendMetadata output is well-formed XML that parses back", () => {
  const svg = SVG(svgElement());
  svg.size(100, 100);
  appendMetadata(svg.node, fullMetadata());
  const out = svg.svg();

  const parsed = new Svg().svg(out).findOne("svg") as Svg;
  const title = parsed.findOne("title");
  assertEquals(title?.node.textContent, "Sunset Study");
  const dcTitles = parsed.node.getElementsByTagNameNS(
    "http://purl.org/dc/elements/1.1/",
    "title",
  );
  assertEquals(dcTitles.length, 1);
  assertEquals(dcTitles[0]?.textContent, "Sunset Study");
  const generators = parsed.node.getElementsByTagNameNS(
    "https://github.com/berkes/vormen",
    "generator",
  );
  assertEquals(generators.length, 1);
  assertEquals(
    generators[0]?.textContent,
    '{"settings":{"seed":"abc","iterations":8}}',
  );
});
