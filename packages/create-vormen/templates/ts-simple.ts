import { Drawing, Settings, Vormen } from "@berkes/vormen";

const schema = {};

const draw = (_settings: Record<string, string>) => {
  const drawing = new Drawing().withA4Size();
  const canvas = drawing.build();

  // Draw a single square centered on A4
  canvas
    .rect(100, 100)
    .move(50, 50)
    .fill("none")
    .stroke({ width: 1, color: "black" });

  return drawing.svg();
};

Vormen(draw, new Settings(schema));
