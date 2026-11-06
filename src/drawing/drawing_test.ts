import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertNotStrictEquals,
  assertStringIncludes,
} from "@std/assert";
import { Circle, registerWindow } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import { Drawing, Margin, StandardSize } from "./drawing.ts";
import { CaptionBuilder } from "../metadata/caption.ts";
import { MetadataBuilder } from "../metadata/metadata.ts";
import { SvgFont } from "../typography/svg_font.ts";

/**
 * svg.js draws into a DOM, which does not exist outside the browser. svgdom
 * provides one, and hands back the SVG element to build into.
 */
function svgElement() {
  const window = createSVGWindow();
  registerWindow(window, window.document);
  return window.document.documentElement;
}

/**
 * Capture the warnings console.warn emits while fn runs.
 */
function captureWarnings(fn: () => void): string[] {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.join(" "));
  };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return warnings;
}

Deno.test("builder chains from the constructor", () => {
  const drawing = new Drawing(svgElement())
    .withStandardSize(StandardSize.A4)
    .withMargin(20)
    .withBackgroundColor("#eee");

  assertAlmostEquals(drawing.width, 753.70, 0.01); // 793.70 - 2 * 20
  assertAlmostEquals(drawing.height, 1082.52, 0.01); // 1122.52 - 2 * 20
});

Deno.test("withStandardSize() sets the drawing dimensions in user units", () => {
  const a3 = new Drawing(svgElement()).withStandardSize(StandardSize.A3);
  assertAlmostEquals(a3.outerWidth, 1122.52, 0.01); // 297mm
  assertAlmostEquals(a3.outerHeight, 1587.40, 0.01); // 420mm

  const a4 = new Drawing(svgElement()).withStandardSize(StandardSize.A4);
  assertAlmostEquals(a4.outerWidth, 793.70, 0.01); // 210mm
  assertAlmostEquals(a4.outerHeight, 1122.52, 0.01); // 297mm

  const a5 = new Drawing(svgElement()).withStandardSize(StandardSize.A5);
  assertAlmostEquals(a5.outerWidth, 559.37, 0.01); // 148mm
  assertAlmostEquals(a5.outerHeight, 793.70, 0.01); // 210mm
});

Deno.test("withSize() sets the drawing dimensions", () => {
  const drawing = new Drawing(svgElement()).withSize(300, 400);

  assertEquals(drawing.width, 300);
  assertEquals(drawing.height, 400);
});

Deno.test("with-methods return a distinct Drawing and leave the original unchanged", () => {
  const base = new Drawing(svgElement());

  const sized = base.withSize(300, 400);
  assertNotStrictEquals(sized, base);
  assertEquals(sized.width, 300);
  assertEquals(base.width, 0);

  const standard = base.withStandardSize(StandardSize.A4);
  assertNotStrictEquals(standard, base);
  assertAlmostEquals(standard.width, 793.70, 0.01);
  assertEquals(base.outerWidth, 0);

  const margined = sized.withMargin(20);
  assertNotStrictEquals(margined, sized);
  assertEquals(margined.width, 260);
  assertEquals(sized.width, 300);

  const withMarginInstance = sized.withMargin(new Margin(10, 20, 30, 40));
  assertNotStrictEquals(withMarginInstance, sized);
  assertEquals(withMarginInstance.width, 260); // 300 - 10 - 30
  assertEquals(sized.margin.isZero(), true);

  const withDefs = sized.withDefs([new Circle().radius(10).id("dot")]);
  assertNotStrictEquals(withDefs, sized);

  const colored = sized.withBackgroundColor("#eee");
  assertNotStrictEquals(colored, sized);
});

Deno.test("builder methods do not warn before build()", () => {
  const drawing = new Drawing(svgElement());

  const warnings = captureWarnings(() => {
    drawing.withSize(300, 400).withMargin(20).withBackgroundColor("#eee");
  });

  assertEquals(warnings, []);
});

Deno.test("builder methods warn once each after build()", () => {
  const drawing = new Drawing(svgElement()).withSize(300, 400);
  drawing.build();

  const warnings = captureWarnings(() => {
    drawing.withSize(100, 100);
    drawing.withStandardSize(StandardSize.A5);
    drawing.withMargin(20);
    drawing.withBackgroundColor("#eee");
    drawing.withDefs([]);
    drawing.withMetadata(new MetadataBuilder().build());
    drawing.withCaption(new CaptionBuilder().build());
  });

  assertEquals(warnings.length, 7);
  assertEquals(warnings[0], warnings[6]); // one generic message
});

Deno.test("build() locks the drawing it was called on, not its copies", () => {
  const drawing = new Drawing(svgElement()).withSize(300, 400);
  const branch = drawing.withMargin(20);

  drawing.build();

  const warnings = captureWarnings(() => {
    branch.withBackgroundColor("#eee");
  });
  assertEquals(warnings, []);

  const branchedAfterBuild = drawing.withMargin(40);
  const moreWarnings = captureWarnings(() => {
    branchedAfterBuild.withBackgroundColor("#eee");
  });
  assertEquals(moreWarnings, []);
});

Deno.test("withDefs() adds the given elements to a defs on build", () => {
  const circle = new Circle().radius(10).id("dot");

  const drawing = new Drawing(svgElement()).withSize(300, 400).withDefs([
    circle,
  ]);
  drawing.build();

  assertEquals(circle.node.parentNode?.nodeName, "defs");
  assertStringIncludes(drawing.svg(), "<defs");
  assertStringIncludes(drawing.svg(), 'id="dot"');
});

Deno.test("withDefs() replaces the previously set defs", () => {
  const first = new Circle().radius(10).id("first");
  const second = new Circle().radius(20).id("second");

  const drawing = new Drawing(svgElement()).withSize(300, 400).withDefs([
    first,
  ]).withDefs([second]);
  drawing.build();

  assertEquals(second.node.parentNode?.nodeName, "defs");
  assertStringIncludes(drawing.svg(), 'id="second"');
  assert(!drawing.svg().includes('id="first"'));
});

Deno.test("build adds no defs when none are set", () => {
  const drawing = new Drawing(svgElement()).withSize(300, 400);
  drawing.build();

  assert(!drawing.svg().includes("<defs"));
});

Deno.test("withSize() sizes the drawing and its viewBox", () => {
  const group = new Drawing(svgElement()).withSize(300, 400).build();
  const svg = group.root();

  assertEquals(svg.width(), 300);
  assertEquals(svg.height(), 400);
  assertEquals(svg.viewbox().toString(), "0 0 300 400");
});

Deno.test("withMargin() accepts a Margin", () => {
  const drawing = new Drawing(svgElement())
    .withSize(300, 400)
    .withMargin(new Margin(10, 20, 30, 40));

  assertEquals(drawing.width, 260); // 300 - 10 - 30
  assertEquals(drawing.height, 340); // 400 - 20 - 40
});

Deno.test("withMargin() offsets the margin group by the margin", () => {
  const group = new Drawing(svgElement())
    .withSize(300, 400)
    .withMargin(new Margin(10, 20, 30, 40))
    .build();

  assertStringIncludes(group.svg(), "matrix(1,0,0,1,10,20)");
});

Deno.test("withBackground() adds a background covering the whole page", () => {
  const group = new Drawing(svgElement())
    .withSize(300, 400)
    .withMargin(20)
    .withBackgroundColor("#eee")
    .build();

  const background = group.root().findOne("#background")?.svg() ?? "";
  assertStringIncludes(background, 'width="300"');
  assertStringIncludes(background, 'height="400"');
  assertStringIncludes(background, 'fill="#eeeeee"');
});

Deno.test("withBackground() defaults to a transparent background", () => {
  const group = new Drawing(svgElement()).withSize(300, 400).build();

  const background = group.root().findOne("#background");
  assertStringIncludes(background?.svg() ?? "", 'fill="transparent"');
});

Deno.test("build renders shapes added to the group", () => {
  const group = new Drawing(svgElement()).withSize(300, 400).build();

  group.rect(10, 20).move(5, 5);

  assertStringIncludes(group.root().svg(), '<rect width="10" height="20"');
});

Deno.test("build returns the margin group", () => {
  const group = new Drawing(svgElement()).withSize(300, 400).build();

  assertEquals(group.node.nodeName, "g");
  assertEquals(group.id(), "margin_group");
});

Deno.test("build draws into the given element", () => {
  const element = svgElement();

  const group = new Drawing(element).withSize(300, 400).build();

  assertEquals(group.root().node, element);
});

Deno.test("svg() renders the full SVG", () => {
  const drawing = new Drawing(svgElement()).withSize(300, 400);
  const _group = drawing.build();

  assertStringIncludes(drawing.svg(), "<svg ");
  assertStringIncludes(drawing.svg(), "</svg>");
});

Deno.test("element is created if not passed in", () => {
  const group = new Drawing().withSize(300, 400).build();

  assertEquals(group.root().node.nodeName, "svg");
});

function testMetadata() {
  return new MetadataBuilder()
    .title("Sunset Study")
    .description("A generative sunset")
    .author("Ada Lovelace")
    .copyright("Copyright 2026 Ada Lovelace")
    .date(new Date("2026-11-04T10:00:00.000Z"))
    .url("https://example.com/sunset")
    .license("https://creativecommons.org/licenses/by/4.0/")
    .keywords(["generative", "sunset"])
    .settings({ seed: "abc", iterations: 8 })
    .build();
}

Deno.test("withMetadata() and withCaption() return a distinct Drawing and leave the original unchanged", () => {
  const base = new Drawing(svgElement()).withSize(300, 400);
  const metadata = testMetadata();
  const caption = new CaptionBuilder().build();

  const withMetadata = base.withMetadata(metadata);
  assertNotStrictEquals(withMetadata, base);
  assertEquals(withMetadata.metadata, metadata);
  assertEquals(base.metadata, null);

  const withCaption = withMetadata.withCaption(caption);
  assertNotStrictEquals(withCaption, withMetadata);
  assertEquals(withCaption.caption, caption);
  assertEquals(withMetadata.caption, null);
});

Deno.test("build() serializes the metadata into the SVG without altering the drawing geometry", async (t) => {
  const drawing = new Drawing(svgElement())
    .withSize(300, 400)
    .withMargin(20)
    .withMetadata(testMetadata());
  const group = drawing.build();
  group.rect(10, 20).move(5, 5);

  await t.assertSnapshot(drawing.svg());
});

Deno.test("build() adds no metadata elements when no metadata is set", () => {
  const drawing = new Drawing(svgElement()).withSize(300, 400);
  drawing.build();

  const out = drawing.svg();
  assert(!out.includes("<title>"), out);
  assert(!out.includes("<desc>"), out);
  assert(!out.includes("<metadata>"), out);
  assert(!out.includes("metadata_caption"), out);
});

Deno.test("build() renders the caption in the margin", async (t) => {
  const drawing = new Drawing(svgElement())
    .withSize(300, 400)
    .withMargin(20)
    .withMetadata(testMetadata())
    .withCaption(new CaptionBuilder().build());
  drawing.build();

  // lineHeight 20 (EMSTech ratio 2 at fontSize 10) fits in the 20 margin: no expansion.
  await t.assertSnapshot(drawing.svg());
});

Deno.test("build() renders no caption when the template resolves to empty text", async (t) => {
  const drawing = new Drawing(svgElement())
    .withSize(300, 400)
    .withCaption(new CaptionBuilder().template("{title}").build());
  drawing.build();

  const out = drawing.svg();
  assert(!out.includes("metadata_caption"), out);
  await t.assertSnapshot(out);
});

Deno.test("build() renders the caption from the metadata settings", () => {
  const drawing = new Drawing(svgElement())
    .withSize(300, 400)
    .withMargin(20)
    .withMetadata(new MetadataBuilder().settings({ seed: "xyz-123" }).build())
    .withCaption(new CaptionBuilder().template("seed: {seed}").build());
  drawing.build();

  // The caption is plottable: its content appears as per-glyph path data in
  // the caption group, not as a text element.
  const placed = SvgFont.named("EMSTech").place(
    "seed: xyz-123",
    10,
  );
  const out = drawing.svg();
  for (const glyph of placed.glyphs) {
    assertStringIncludes(out, `d="${glyph.d}"`);
  }
  assert(!out.includes("<text"), out);
});
