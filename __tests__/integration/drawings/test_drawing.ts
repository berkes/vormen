import { Drawing, Settings, Vormen } from "@berkes/vormen";

const schema = {
  size: 100,
  color: "blue",
};

const draw = (rawSettings: Record<string, string>) => {
  const settings = Settings.fromCLI(schema, rawSettings);
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
