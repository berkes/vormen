import { Drawing, Settings, Vormen } from "@berkes/vormen";

const defaultSettings = new Settings({
  size: 100,
  color: "blue",
});

const draw = (settings: Settings) => {
  const drawing = new Drawing().withSize(
    settings.getInt("size") * 2,
    settings.getInt("size") * 2,
  );
  const canvas = drawing.build();
  canvas
    .rect(settings.getInt("size"), settings.getInt("size"))
    .id("the-rect")
    .fill(settings.getString("color"));
  return drawing;
};

Vormen(draw, defaultSettings);
