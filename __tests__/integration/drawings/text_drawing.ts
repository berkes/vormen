/**
 * Plottable text drawing for the typography integration test: a rectangle
 * plus a Text element rendered with a bundled Hershey stroke font.
 */
import {
  Drawing,
  type SettingsData,
  SvgFont,
  TextBuilder,
  Vormen,
} from "@berkes/vormen";

const defaults = {
  seed: "text-drawing",
};

const draw = (_rawSettings: SettingsData) => {
  const drawing = new Drawing()
    .withSize(200, 100)
    .withMargin(10)
    .withBackgroundColor("#fff");
  const canvas = drawing.build();

  canvas.rect(50, 50).fill("none").stroke({ color: "#000", width: 1 })
    .move(10, 10);

  const text = new TextBuilder()
    .content("Plottable!")
    .font(SvgFont.named("HersheySans1"))
    .size(12)
    .x(10)
    .y(80)
    .color("#333")
    .strokeWidth(0.8)
    .build();
  text.addTo(canvas).id("label");

  return drawing.svg();
};

Vormen(draw, defaults);
