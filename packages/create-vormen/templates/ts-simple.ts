import {
  Drawing,
  Settings,
  type SettingsData,
  StandardSize,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  strokeWidth: 1,
};

const draw = (rawSettings: SettingsData) => {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing().withStandardSize(StandardSize.A4);
  const canvas = drawing.build();

  // Draw a single square centered on A4
  canvas
    .rect(100, 100)
    .move(50, 50)
    .fill("none")
    .stroke({ width: settings.strokeWidth, color: "black" });

  return drawing.svg();
};

Vormen(draw, defaultSettings);
