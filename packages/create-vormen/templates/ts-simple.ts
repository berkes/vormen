import { Drawing, Settings, Vormen } from "@berkes/vormen";

const settings = new Settings({});

const draw = () => {
  const drawing = new Drawing().withA4Size();
  const canvas = drawing.build();

  // Draw a single square centered on A4
  canvas
    .rect(100, 100)
    .move(50, 50)
    .fill("none")
    .stroke({ width: 1, color: "black" });

  return drawing;
};

Vormen(draw, settings);
