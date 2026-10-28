import { Drawing, Settings, type SettingsData, Vormen } from "@berkes/vormen";

const defaults = {
  strokeWidth: 2,
};

const draw = (rawSettings: SettingsData) => {
  const settings = Settings.parse(defaults, rawSettings);
  const drawing = new Drawing().withSize(100, 100);
  const canvas = drawing.build();
  canvas
    .rect(50, 50)
    .move(25, 25)
    .fill("none")
    .stroke({ color: "black", width: settings.strokeWidth });
  return drawing.svg();
};

Vormen(draw, defaults);
