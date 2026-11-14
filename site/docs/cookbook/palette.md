---
sidebar_position: 10
title: Palette and Scheme
---

import useBaseUrl from "@docusaurus/useBaseUrl";

`loadPalette(name)` reads a `.gpl` file from the `palettes/` directory next to the source; `Scheme` maps palette colors to roles for this drawing. Try `--setting.palette=ocean`. Needs the `.gpl` files: see the download links below.

**Download:** <a href={useBaseUrl("/downloads/cookbook-palette.ts")} download>cookbook-palette.ts</a> — run it
as described under [Download and run an example](/examples).

```vorm name="cookbook-palette"
/**
 * Cookbook: Palette and Scheme (inline, self-contained version).
 *
 * A Palette is an ordered set of colors; a Scheme maps roles (bg, main,
 * accent) to palette colors by name or index. With .gpl files on disk you
 * would load them with loadPalette(name) instead. Try --setting.palette=ocean.
 */
import {
  Drawing,
  Palette,
  Scheme,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  palette: "sunset",
};

const palettes: Record<string, Palette> = {
  sunset: new Palette("sunset", [
    { color: "#2E0C3C", name: "Dusk" },
    { color: "#7A225E", name: "Plum" },
    { color: "#CE4C5A", name: "Ember" },
    { color: "#F79458", name: "Apricot" },
    { color: "#FFD68C", name: "Gold" },
  ]),
  ocean: new Palette("ocean", [
    { color: "#0B3C5D", name: "Deep" },
    { color: "#1D6A96", name: "Sea" },
    { color: "#3FA7C4", name: "Wave" },
    { color: "#8FD0D8", name: "Foam" },
    { color: "#D8F3F0", name: "Mist" },
  ]),
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const scheme = new Scheme(palettes[settings.palette], {
    bg: 0,
    main: 2,
    accent: 4,
  });
  const drawing = new Drawing()
    .withSize(300, 200)
    .withBackgroundColor(scheme.get("bg"));
  const canvas = drawing.build();
  canvas.rect(90, 120).fill(scheme.get("main")).move(30, 40);
  canvas.circle(40).fill(scheme.get("accent")).cx(210).cy(100);
  return drawing.svg();
}

Vormen(draw, defaultSettings);
```
