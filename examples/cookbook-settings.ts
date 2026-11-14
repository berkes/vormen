/**
 * Cookbook: Settings.
 *
 * Declare a schema whose values define each setting's type and default.
 * Settings.parse turns raw values (CLI, web) into typed values. Override on
 * the command line: --setting.strokeWidth=8
 */
import { Drawing, Settings, type SettingsData, Vormen } from "@berkes/vormen";

const defaultSettings = {
  seed: "cookbook-settings",
  strokeWidth: 1,
  size: 80,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withSize(300, 200)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();
  canvas.rect(settings.size, settings.size)
    .fill("none")
    .stroke({ color: "#c0392b", width: settings.strokeWidth })
    .move(30, 60);
  canvas.circle(settings.size / 2)
    .fill("none")
    .stroke({ color: "#2980b9", width: settings.strokeWidth })
    .cx(210)
    .cy(100);
  return drawing.svg();
}

Vormen(draw, defaultSettings);
