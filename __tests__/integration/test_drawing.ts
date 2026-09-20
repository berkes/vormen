import { Drawing } from "../../src/drawing/drawing.ts";
import { Settings } from "../../src/settings/settings.ts";
import { Vormen } from "../../src/vormen/vormen.ts";

const defaultSettings = new Settings({
  size: 100,
  color: "blue",
});

const draw = (settings: Settings) => {
  const drawing = new Drawing().withSize(
    settings.getInt("size"),
    settings.getInt("size"),
  );
  const canvas = drawing.build();
  canvas.rect(settings.getInt("size") / 2, settings.getInt("size") / 2)
    .move(settings.getInt("size") / 4, settings.getInt("size") / 4)
    .fill(settings.getString("color"));
  return drawing;
};

Vormen(draw, defaultSettings);
