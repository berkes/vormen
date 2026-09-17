import { assertEquals, assertStringIncludes } from "@std/assert";
import { registerWindow } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import {
  A4_HEIGHT_USER_UNITS,
  A4_WIDTH_USER_UNITS,
  Drawing,
  Margin,
} from "./drawing.ts";

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
  const drawing = new Drawing()
    .withA4Size()
    .withMargin(20)
    .withBackgroundColor("#eee");

  assertEquals(drawing.getInnerWidth(), A4_WIDTH_USER_UNITS - 40);
  assertEquals(drawing.getInnerHeight(), A4_HEIGHT_USER_UNITS - 40);
});

Deno.test("withSize sets the drawing dimensions", () => {
  const drawing = new Drawing().withSize(300, 400);

  assertEquals(drawing.getInnerWidth(), 300);
  assertEquals(drawing.getInnerHeight(), 400);
});

Deno.test("withMargin accepts a Margin", () => {
  const drawing = new Drawing()
    .withSize(300, 400)
    .withMargin(new Margin(10, 20, 30, 40));

  assertEquals(drawing.getInnerWidth(), 260); // 300 - 10 - 30
  assertEquals(drawing.getInnerHeight(), 340); // 400 - 20 - 40
});

Deno.test("build returns the margin group", () => {
  const group = new Drawing().withSize(300, 400).build(svgElement());

  assertEquals(group.node.nodeName, "g");
  assertEquals(group.id(), "margin_group");
});

Deno.test("build draws into the given element", () => {
  const element = svgElement();

  const group = new Drawing().withSize(300, 400).build(element);

  assertEquals(group.root().node, element);
});

Deno.test("build sizes the drawing and its viewBox", () => {
  const group = new Drawing().withSize(300, 400).build(svgElement());
  const svg = group.root();

  assertEquals(svg.width(), 300);
  assertEquals(svg.height(), 400);
  assertEquals(svg.viewbox().toString(), "0 0 300 400");
});

Deno.test("build offsets the margin group by the margin", () => {
  const group = new Drawing()
    .withSize(300, 400)
    .withMargin(new Margin(10, 20, 30, 40))
    .build(svgElement());

  assertStringIncludes(group.svg(), "matrix(1,0,0,1,10,20)");
});

Deno.test("build adds a background covering the whole page", () => {
  const group = new Drawing()
    .withSize(300, 400)
    .withMargin(20)
    .withBackgroundColor("#eee")
    .build(svgElement());

  const background = group.root().findOne("#background")?.svg() ?? "";
  assertStringIncludes(background, 'width="300"');
  assertStringIncludes(background, 'height="400"');
  assertStringIncludes(background, 'fill="#eeeeee"');
});

Deno.test("build defaults to a transparent background", () => {
  const group = new Drawing().withSize(300, 400).build(svgElement());

  const background = group.root().findOne("#background");
  assertStringIncludes(background?.svg() ?? "", 'fill="transparent"');
});

Deno.test("build renders shapes added to the group", () => {
  const group = new Drawing().withSize(300, 400).build(svgElement());

  group.rect(10, 20).move(5, 5);

  assertStringIncludes(group.root().svg(), '<rect width="10" height="20"');
});
