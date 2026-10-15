import { Drawing, Settings, Vormen } from "@berkes/vormen";

const schema = {
  text: "Vormen",
  strokeWidth: 1,
};

function draw(rawSettings: Record<string, string>): string {
  const settings = Settings.fromCLI(schema, rawSettings);
  const drawing = new Drawing().withSize(100, 100);
  const canvas = drawing.build();
  const label = canvas.text(settings.text).move(10, 50);
  label.font({ size: 16 });
  label.stroke({ color: "black", width: settings.strokeWidth });
  return drawing.svg();
}

Vormen(draw, new Settings(schema));
