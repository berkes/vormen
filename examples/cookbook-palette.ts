/**
 * Cookbook: Palette and Scheme.
 *
 * loadPalette(name) reads a .gpl file from the palettes/ directory next to
 * this file; a Scheme maps palette colors to roles (bg, main, accent) for
 * this drawing. Override the palette: --setting.palette=ocean
 */
import {
  Drawing,
  loadPalette,
  Scheme,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  palette: "sunset",
};

// The palette library of this drawing project: the palettes/ directory next
// to this file, so it works from any working directory.
const paletteDir = new URL("./palettes/", import.meta.url).pathname;

async function draw(rawSettings: SettingsData): Promise<string> {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const palette = await loadPalette(settings.palette, paletteDir);
  const scheme = new Scheme(palette, { bg: 0, main: 1, accent: 2 });
  const drawing = new Drawing()
    .withSize(300, 200)
    .withBackgroundColor(scheme.get("bg"));
  const canvas = drawing.build();
  canvas.rect(90, 120).fill(scheme.get("main")).move(30, 40);
  canvas.circle(40).fill(scheme.get("accent")).cx(210).cy(100);
  return drawing.svg();
}

Vormen(draw, defaultSettings);
