import {
  assertAlmostEquals,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import { registerWindow } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import { Drawing, Margin, StandardSize } from "./drawing.ts";

/**
 * svg.js draws into a DOM, which does not exist outside the browser. svgdom
 * provides one, and hands back the SVG element to build into.
 */
function svgElement() {
  const window = createSVGWindow();
  registerWindow(window, window.document);
  return window.document.documentElement;
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
