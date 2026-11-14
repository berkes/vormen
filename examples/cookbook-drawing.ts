/**
 * Cookbook: the Drawing builder.
 *
 * Standard sizes (A3/A4/A5), margins and background color. Every with*()
 * returns a new Drawing; build() gives the canvas to draw on.
 */
import { Drawing, StandardSize, Vormen } from "@berkes/vormen";

function draw(): string {
  const drawing = new Drawing()
    .withStandardSize(StandardSize.A5)
    .withMargin(15)
    .withBackgroundColor("#f5f0e6");
  const canvas = drawing.build();
  canvas.circle(60).fill("none").stroke({ color: "#333", width: 2 }).cx(75).cy(
    90,
  );
  canvas.rect(80, 40).fill("#c0392b").move(140, 70);
  return drawing.svg();
}

Vormen(draw, {});
