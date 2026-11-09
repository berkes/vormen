/**
 * Palettes example.
 *
 * Loads a list of palettes from the palette library and renders each palette
 * as a square with rounded corners. Inside each square, stacked horizontal
 * bars - one per color of the palette, each as wide as the square, with
 * heights decreasing per bar - fill the entire square, clipped to the
 * rounded corners.
 *
 * Run it and redirect the output to a file:
 *   deno run examples/palettes.ts > palettes.svg
 */
import {
  Drawing,
  loadPalette,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

// The palette library of this drawing project: the palettes/ directory next
// to this file, resolved relative to the module so it works from any cwd.
const paletteDir = new URL("./palettes/", import.meta.url).pathname;

// The palettes to render, by name (the Name: header of each .gpl file).
const paletteNames = ["sunset", "ocean", "forest"];

const schema = {
  square: 160,
  cornerRadius: 16,
  gap: 24,
  margin: 40,
} satisfies SettingsData;

async function draw(rawSettings: SettingsData): Promise<string> {
  const settings = Settings.parse(schema, rawSettings);
  const palettes = await Promise.all(
    paletteNames.map((name) => loadPalette(name, paletteDir)),
  );
  const square = settings.square;
  const width = settings.margin * 2 + palettes.length * square +
    (palettes.length - 1) * settings.gap;
  const height = settings.margin * 2 + square;
  const drawing = new Drawing()
    .withSize(width, height)
    .withBackgroundColor("#fdfdfd");
  const canvas = drawing.build();

  palettes.forEach((palette, index) => {
    const x = settings.margin + index * (square + settings.gap);
    const y = settings.margin;
    // Clip the bars to the rounded square
    const clip = canvas.clip().id(`clip-${palette.name}`);
    clip.rect(square, square).radius(settings.cornerRadius).move(x, y);
    const bars = canvas.group().clipWith(clip).id(`palette-${palette.name}`);
    // Stacked horizontal bars, one per color, height decreasing per bar,
    // together filling the entire square
    const count = palette.size;
    const total = (count * (count + 1)) / 2;
    let barY = y;
    palette.colors.forEach((color, bar) => {
      const barHeight = (square * (count - bar)) / total;
      bars.rect(square, barHeight).fill(color).move(x, barY);
      barY += barHeight;
    });
    // Rounded square outline on top of the bars
    canvas.rect(square, square).radius(settings.cornerRadius).move(x, y)
      .fill("none")
      .stroke({ color: "#222", width: 1 });
  });

  return drawing.svg();
}

Vormen(draw, schema);
