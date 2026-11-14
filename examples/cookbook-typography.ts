/**
 * Cookbook: Typography — Text and SvgFont.
 *
 * Text renders as pen-stroke paths (no SVG <text>), using a bundled SVG stroke
 * font. The text setting can be overridden: --setting.text=Hello
 */
import {
  Drawing,
  Settings,
  type SettingsData,
  SvgFont,
  TextBuilder,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  text: "Plotter 123",
  size: 28,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withSize(360, 160)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();
  new TextBuilder()
    .content(settings.text)
    .font(SvgFont.named("EMSTech"))
    .size(settings.size)
    .x(20)
    .y(110)
    .color("#222222")
    .strokeWidth(1)
    .build()
    .addTo(canvas);
  return drawing.svg();
}

Vormen(draw, defaultSettings);
