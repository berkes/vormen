import { Drawing, Settings, type SettingsData, Vormen } from "@berkes/vormen";

const schema = {
  size: 100,
  color: "blue",
};

const draw = (rawSettings: SettingsData) => {
  const settings = Settings.parse(schema, rawSettings);
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

Vormen(draw, new Settings(schema));
