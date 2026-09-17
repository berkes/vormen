import { Drawing } from "@berkes/vormen";
import { Circle, registerWindow } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";

const window = createSVGWindow();
registerWindow(window, window.document);

const drawing = new Drawing(window.document.documentElement).withA5Size()
  .withMargin(20).withBackgroundColor("white");

const svg = drawing.build();

// Sun
svg.add(new Circle().radius(100).fill("red").center(100, 100));

console.log(svg.root().svg());
