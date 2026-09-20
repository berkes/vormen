import { Drawing } from "../../src/vormen/drawing.ts";
import { Vormen } from "../../src/vormen/runner.ts";
import type { Settings } from "../../src/vormen/settings.ts";

const defaultSettings: Settings = {
  size: 100,
  color: "blue",
};

const draw = (settings: Settings) => {
  const drawing = new Drawing().withSize(
    settings.size as number,
    settings.size as number,
  );
  const canvas = drawing.build();
  canvas.rect(settings.size as number / 2, settings.size as number / 2)
    .move(settings.size as number / 4, settings.size as number / 4)
    .fill(settings.color as string);
  return drawing;
};

Vormen(draw, defaultSettings);
