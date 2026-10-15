import { Drawing, Settings, type SettingsData, Vormen } from "@berkes/vormen";

const defaults = {
  size: 100,
  color: "blue",
};

const draw = (rawSettings: SettingsData) => {
  const settings = Settings.parse(defaults, rawSettings);
  const drawing = new Drawing().withSize(
    settings.size * 2,
    settings.size * 2,
  );
  const canvas = drawing.build();
  canvas
    .rect(settings.size, settings.size)
    .id("the-rect")
    .fill(settings.color);
  return drawing.svg();
};

Vormen(draw, defaults);
