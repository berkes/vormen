import { Drawing, type SettingsData, Vormen } from "@berkes/vormen";

// A drawing without the Settings class: it receives its settings as a plain
// SettingsData record and works with them directly.
const draw = (rawSettings: SettingsData) => {
  const drawing = new Drawing().withSize(100, 100);
  const canvas = drawing.build();
  const label = canvas.text(String(rawSettings.text)).move(10, 50);
  label.font({ size: 16 });
  label.stroke({
    color: "black",
    width: Number(rawSettings.strokeWidth),
  });
  return drawing.svg();
};

Vormen(draw, {
  text: "Vormen without Settings",
  strokeWidth: "2",
});
