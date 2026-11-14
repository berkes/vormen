---
sidebar_position: 9
title: Settings
---

import useBaseUrl from "@docusaurus/useBaseUrl";

Declare a schema whose values define each setting's type and default; `Settings.parse` turns raw CLI values into typed settings. The two SVGs differ only in `--setting.strokeWidth` (1 and 8).

**Download:** <a href={useBaseUrl("/downloads/cookbook-settings.ts")} download>cookbook-settings.ts</a> — run it
as described under [Download and run an example](/examples).

```vorm name="cookbook-settings"
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
```

With `--setting.strokeWidth=8`:

```vorm name="cookbook-settings-8" settings={"strokeWidth": 8}
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
```
