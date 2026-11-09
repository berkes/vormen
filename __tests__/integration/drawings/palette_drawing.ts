import {
  Drawing,
  loadPalette,
  Scheme,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaults = {
  scheme: "wet-tokyo",
} satisfies SettingsData;

async function draw(rawSettings: SettingsData): Promise<string> {
  const settings = Settings.parse(defaults, rawSettings);
  const palette = await loadPalette(settings.scheme);
  const scheme = new Scheme(palette, { bg: "Ink", main: 1, accent: 2 });
  const drawing = new Drawing()
    .withSize(100, 100)
    .withBackgroundColor(scheme.get("bg"));
  const canvas = drawing.build();
  canvas.rect(50, 50).id("main").fill(scheme.get("main")).move(10, 10);
  canvas.rect(20, 20).id("accent").fill(scheme.get("accent")).move(60, 60);
  return drawing.svg();
}

Vormen(draw, defaults);
