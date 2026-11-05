import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import { SvgFont } from "./svg_font.ts";
import { TextBuilder } from "./text.ts";

/**
 * svg.js draws into a DOM, which does not exist outside the browser. svgdom
 * provides one, and hands back the SVG element to build into.
 */
function svgElement() {
  const window = createSVGWindow();
  registerWindow(window, window.document);
  return window.document.documentElement;
}

Deno.test("TextBuilder builds a Text with defaults", () => {
  const text = new TextBuilder().build();

  assertEquals(text.content, "");
  assertEquals(text.font, SvgFont.named("EMSTech"));
  assertEquals(text.size, 10);
  assertEquals(text.x, 0);
  assertEquals(text.y, 0);
  assertEquals(text.color, "#000");
  assertEquals(text.strokeWidth, 1);
  assertEquals(text.letterSpacing, 0);
});

Deno.test("TextBuilder methods are chainable and set each attribute", () => {
  const builder = new TextBuilder();
  assertEquals(builder.content("hi"), builder);

  const text = builder
    .content("Hello")
    .font(SvgFont.named("EMSAllure"))
    .size(20)
    .x(5)
    .y(50)
    .color("#ff0000")
    .strokeWidth(0.5)
    .letterSpacing(2)
    .build();

  assertEquals(text.content, "Hello");
  assertEquals(text.font, SvgFont.named("EMSAllure"));
  assertEquals(text.size, 20);
  assertEquals(text.x, 5);
  assertEquals(text.y, 50);
  assertEquals(text.color, "#ff0000");
  assertEquals(text.strokeWidth, 0.5);
  assertEquals(text.letterSpacing, 2);
});

Deno.test("Text derives its metrics from the font", () => {
  const tech = SvgFont.named("EMSTech");
  const text = new TextBuilder().content("Hi").size(21).build();

  assertEquals(text.width, tech.measure("Hi", 21));
  assertEquals(text.ascent, 21);
  // EMSTech: ascent 800, descent -200, cap height 500 font units -> ratio 2.
  assertEquals(text.height, 21 * 2);
  assertEquals(text.descent, 21 * 2 - 21);
});

Deno.test("Text.place matches the font's layout", () => {
  const text = new TextBuilder().content("AB").size(11).letterSpacing(1)
    .build();
  const tech = SvgFont.named("EMSTech");
  assertEquals(text.place(), tech.place("AB", 11, 1));
});

Deno.test("addTo adds one stroked, unfilled path per glyph in a translated group", () => {
  const svg = SVG(svgElement());
  const canvas = svg.group();
  const text = new TextBuilder()
    .content("AV")
    .size(20)
    .x(7)
    .y(42)
    .color("#123456")
    .strokeWidth(0.7)
    .build();

  const group = text.addTo(canvas).id("my-text");

  const out = svg.svg();
  assertStringIncludes(
    out,
    '<g transform="matrix(1,0,0,1,7,42)" id="my-text">',
  );
  // One path per glyph, carrying the font's own path data and a
  // translate/scale transform. SVG fonts are y-up: baseline 0, negative
  // scaleY flips the font units into SVG's y-down.
  const { glyphs, scale } = text.place();
  assertEquals(glyphs.length, 2); // A and V
  assert(glyphs[1].x > glyphs[0].x, "expected the V placed after the A");
  for (const glyph of glyphs) {
    assertStringIncludes(out, `d="${glyph.d}"`);
    assertStringIncludes(
      out,
      `transform="translate(${glyph.x} 0) scale(${scale} ${-scale})"`,
    );
  }
  assertStringIncludes(out, 'fill="none"');
  assertStringIncludes(out, 'stroke="#123456"');
  // The glyph transform scales the path, so the stroke-width is pre-divided
  // by the scale: effective width = 0.7 user units at any size.
  assertStringIncludes(out, `stroke-width="${0.7 / scale}"`);
  // The group is the added element.
  assertEquals(group, canvas.children()[0]);
});

Deno.test("stroke width is not scaled by the glyph transform (illegibility regression)", () => {
  const svg = SVG(svgElement());
  const canvas = svg.group();
  // size 100 -> scale 0.2; without the fix the path would render at width 0.2.
  const text = new TextBuilder().content("A").size(100).strokeWidth(1).build();
  text.addTo(canvas);

  const out = svg.svg();
  const { scale } = text.place();
  assertEquals(scale, 0.2);
  assertStringIncludes(out, `stroke-width="${1 / scale}"`); // 5, effective 1
  assert(!out.includes("vector-effect"), out);
});

Deno.test("addTo with empty content adds a group without a path", () => {
  const svg = SVG(svgElement());
  const canvas = svg.group();
  new TextBuilder().content("").build().addTo(canvas);

  const out = svg.svg();
  assert(!out.includes("<path"), out);
});
